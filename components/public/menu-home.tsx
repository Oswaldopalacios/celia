"use client";

import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { CategoryGlyph } from "@/components/public/category-glyph";
import { PublicMenuButton } from "@/components/public/menu-button";
import { AddToOrderButton } from "@/components/public/order/order-stepper";
import { PortionPrices } from "@/components/public/order/portion-picker";
import { PublicFrame } from "@/components/public/public-frame";
import {
  fadeUp,
  softScale,
  staggerFast,
  staggerSoft,
} from "@/components/public/public-motion";
import { ProductImage } from "@/components/ui/product-image";
import { SectionMark } from "@/components/public/celia-marks";
import { useCategories, useProducts } from "@/hooks/use-products";
import { resolveCategoryIcon, type CategoryIconId } from "@/lib/category-icons";
import type { Product, ProductCategory } from "@/lib/types";

type FilterId = "all" | typeof DRINKS_FILTER | string;

type MenuGroupData = {
  category: ProductCategory | null;
  title: string;
  products: Product[];
};

const DRINKS_FILTER = "__bebidas__";
const FEATURED_AUTOPLAY_MS = 4500;

function isDrink(product: Product) {
  return (product.category?.kind ?? product.productType) === "bebidas";
}

export function MenuHome() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [drinkFilter, setDrinkFilter] = useState<"all" | string>("all");

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loading = productsQuery.isLoading || categoriesQuery.isLoading;

  const foodCategories = categories.filter((c) => c.kind !== "bebidas");
  const drinkCategories = categories.filter((c) => c.kind === "bebidas");

  const selectFilter = (
    next: FilterId,
    drinkCategory: "all" | string = "all",
  ) => {
    setFilter(next);
    setDrinkFilter(drinkCategory);
  };

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term) ||
        (product.category?.title ?? "").toLowerCase().includes(term);
      const matchesCategory =
        filter === "all" ||
        (filter === DRINKS_FILTER
          ? isDrink(product) &&
            (drinkFilter === "all" || product.category?._id === drinkFilter)
          : product.category?._id === filter);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, filter, drinkFilter]);

  const featured = useMemo(() => {
    if (search.trim() || filter !== "all") return [];
    return products.filter((product) => product.isFeatured);
  }, [products, search, filter]);

  const grouped = useMemo(() => {
    const order = new Map(categories.map((c, i) => [c._id, i]));
    const groups = new Map<string, MenuGroupData>();

    for (const product of visibleProducts) {
      const id = product.category?._id ?? "__none__";
      const existing = groups.get(id);
      if (existing) {
        existing.products.push(product);
      } else {
        groups.set(id, {
          category: product.category ?? null,
          title: product.category?.title ?? "Sin categoría",
          products: [product],
        });
      }
    }

    const sorted = [...groups.values()].sort((a, b) => {
      if (!a.category) return 1;
      if (!b.category) return -1;
      return (
        (order.get(a.category._id) ?? 99) - (order.get(b.category._id) ?? 99)
      );
    });

    return {
      food: sorted.filter((group) => group.category?.kind !== "bebidas"),
      drinks: sorted.filter((group) => group.category?.kind === "bebidas"),
    };
  }, [visibleProducts, categories]);

  const showPreview = filter === "all" && !search.trim();
  const drinksCount = grouped.drinks.reduce(
    (total, group) => total + group.products.length,
    0,
  );

  return (
    <PublicFrame>
      <header className="relative">
        <motion.div
          className="relative h-[236px] overflow-hidden bg-[#EAD7BD] lg:h-[min(52vw,620px)]"
          variants={softScale}
          initial="hidden"
          animate="visible"
        >
          <HeaderPhoto />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF3E6]" />
          <div className="absolute right-3 top-4 z-10 lg:hidden">
            <PublicMenuButton light={false} />
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 -mt-5 px-5 lg:-mt-8 lg:mx-auto lg:max-w-2xl lg:px-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.12 }}
        >
          <label className="flex h-12 items-center gap-3 rounded-full bg-white px-4 shadow-[0_8px_24px_rgba(58,34,24,0.08)] ring-1 ring-[#3A2218]/6 lg:h-14 lg:px-5">
            <MagnifyingGlass size={18} className="text-[#B09A89]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar platillos..."
              className="w-full bg-transparent text-[14px] text-[#3A2218] outline-none placeholder:text-[#B09A89] lg:text-[15px]"
              aria-label="Buscar platillos"
            />
          </label>
        </motion.div>
      </header>

      <motion.div
        className="mt-5 px-4 lg:mt-8 lg:px-8"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        <div
          className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-wrap lg:justify-center lg:gap-x-10 lg:gap-y-3 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Categorías"
        >
          <motion.div variants={fadeUp}>
            <FilterChip
              label="Todos"
              icon="fork-knife"
              active={filter === "all"}
              onClick={() => selectFilter("all")}
            />
          </motion.div>
          {foodCategories.map((category) => (
            <motion.div key={category._id} variants={fadeUp}>
              <FilterChip
                label={category.title}
                icon={resolveCategoryIcon(category)}
                active={filter === category._id}
                onClick={() => selectFilter(category._id)}
              />
            </motion.div>
          ))}
          {drinkCategories.length > 0 && (
            <motion.div variants={fadeUp}>
              <FilterChip
                label="Bebidas"
                icon="pint-glass"
                active={filter === DRINKS_FILTER}
                onClick={() => selectFilter(DRINKS_FILTER)}
              />
            </motion.div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {filter === DRINKS_FILTER && drinkCategories.length > 1 && (
            <motion.div
              key="drink-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-wrap lg:justify-center lg:overflow-visible [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Tipos de bebida"
              >
                <SubFilterPill
                  label="Todas"
                  active={drinkFilter === "all"}
                  onClick={() => setDrinkFilter("all")}
                />
                {drinkCategories.map((category) => (
                  <SubFilterPill
                    key={category._id}
                    label={category.title}
                    icon={resolveCategoryIcon(category)}
                    active={drinkFilter === category._id}
                    onClick={() => setDrinkFilter(category._id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {loading ? (
        <MenuSkeleton />
      ) : productsQuery.isError ? (
        <p className="px-6 py-16 text-center text-sm text-[#7A6254]">
          No pudimos cargar el menú. Intenta de nuevo.
        </p>
      ) : visibleProducts.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-[#7A6254]">
          {products.length === 0
            ? "El menú se está preparando. Vuelve pronto."
            : "No encontramos platillos con esa búsqueda."}
        </p>
      ) : (
        <motion.div
          key={`${filter}-${drinkFilter}-${search.trim()}`}
          initial="hidden"
          animate="visible"
          variants={staggerSoft}
        >
          {featured.length > 0 && (
            <motion.section
              className="mt-6 px-5 lg:mx-auto lg:mt-10 lg:max-w-6xl lg:px-8"
              variants={fadeUp}
            >
              <SectionHeading title="Platillos destacados" href="#menu" />
              <div className="mt-3 lg:mt-5">
                <FeaturedCarousel products={featured} />
              </div>
            </motion.section>
          )}

          <motion.section
            id="menu"
            className="mt-7 px-5 pb-4 lg:mx-auto lg:mt-12 lg:max-w-6xl lg:px-8 lg:pb-8"
            variants={fadeUp}
          >
            <SectionHeading title="Nuestro menú" />
            <div className="mt-4 space-y-6">
              {grouped.food.map((group) => (
                <MenuGroup
                  key={group.category?._id ?? group.title}
                  group={group}
                  preview={showPreview}
                  onSeeAll={
                    group.category
                      ? () => selectFilter(group.category!._id)
                      : undefined
                  }
                />
              ))}

              {grouped.drinks.length > 0 && (
                <motion.div variants={fadeUp}>
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#3A2218]/8 pb-2.5">
                    <div className="flex items-center gap-2 text-[#3A2218]">
                      <CategoryGlyph icon="pint-glass" className="size-5" />
                      <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold uppercase tracking-[0.08em] lg:text-[16px]">
                        Bebidas
                      </h3>
                      <span className="rounded-full bg-[#3A2218]/8 px-2 py-0.5 text-[10px] font-bold text-[#3A2218]">
                        {drinksCount}
                      </span>
                    </div>
                    {showPreview && (
                      <button
                        type="button"
                        onClick={() => selectFilter(DRINKS_FILTER)}
                        className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#C62A1E]"
                      >
                        Ver todas
                        <CaretRight size={12} weight="bold" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-5">
                    {grouped.drinks.map((group) => (
                      <MenuGroup
                        key={group.category?._id ?? group.title}
                        group={group}
                        nested
                        preview={showPreview}
                        onSeeAll={
                          group.category
                            ? () =>
                                selectFilter(DRINKS_FILTER, group.category!._id)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </PublicFrame>
  );
}

function FeaturedCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const count = products.length;

  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : Math.min(current, count - 1)));
  }, [count]);

  const goTo = useEffectEvent((next: number, dir: number) => {
    if (count <= 1) return;
    setDirection(dir);
    setIndex(((next % count) + count) % count);
  });

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => {
      goTo(index + 1, 1);
    }, FEATURED_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count, index]);

  if (count === 0) return null;

  const product = products[index] ?? products[0];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="relative overflow-hidden rounded-[22px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={product._id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <FeaturedCard product={product} horizontal highlight />
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-2 lg:flex">
            <button
              type="button"
              onClick={() => goTo(index - 1, -1)}
              className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.14)] transition hover:text-[#C62A1E]"
              aria-label="Platillo destacado anterior"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1, 1)}
              className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.14)] transition hover:text-[#C62A1E]"
              aria-label="Siguiente platillo destacado"
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>

          <div
            className="mt-3 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Platillos destacados"
          >
            {products.map((item, itemIndex) => {
              const active = itemIndex === index;
              return (
                <button
                  key={item._id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Ver ${item.name}`}
                  onClick={() => goTo(itemIndex, itemIndex > index ? 1 : -1)}
                  className={`h-2 rounded-full transition-all ${
                    active
                      ? "w-6 bg-[#C62A1E]"
                      : "w-2 bg-[#3A2218]/20 hover:bg-[#3A2218]/35"
                  }`}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: CategoryIconId;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="flex min-w-[56px] shrink-0 flex-col items-center gap-1.5 lg:min-w-[72px]"
    >
      <span className={active ? "text-[#C62A1E]" : "text-[#3A2218]"}>
        <CategoryGlyph
          icon={icon}
          className="size-7 lg:size-8"
          weight={active ? "fill" : "regular"}
        />
      </span>
      <span
        className={`max-w-[76px] truncate text-center font-[family-name:var(--font-nunito)] text-[11px] font-semibold leading-tight lg:max-w-none lg:text-[13px] ${
          active ? "text-[#C62A1E]" : "text-[#3A2218]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function SubFilterPill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: CategoryIconId;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold transition ${
        active
          ? "bg-[#3A2218] text-white shadow-[0_6px_16px_rgba(58,34,24,0.18)]"
          : "bg-white text-[#3A2218] ring-1 ring-[#3A2218]/10 hover:ring-[#3A2218]/25"
      }`}
    >
      {icon ? (
        <CategoryGlyph
          icon={icon}
          className="size-4"
          weight={active ? "fill" : "regular"}
        />
      ) : null}
      {label}
    </button>
  );
}

function MenuGroup({
  group,
  preview,
  nested = false,
  onSeeAll,
}: {
  group: MenuGroupData;
  preview: boolean;
  nested?: boolean;
  onSeeAll?: () => void;
}) {
  const items = preview ? group.products.slice(0, 2) : group.products;
  const icon = resolveCategoryIcon(group.category ?? { title: group.title });

  return (
    <motion.div variants={fadeUp}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className={`flex items-center gap-2 ${nested ? "text-[#C62A1E]" : "text-[#3A2218]"}`}
        >
          <CategoryGlyph
            icon={icon}
            className={nested ? "size-4" : "size-5"}
            weight={nested ? "fill" : "regular"}
          />
          <h3
            className={
              nested
                ? "font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-[0.04em] lg:text-[14px]"
                : "font-[family-name:var(--font-display)] text-[15px] font-bold uppercase tracking-[0.08em] lg:text-[16px]"
            }
          >
            {group.title}
          </h3>
        </div>
        {onSeeAll && preview && group.products.length > 2 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#C62A1E]"
          >
            Ver todos
            <CaretRight size={12} weight="bold" />
          </button>
        )}
      </div>
      <motion.div
        className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0"
        variants={staggerFast}
      >
        {items.map((product) => (
          <motion.div key={product._id} variants={fadeUp}>
            <MenuRow product={product} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function SectionHeading({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        <SectionMark className="h-3 w-7 text-[#C62A1E]" />
        <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.14em] text-[#3A2218] lg:text-[15px]">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#C62A1E]"
        >
          Ver todos
          <CaretRight size={12} weight="bold" />
        </Link>
      ) : null}
    </div>
  );
}

function HeaderPhoto() {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/landing/Headerv2.png"
      alt="Fachada del restaurante Doña Celia"
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-cover object-center lg:object-[center_28%]"
    />
  );
}

function FeaturedCard({
  product,
  horizontal = false,
  highlight = false,
  className = "",
}: {
  product: Product;
  horizontal?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/platillo/${product._id}`}
      className={`block overflow-hidden rounded-[22px] bg-white shadow-[0_10px_28px_rgba(58,34,24,0.08)] transition-shadow lg:hover:shadow-[0_16px_36px_rgba(58,34,24,0.12)] ${
        horizontal ? "lg:mx-auto lg:flex lg:max-w-4xl" : ""
      } ${className}`}
    >
      <div
        className={`relative aspect-[16/10] ${
          horizontal ? "lg:aspect-auto lg:h-[280px] lg:w-[52%] lg:shrink-0" : ""
        }`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          productType={product.productType}
          fill
          className="object-cover"
          sizes={
            horizontal
              ? "(min-width: 1024px) 520px, 400px"
              : "(min-width: 1024px) 360px, 400px"
          }
        />
        {highlight ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#C62A1E] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
            <Star size={11} weight="fill" />
            Destacado
          </span>
        ) : null}
      </div>
      <div
        className={`px-4 pb-4 pt-3 ${
          horizontal
            ? "lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8"
            : ""
        }`}
      >
        <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold leading-tight text-[#3A2218] lg:text-[24px]">
          {product.name}
        </h2>
        {product.description?.trim() ? (
          <p className="mt-1 line-clamp-2 text-[13px] font-normal leading-5 text-[#7A6254] lg:text-[15px] lg:leading-6">
            {product.description}
          </p>
        ) : null}
        <div className="mt-2">
          <PortionPrices product={product} size="lg" />
        </div>
      </div>
    </Link>
  );
}

function MenuRow({ product }: { product: Product }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[22px] bg-white p-2.5 pr-3 shadow-[0_8px_24px_rgba(58,34,24,0.06)] transition-shadow lg:p-3 lg:hover:shadow-[0_12px_28px_rgba(58,34,24,0.1)] ${
        product.isSoldOut ? "opacity-70" : ""
      }`}
    >
      <Link
        href={`/platillo/${product._id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative size-[74px] shrink-0 overflow-hidden rounded-[16px] bg-[#F1E3CB] lg:size-[88px]">
          <ProductImage
            src={product.image}
            alt={product.name}
            productType={product.productType}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 88px, 74px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-display)] truncate text-[16px] font-semibold text-[#3A2218] lg:text-[18px]">
            {product.name}
          </h3>
          {product.description?.trim() ? (
            <p className="mt-0.5 line-clamp-2 text-[12.5px] font-normal leading-5 text-[#7A6254]">
              {product.description}
            </p>
          ) : null}
          <div className="mt-1">
            <PortionPrices product={product} />
          </div>
        </div>
      </Link>
      <div className="shrink-0 self-end pb-0.5">
        <AddToOrderButton product={product} />
      </div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="mt-6 space-y-4 px-5 lg:mx-auto lg:max-w-6xl lg:px-8">
      <div className="h-[220px] animate-pulse rounded-[22px] bg-white/80 lg:h-[280px]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="size-[72px] animate-pulse rounded-2xl bg-white/80" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/80" />
            <div className="h-3 w-full animate-pulse rounded bg-white/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  PackageOpen,
  PackageSearch,
  PencilLine,
  Plus,
  Search,
  Star,
  Trash2,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DeleteProductModal } from "@/components/products/delete-product-modal";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { ProductImage } from "@/components/ui/product-image";
import {
  dashboardBtnPrimary,
  dashboardPageSubtitle,
  dashboardPageTitle,
  dashboardTabActive,
  dashboardTabInactive,
  dashboardTabTrack,
} from "@/lib/dashboard-theme";
import { useCategories, useProducts, useUpdateProduct } from "@/hooks/use-products";
import { getApiErrorMessage } from "@/lib/api";
import type { Product, ProductType } from "@/lib/types";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const LONG_PRESS_MS = 420;

type TypeFilter = "all" | ProductType;

function productTypeOf(product: Product): ProductType {
  return product.productType === "bebidas" ? "bebidas" : "comida";
}

function ProductCard({
  product,
  index,
  actionsOpen,
  onOpenActions,
  onCloseActions,
  onEdit,
  onDelete,
  onToggleFeatured,
  featuredPending,
}: {
  product: Product;
  index: number;
  actionsOpen: boolean;
  onOpenActions: () => void;
  onCloseActions: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  featuredPending?: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const didLongPress = useRef(false);
  const isDrink = productTypeOf(product) === "bebidas";
  const portions = product.portions ?? [];
  const isFeatured = Boolean(product.isFeatured);

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (!actionsOpen) return;

    const handleOutside = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        onCloseActions();
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [actionsOpen, onCloseActions]);

  useEffect(() => () => clearLongPress(), []);

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "mouse") return;

    didLongPress.current = false;
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => {
      didLongPress.current = true;
      onOpenActions();
    }, LONG_PRESS_MS);
  };

  const handlePointerEnd = () => {
    clearLongPress();
  };

  const handleImageClick = () => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    if (actionsOpen) onCloseActions();
    else onOpenActions();
  };

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.35 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_8px_28px_rgba(58,34,24,0.035)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(58,34,24,0.09)] ${
        actionsOpen
          ? "border-[#3A2218]/20 ring-2 ring-[#3A2218]/15"
          : "border-[#3A2218]/[0.07]"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F1E3CB]">
        <button
          type="button"
          onClick={handleImageClick}
          className="absolute inset-0 z-[1] cursor-pointer"
          aria-label={`Acciones de ${product.name}`}
        />
        <ProductImage
          src={product.image}
          alt={product.name}
          productType={product.productType}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${
                isDrink
                  ? "bg-[#2F6B3A]/95 text-white"
                  : "bg-white/92 text-[#C62A1E]"
              }`}
            >
              {isDrink ? "Bebida" : "Comida"}
            </span>
            {product.isSoldOut && (
              <span className="rounded-full bg-[#C62A1E]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                Agotado
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#3A2218]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                <Star className="size-2.5 fill-current" />
                Destacado
              </span>
            )}
          </div>
          <div
            className={`pointer-events-auto flex gap-1.5 transition ${
              actionsOpen
                ? "opacity-100"
                : "opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <button
              type="button"
              disabled={featuredPending}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFeatured();
              }}
              className={`grid size-9 place-items-center rounded-lg shadow-sm backdrop-blur transition md:size-8 ${
                isFeatured
                  ? "bg-[#C62A1E] text-white hover:bg-[#A5221A]"
                  : "bg-white/95 text-[#3A2218] hover:bg-white hover:text-[#C62A1E]"
              } disabled:opacity-60`}
              aria-label={
                isFeatured
                  ? `Quitar ${product.name} de destacados`
                  : `Destacar ${product.name}`
              }
              aria-pressed={isFeatured}
            >
              <Star
                className="size-4"
                fill={isFeatured ? "currentColor" : "none"}
              />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCloseActions();
                onEdit();
              }}
              className="grid size-9 place-items-center rounded-lg bg-white/95 text-[#3A2218] shadow-sm backdrop-blur transition hover:bg-white hover:text-[#3A2218] md:size-8"
              aria-label={`Editar ${product.name}`}
            >
              <PencilLine className="size-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCloseActions();
                onDelete();
              }}
              className="grid size-9 place-items-center rounded-lg bg-white/95 text-red-500 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-600 md:size-8"
              aria-label={`Eliminar ${product.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
        {(portions.length > 0 ||
          (product.quantity?.trim() && product.quantity.trim() !== "1")) && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-[2]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3A2218]/92 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#E9A83B] shadow-[0_6px_16px_rgba(43,23,14,0.28)] backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#E9A83B]" aria-hidden />
              {portions.length > 0
                ? `${portions.length} ${portions.length === 1 ? "porción" : "porciones"}`
                : product.quantity}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-[family-name:var(--font-display)] truncate text-sm font-semibold text-[#3A2218]">
          {product.name}
        </h3>
        {product.description?.trim() ? (
          <p className="mt-1 line-clamp-2 flex-1 text-xs leading-5 text-[#7A6254]">
            {product.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        {portions.length > 1 ? (
          <ul className="mt-3 space-y-1">
            {portions.map((portion) => (
              <li
                key={portion._id}
                className="flex items-baseline justify-between gap-2 border-b border-dashed border-[#3A2218]/10 pb-1 last:border-b-0 last:pb-0"
              >
                <span className="truncate text-xs font-semibold text-[#7A6254]">
                  {portion.name}
                </span>
                <span className="font-[family-name:var(--font-nunito)] text-sm font-extrabold tracking-[-0.02em] text-[#C62A1E]">
                  {currency.format(portion.price)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-[family-name:var(--font-nunito)] mt-3 text-lg font-extrabold tracking-[-0.03em] text-[#C62A1E]">
            {currency.format(product.price)}
            {portions[0] ? (
              <span className="ml-1.5 text-xs font-semibold tracking-normal text-[#7A6254]">
                {portions[0].name}
              </span>
            ) : null}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default function ProductosPage() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const updateProduct = useUpdateProduct();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [actionsProductId, setActionsProductId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null,
  );

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const typeCounts = useMemo(() => {
    let comida = 0;
    let bebidas = 0;
    for (const product of products) {
      if (productTypeOf(product) === "bebidas") bebidas += 1;
      else comida += 1;
    }
    return { all: products.length, comida, bebidas };
  }, [products]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const product of products) {
      if (typeFilter !== "all" && productTypeOf(product) !== typeFilter) {
        continue;
      }
      const id = product.category?._id;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return categories
      .filter((category) => {
        if (typeFilter === "all") return counts.has(category._id);
        const kind = category.kind === "bebidas" ? "bebidas" : "comida";
        return kind === typeFilter && counts.has(category._id);
      })
      .map((category) => ({
        ...category,
        count: counts.get(category._id) ?? 0,
      }));
  }, [products, categories, typeFilter]);

  useEffect(() => {
    if (categoryFilter === "all") return;
    if (!categoryOptions.some((c) => c._id === categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryOptions, categoryFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term) ||
        (product.category?.title ?? "").toLowerCase().includes(term);
      const matchesType =
        typeFilter === "all" || productTypeOf(product) === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || product.category?._id === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [products, search, typeFilter, categoryFilter]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<
      string,
      { id: string; title: string; products: Product[] }
    >();

    for (const product of filtered) {
      const id = product.category?._id ?? "__none__";
      const title = product.category?.title ?? "Sin categoría";
      const existing = groups.get(id);
      if (existing) {
        existing.products.push(product);
      } else {
        groups.set(id, { id, title, products: [product] });
      }
    }

    const knownOrder = new Map(categories.map((c, i) => [c._id, i]));

    return [...groups.values()].sort((a, b) => {
      if (a.id === "__none__") return 1;
      if (b.id === "__none__") return -1;
      const ai = knownOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bi = knownOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.title.localeCompare(b.title, "es");
    });
  }, [filtered, categories]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const toggleFeatured = async (product: Product) => {
    if (!product.category?._id || togglingFeaturedId) return;

    setTogglingFeaturedId(product._id);
    try {
      await updateProduct.mutateAsync({
        id: product._id,
        payload: {
          name: product.name,
          description: product.description ?? "",
          price: String(product.price),
          quantity: product.quantity?.trim() || "1",
          productType: productTypeOf(product),
          category: product.category._id,
          isSoldOut: Boolean(product.isSoldOut),
          isFeatured: !product.isFeatured,
          image: null,
        },
      });
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const selectType = (next: TypeFilter) => {
    setTypeFilter(next);
    setCategoryFilter("all");
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 sm:px-8 lg:px-10 lg:pt-9">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <h1 className={dashboardPageTitle}>Productos</h1>
            <p className={dashboardPageSubtitle}>
              {productsQuery.isLoading
                ? "Cargando catálogo..."
                : `${filtered.length} de ${products.length} producto${products.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className={`${dashboardBtnPrimary} hover:-translate-y-0.5`}
          >
            <Plus className="size-4" />
            Nuevo producto
          </button>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6 space-y-3"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B09A89]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto o categoría..."
                className="h-11 w-full rounded-xl border border-[#3A2218]/8 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[#B09A89] focus:border-[#C62A1E]/40 focus:ring-4 focus:ring-[#C62A1E]/8"
                aria-label="Buscar producto"
              />
            </label>

            <div
              className={`grid grid-cols-3 gap-1 sm:max-w-md sm:flex-1 ${dashboardTabTrack}`}
              role="tablist"
              aria-label="Filtrar por tipo"
            >
              {(
                [
                  { id: "all" as const, label: "Todos", count: typeCounts.all },
                  {
                    id: "comida" as const,
                    label: "Comida",
                    count: typeCounts.comida,
                    icon: UtensilsCrossed,
                  },
                  {
                    id: "bebidas" as const,
                    label: "Bebidas",
                    count: typeCounts.bebidas,
                    icon: Wine,
                  },
                ] as const
              ).map((tab) => {
                const active = typeFilter === tab.id;
                const Icon = "icon" in tab ? tab.icon : null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectType(tab.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-center transition ${
                      active ? dashboardTabActive : dashboardTabInactive
                    }`}
                  >
                    {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
                    <span className="text-[12px] font-bold leading-tight">
                      {tab.label}
                    </span>
                    <span
                      className={`text-[11px] font-semibold tabular-nums ${
                        active ? "text-[#C62A1E]" : "text-[#A08A7B]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {categoryOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`h-9 cursor-pointer rounded-full px-4 text-xs font-semibold transition ${
                  categoryFilter === "all"
                    ? "bg-[#C62A1E] text-white"
                    : "border border-[#3A2218]/10 bg-white text-[#7A6254] hover:border-[#C62A1E]/40"
                }`}
              >
                Todas las categorías
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setCategoryFilter(category._id)}
                  className={`h-9 cursor-pointer rounded-full px-4 text-xs font-semibold transition ${
                    categoryFilter === category._id
                      ? "bg-[#3A2218] text-white"
                      : "border border-[#3A2218]/10 bg-white text-[#7A6254] hover:border-[#3A2218]/25"
                  }`}
                >
                  {category.title}
                  <span className="ml-1.5 tabular-nums opacity-70">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {productsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#3A2218]/[0.07] bg-white"
              >
                <div className="aspect-[4/3] bg-[#F1E3CB]" />
                <div className="space-y-2.5 p-4">
                  <div className="h-3.5 w-3/5 rounded bg-[#F1E3CB]" />
                  <div className="h-2.5 w-full rounded bg-[#F3EBDD]" />
                  <div className="h-5 w-2/5 rounded bg-[#F1E3CB]" />
                </div>
              </div>
            ))}
          </div>
        ) : productsQuery.isError ? (
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[#3A2218]/15 bg-white/60 px-6 text-center">
            <div>
              <PackageOpen className="mx-auto mb-3 size-10 text-[#B09A89]" />
              <p className="font-semibold text-[#3A2218]">
                No se pudo cargar el catálogo
              </p>
              <p className="mt-1 text-sm text-[#7A6254]">
                Verifica que el servidor esté activo e intenta de nuevo.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[#3A2218]/15 bg-white/60 px-6 text-center"
          >
            <div>
              <PackageSearch className="mx-auto mb-3 size-10 text-[#B09A89]" />
              <p className="font-semibold text-[#3A2218]">
                {products.length === 0
                  ? "Tu catálogo está vacío"
                  : "Sin resultados"}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-[#7A6254]">
                {products.length === 0
                  ? "Crea tu primer producto para comenzar a construir tu catálogo."
                  : "No encontramos productos con esos filtros. Prueba con otro tipo o categoría."}
              </p>
              {products.length === 0 && (
                <button
                  onClick={openCreate}
                  className={`${dashboardBtnPrimary} mx-auto mt-5`}
                >
                  <Plus className="size-4" />
                  Crear producto
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {groupedByCategory.map((group) => (
              <section key={group.id} aria-labelledby={`cat-${group.id}`}>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2
                      id={`cat-${group.id}`}
                      className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.02em] text-[#3A2218]"
                    >
                      {group.title}
                    </h2>
                    <p className="mt-0.5 text-[12px] text-[#7A6254]">
                      {group.products.length} producto
                      {group.products.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-[#3A2218]/8 mb-2 max-w-none" />
                </div>

                <motion.div
                  layout
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  <AnimatePresence mode="popLayout">
                    {group.products.map((product, index) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        index={index}
                        actionsOpen={actionsProductId === product._id}
                        onOpenActions={() => setActionsProductId(product._id)}
                        onCloseActions={() =>
                          setActionsProductId((id) =>
                            id === product._id ? null : id,
                          )
                        }
                        onEdit={() => openEdit(product)}
                        onDelete={() => setDeleting(product)}
                        onToggleFeatured={() => toggleFeatured(product)}
                        featuredPending={togglingFeaturedId === product._id}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            ))}
          </div>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        product={editing}
      />

      <DeleteProductModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        product={deleting}
      />
    </DashboardShell>
  );
}

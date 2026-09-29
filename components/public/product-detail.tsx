"use client";

import {
  ArrowLeft,
  ChefHat,
  CheckCircle,
  CookingPot,
  Plus,
  Star,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CategoryGlyph } from "@/components/public/category-glyph";
import { PublicMenuButton } from "@/components/public/menu-button";
import { PublicFrame } from "@/components/public/public-frame";
import { PublicLogo } from "@/components/public/public-logo";
import {
  fadeIn,
  fadeUp,
  softScale,
  staggerFast,
  staggerSoft,
} from "@/components/public/public-motion";
import { ProductImage } from "@/components/ui/product-image";
import { SectionMark } from "@/components/public/celia-marks";
import { QuantityStepper } from "@/components/public/order/order-stepper";
import { PortionOrderList } from "@/components/public/order/portion-picker";
import { useOrder } from "@/hooks/use-order";
import { useProducts } from "@/hooks/use-products";
import { orderLineId } from "@/lib/order-store";
import { defaultPortion, hasPortionChoice } from "@/lib/portions";
import type { Product } from "@/lib/types";
import { resolveCategoryIcon } from "@/lib/category-icons";
import { categoryIconKey, formatMenuPrice } from "@/lib/menu-public";

function DetailOrderAction({ product }: { product: Product }) {
  const order = useOrder();
  const portion = defaultPortion(product);
  const quantity = order.quantityOf(product._id, portion?._id);

  if (hasPortionChoice(product)) {
    return (
      <section className="lg:max-w-md">
        <div className="mb-2.5 flex items-center gap-2">
          <SectionMark className="h-3 w-7 text-[#C62A1E]" />
          <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.12em] text-[#3A2218]">
            Elige tu porción
          </h2>
        </div>
        <PortionOrderList product={product} size="lg" />
      </section>
    );
  }

  if (quantity === 0) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => order.add(product, portion)}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#C62A1E] font-[family-name:var(--font-display)] text-[16px] font-semibold text-white shadow-[0_10px_24px_rgba(198,42,30,0.3)] transition hover:bg-[#A5221A] lg:w-auto lg:px-8"
      >
        <Plus size={18} weight="bold" />
        Agregar a mi pedido
      </motion.button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(58,34,24,0.06)] lg:inline-flex lg:min-w-[360px]">
      <div>
        <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3A2218]">
          <CheckCircle size={16} weight="fill" className="text-[#2F7A3E]" />
          En tu pedido
        </p>
        <p className="text-[12px] font-semibold text-[#7A6254] tabular-nums">
          {portion ? `${portion.name} · ` : ""}
          {formatMenuPrice((portion?.price ?? product.price) * quantity)}
        </p>
      </div>
      <QuantityStepper
        size="lg"
        quantity={quantity}
        label={product.name}
        onChange={(next) =>
          order.setQuantity(orderLineId(product._id, portion?._id), next)
        }
      />
    </div>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: products = [], isLoading, isError } = useProducts();
  const product = products.find((item) => item._id === id);

  const related = products
    .filter((item) => item._id !== id)
    .sort((a, b) => {
      const sameA = a.category?._id === product?.category?._id ? 0 : 1;
      const sameB = b.category?._id === product?.category?._id ? 0 : 1;
      return sameA - sameB;
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <PublicFrame>
        <div className="h-[280px] animate-pulse bg-[#F1E3CB] lg:hidden" />
        <div className="space-y-3 px-5 pt-5 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pb-12 lg:pt-28">
          <div className="hidden h-[380px] animate-pulse rounded-[28px] bg-white/80 lg:block" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded bg-white/80" />
            <div className="h-4 w-full animate-pulse rounded bg-white/70" />
          </div>
        </div>
      </PublicFrame>
    );
  }

  if (isError || !product) {
    return (
      <PublicFrame>
        <div className="px-6 py-20 text-center">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#3A2218]">
            Platillo no encontrado
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-[#C62A1E]"
          >
            Volver al menú
          </Link>
        </div>
      </PublicFrame>
    );
  }

  const icon = resolveCategoryIcon(product.category);
  const isMain =
    product.productType !== "bebidas" &&
    categoryIconKey(product.category?.title ?? "") !== "entradas" &&
    categoryIconKey(product.category?.title ?? "") !== "postres";

  const rawDescription = product.description?.trim() ?? "";
  const sentenceSplit = rawDescription.indexOf(". ");
  const lead =
    sentenceSplit > 40
      ? rawDescription.slice(0, sentenceSplit + 1)
      : rawDescription;
  const ingredients =
    sentenceSplit > 40 ? rawDescription.slice(sentenceSplit + 2) : "";

  return (
    <PublicFrame>
      <motion.div
        key={product._id}
        initial="hidden"
        animate="visible"
        variants={staggerSoft}
      >
        <motion.div
          className="relative aspect-[4/3] bg-[#F1E3CB] lg:hidden"
          variants={softScale}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            productType={product.productType}
            fill
            className="object-cover"
            sizes="430px"
          />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="grid size-10 place-items-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              aria-label="Regresar"
            >
              <ArrowLeft size={22} weight="bold" />
            </button>
            <PublicLogo compact onPhoto className="pointer-events-auto" />
            <PublicMenuButton />
          </div>
        </motion.div>

        <div className="px-5 pb-6 pt-5 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-2 lg:gap-x-12 lg:gap-y-10 lg:px-8 lg:pb-4 lg:pt-28">
          <motion.div
            className="relative hidden overflow-hidden rounded-[28px] bg-[#F1E3CB] lg:block lg:aspect-[4/3]"
            variants={softScale}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              productType={product.productType}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 560px, 430px"
            />
          </motion.div>

          <motion.div variants={staggerSoft}>
            <motion.div variants={fadeUp}>
              <Link
                href="/"
                className="mb-4 hidden items-center gap-1 font-[family-name:var(--font-nunito)] text-[13px] font-semibold text-[#C62A1E] lg:inline-flex"
              >
                <ArrowLeft size={14} weight="bold" />
                Volver al menú
              </Link>
            </motion.div>

            <motion.div
              className="flex items-start justify-between gap-4"
              variants={fadeUp}
            >
              <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold leading-[1.15] text-[#3A2218] lg:text-[40px]">
                {product.name}
              </h1>
              <p className="shrink-0 pt-1 text-right font-[family-name:var(--font-nunito)] text-[28px] font-extrabold leading-none text-[#C62A1E] lg:text-[36px]">
                {hasPortionChoice(product) ? (
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#7A6254] lg:text-[12px]">
                    Desde
                  </span>
                ) : null}
                {formatMenuPrice(product.price)}
                {defaultPortion(product) ? (
                  <span className="mt-1 block text-[12px] font-semibold text-[#7A6254]">
                    {defaultPortion(product)!.name}
                  </span>
                ) : null}
              </p>
            </motion.div>

            {lead ? (
              <motion.p
                className="mt-2 text-[14px] font-normal leading-6 text-[#7A6254] lg:mt-4 lg:text-[16px] lg:leading-7"
                variants={fadeUp}
              >
                {lead}
              </motion.p>
            ) : null}

            {product.isSoldOut && (
              <motion.p
                className="mt-3 inline-flex rounded-full bg-[#C62A1E]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#C62A1E]"
                variants={fadeUp}
              >
                Agotado
              </motion.p>
            )}

            <motion.div
              className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-[family-name:var(--font-nunito)] text-[13px] font-semibold text-[#3A2218] lg:mt-5 lg:text-[14px]"
              variants={fadeUp}
            >
              {product.category?.title && (
                <span className="inline-flex items-center gap-1.5">
                  <CategoryGlyph icon={icon} className="size-4" />
                  {product.category.title}
                </span>
              )}
              {isMain && (
                <span className="inline-flex items-center gap-1.5">
                  <ChefHat className="size-4" />
                  Platillo principal
                </span>
              )}
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1.5 text-[#C62A1E]">
                  <Star className="size-4" weight="fill" />
                  Destacado
                </span>
              )}
            </motion.div>

            {!product.isSoldOut && (
              <motion.div className="mt-5 lg:mt-7" variants={fadeUp}>
                <DetailOrderAction product={product} />
              </motion.div>
            )}

            {(ingredients ||
              (product.quantity?.trim() &&
                product.quantity.trim() !== "1")) && (
              <motion.section className="mt-6" variants={fadeUp}>
                <div className="mb-2 flex items-center gap-2">
                  <CookingPot className="size-4 text-[#3A2218]" />
                  <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.12em] text-[#3A2218]">
                    Ingredientes
                  </h2>
                </div>
                <p className="text-[14px] leading-6 text-[#7A6254] lg:text-[15px] lg:leading-7">
                  {ingredients || product.quantity}
                </p>
              </motion.section>
            )}
          </motion.div>

          {related.length > 0 && (
            <motion.section
              className="mt-7 lg:col-span-2 lg:mt-4"
              variants={fadeUp}
            >
              <div className="mb-3 flex items-center gap-2">
                <SectionMark className="h-3 w-7 text-[#C62A1E]" />
                <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.12em] text-[#3A2218] lg:text-[15px]">
                  También te puede gustar
                </h2>
              </div>
              <motion.div
                className="grid grid-cols-3 gap-2.5 lg:grid-cols-3 lg:gap-5"
                variants={staggerFast}
              >
                {related.map((item) => (
                  <motion.div key={item._id} variants={fadeIn}>
                    <Link href={`/platillo/${item._id}`} className="min-w-0">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F1E3CB] lg:rounded-[22px]">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          productType={item.productType}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 280px, 120px"
                        />
                      </div>
                      <p className="font-[family-name:var(--font-display)] mt-1.5 truncate text-[12px] font-semibold text-[#3A2218] lg:text-[16px]">
                        {item.name}
                      </p>
                      <p className="text-[13px] font-[family-name:var(--font-nunito)] font-extrabold text-[#C62A1E] lg:text-[16px]">
                        {hasPortionChoice(item) ? (
                          <span className="mr-1 text-[10px] font-bold uppercase text-[#7A6254] lg:text-[11px]">
                            Desde
                          </span>
                        ) : null}
                        {formatMenuPrice(item.price)}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </div>
      </motion.div>
    </PublicFrame>
  );
}

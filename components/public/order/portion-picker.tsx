"use client";

import { Plus, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { QuantityStepper } from "@/components/public/order/order-stepper";
import { ProductImage } from "@/components/ui/product-image";
import { useOrder } from "@/hooks/use-order";
import { formatMenuPrice } from "@/lib/menu-public";
import { orderLineId } from "@/lib/order-store";
import { productPortions } from "@/lib/portions";
import type { Product } from "@/lib/types";

const subscribeNothing = () => () => {};

/** Inline prices for menu cards: "Orden $120 · 1/2 orden $70". */
export function PortionPrices({
  product,
  size = "md",
}: {
  product: Product;
  size?: "md" | "lg";
}) {
  const portions = productPortions(product);
  const price =
    size === "lg"
      ? "text-[22px] lg:text-[24px]"
      : "text-[15px] lg:text-[17px]";

  if (portions.length <= 1) {
    return (
      <p className="flex items-baseline gap-1.5">
        <span
          className={`font-[family-name:var(--font-nunito)] font-extrabold text-[#C62A1E] ${price}`}
        >
          {formatMenuPrice(portions[0]?.price ?? product.price)}
        </span>
        {portions[0] ? (
          <span className="text-[12px] font-semibold text-[#7A6254]">
            {portions[0].name}
          </span>
        ) : null}
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
      {portions.map((portion) => (
        <li key={portion._id} className="flex items-baseline gap-1">
          <span
            className={`font-semibold text-[#7A6254] ${
              size === "lg" ? "text-[13px]" : "text-[11.5px]"
            }`}
          >
            {portion.name}
          </span>
          <span
            className={`font-[family-name:var(--font-nunito)] font-extrabold text-[#C62A1E] ${
              size === "lg" ? "text-[18px]" : "text-[14px] lg:text-[15px]"
            }`}
          >
            {formatMenuPrice(portion.price)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** One row per portion with its own add button / stepper. */
export function PortionOrderList({
  product,
  size = "sm",
}: {
  product: Product;
  size?: "sm" | "lg";
}) {
  const order = useOrder();

  return (
    <ul className="space-y-2" aria-label={`Porciones de ${product.name}`}>
      {productPortions(product).map((portion) => {
        const quantity = order.quantityOf(product._id, portion._id);
        const label = `${product.name} (${portion.name})`;
        const selected = quantity > 0;

        return (
          <li
            key={portion._id}
            className={`flex items-center gap-3 rounded-2xl px-4 transition ${
              size === "lg" ? "py-3.5" : "py-3"
            } ${
              selected
                ? "bg-white shadow-[0_8px_22px_rgba(58,34,24,0.08)] ring-2 ring-[#C62A1E]/30"
                : "bg-white ring-1 ring-[#3A2218]/8"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`font-[family-name:var(--font-display)] font-semibold text-[#3A2218] ${
                  size === "lg" ? "text-[17px]" : "text-[15px]"
                }`}
              >
                {portion.name}
              </p>
              <p className="font-[family-name:var(--font-nunito)] text-[14px] font-extrabold text-[#C62A1E] tabular-nums">
                {formatMenuPrice(portion.price)}
              </p>
            </div>
            {selected ? (
              <QuantityStepper
                size={size}
                quantity={quantity}
                label={label}
                onChange={(next) =>
                  order.setQuantity(orderLineId(product._id, portion._id), next)
                }
              />
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => order.add(product, portion)}
                className={`inline-flex items-center gap-1.5 rounded-full bg-[#C62A1E] font-bold text-white shadow-[0_6px_16px_rgba(198,42,30,0.28)] transition hover:bg-[#A5221A] ${
                  size === "lg" ? "h-11 px-5 text-[14px]" : "h-9 px-4 text-[13px]"
                }`}
                aria-label={`Agregar ${label} a mi pedido`}
              >
                <Plus size={14} weight="bold" />
                Agregar
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function PortionPickerSheet({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const order = useOrder();
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const lines = order.items.filter((item) => item.productId === product._id);
  const count = lines.reduce((total, item) => total + item.quantity, 0);
  const subtotal = lines.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center font-[family-name:var(--font-nunito)] lg:items-center">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[#2B170E]/45 backdrop-blur-[3px]"
            aria-label="Cerrar"
            tabIndex={-1}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Elige la porción de ${product.name}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative w-full max-w-[430px] overflow-hidden rounded-t-[28px] bg-[#FAF3E6] text-[#3A2218] shadow-[0_-20px_60px_rgba(43,23,14,0.25)] lg:max-w-[460px] lg:rounded-[28px]"
          >
            <div className="mx-auto mt-2.5 h-1.5 w-11 rounded-full bg-[#3A2218]/15 lg:hidden" />
            <header className="flex items-center gap-3 px-5 pb-3 pt-3 lg:pt-5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-[#F1E3CB]">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  productType={product.productType}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C62A1E]">
                  Elige tu porción
                </p>
                <h2 className="font-[family-name:var(--font-display)] truncate text-[20px] font-semibold leading-tight">
                  {product.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#3A2218] shadow-sm"
                aria-label="Cerrar"
              >
                <X size={18} weight="bold" />
              </button>
            </header>

            <div className="max-h-[55dvh] overflow-y-auto px-5 pb-4">
              <PortionOrderList product={product} />
            </div>

            <footer className="border-t border-[#3A2218]/8 bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 lg:pb-5">
              <button
                type="button"
                onClick={onClose}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#3A2218] font-[family-name:var(--font-display)] text-[16px] font-semibold text-white transition hover:bg-[#2B170E]"
              >
                {count > 0 ? (
                  <>
                    Listo · {count} en tu pedido
                    <span className="tabular-nums text-[#E9A83B]">
                      {formatMenuPrice(subtotal)}
                    </span>
                  </>
                ) : (
                  "Cerrar"
                )}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

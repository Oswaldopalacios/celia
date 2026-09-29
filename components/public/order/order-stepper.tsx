"use client";

import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PortionPickerSheet } from "@/components/public/order/portion-picker";
import { useOrder } from "@/hooks/use-order";
import { orderLineId } from "@/lib/order-store";
import { defaultPortion, hasPortionChoice } from "@/lib/portions";
import type { Product } from "@/lib/types";

export function QuantityStepper({
  quantity,
  onChange,
  size = "sm",
  label,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  size?: "sm" | "lg";
  label: string;
}) {
  const button =
    size === "lg"
      ? "grid size-11 place-items-center rounded-full"
      : "grid size-8 place-items-center rounded-full";

  return (
    <div
      className={`inline-flex items-center rounded-full bg-[#3A2218] text-white shadow-[0_6px_16px_rgba(58,34,24,0.2)] ${
        size === "lg" ? "gap-1 p-1" : "gap-0.5 p-0.5"
      }`}
      role="group"
      aria-label={`Cantidad de ${label}`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        className={`${button} transition hover:bg-white/15`}
        aria-label={quantity === 1 ? `Quitar ${label}` : `Una ${label} menos`}
      >
        {quantity === 1 ? (
          <Trash size={size === "lg" ? 18 : 14} weight="bold" />
        ) : (
          <Minus size={size === "lg" ? 18 : 14} weight="bold" />
        )}
      </button>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={quantity}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`min-w-6 text-center font-extrabold tabular-nums ${
            size === "lg" ? "text-[17px]" : "text-[13px]"
          }`}
          aria-live="polite"
        >
          {quantity}
        </motion.span>
      </AnimatePresence>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= 99}
        className={`${button} transition hover:bg-white/15 disabled:opacity-40`}
        aria-label={`Una ${label} más`}
      >
        <Plus size={size === "lg" ? 18 : 14} weight="bold" />
      </button>
    </div>
  );
}

/** Compact "+" that turns into a stepper once the product is in the order. */
export function AddToOrderButton({ product }: { product: Product }) {
  const order = useOrder();
  const [pickerOpen, setPickerOpen] = useState(false);
  const portion = defaultPortion(product);
  const quantity = order.quantityOf(product._id, portion?._id);

  if (product.isSoldOut) {
    return (
      <span className="rounded-full bg-[#F1E3CB] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#7A6254]">
        Agotado
      </span>
    );
  }

  if (hasPortionChoice(product)) {
    const count = order.productCount(product._id);
    return (
      <>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setPickerOpen(true)}
          className={`inline-flex h-9 items-center justify-center gap-1 rounded-full text-white transition ${
            count > 0
              ? "bg-[#3A2218] pl-3 pr-2.5 shadow-[0_6px_16px_rgba(58,34,24,0.2)] hover:bg-[#2B170E]"
              : "w-9 bg-[#C62A1E] shadow-[0_6px_16px_rgba(198,42,30,0.3)] hover:bg-[#A5221A]"
          }`}
          aria-label={
            count > 0
              ? `Elegir porción de ${product.name} (${count} en tu pedido)`
              : `Elegir porción de ${product.name}`
          }
        >
          {count > 0 ? (
            <span className="text-[13px] font-extrabold tabular-nums">
              {count}
            </span>
          ) : null}
          <Plus size={16} weight="bold" />
        </motion.button>
        <PortionPickerSheet
          product={product}
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
        />
      </>
    );
  }

  if (quantity > 0) {
    return (
      <QuantityStepper
        quantity={quantity}
        label={product.name}
        onChange={(next) =>
          order.setQuantity(orderLineId(product._id, portion?._id), next)
        }
      />
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={() => order.add(product, portion)}
      className="grid size-9 place-items-center rounded-full bg-[#C62A1E] text-white shadow-[0_6px_16px_rgba(198,42,30,0.3)] transition hover:bg-[#A5221A]"
      aria-label={`Agregar ${product.name} a mi pedido`}
    >
      <Plus size={16} weight="bold" />
    </motion.button>
  );
}

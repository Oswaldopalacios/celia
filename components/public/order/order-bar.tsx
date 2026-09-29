"use client";

import {
  ArrowLeft,
  CallBell,
  CaretRight,
  NotePencil,
  Receipt,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { QuantityStepper } from "@/components/public/order/order-stepper";
import { ProductImage } from "@/components/ui/product-image";
import { useOrder } from "@/hooks/use-order";
import { useProducts } from "@/hooks/use-products";
import { formatMenuPrice } from "@/lib/menu-public";
import type { OrderItem } from "@/lib/order-store";

export function OrderBar() {
  const order = useOrder();
  const [open, setOpen] = useState(false);
  const sheetOpen = open && order.count > 0;

  return (
    <>
      <AnimatePresence>
        {order.count > 0 && !sheetOpen && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="fixed inset-x-0 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-40 mx-auto w-full max-w-[430px] px-4 lg:inset-x-auto lg:bottom-8 lg:right-8 lg:w-auto lg:max-w-none lg:px-0"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center gap-3 rounded-full bg-[#C62A1E] py-2 pl-2 pr-5 text-white shadow-[0_14px_32px_rgba(198,42,30,0.38)] transition hover:bg-[#A5221A] lg:min-w-[320px]"
            >
              <motion.span
                key={order.count}
                initial={{ scale: 1.35 }}
                animate={{ scale: 1 }}
                className="grid size-10 place-items-center rounded-full bg-white font-extrabold text-[#C62A1E] tabular-nums"
              >
                {order.count}
              </motion.span>
              <span className="flex-1 text-left">
                <span className="block font-[family-name:var(--font-display)] text-[15px] font-semibold leading-tight">
                  Ver mi pedido
                </span>
                <span className="block text-[11px] font-semibold text-white/80">
                  Muéstralo a tu mesero
                </span>
              </span>
              <span className="font-extrabold tabular-nums">
                {formatMenuPrice(order.total)}
              </span>
              <CaretRight size={16} weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && <OrderSheet onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function OrderSheet({ onClose }: { onClose: () => void }) {
  const order = useOrder();
  const { data: products } = useProducts();
  const [waiterView, setWaiterView] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
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
  }, [onClose]);

  const latest = new Map(products?.map((product) => [product._id, product]));
  const lines = order.items.map((item) => {
    const product = latest.get(item.productId);
    const portions = product?.portions ?? [];
    const portion = item.portionId
      ? portions.find((candidate) => candidate._id === item.portionId)
      : undefined;
    // A line without portion can't be priced once the product requires one,
    // and a line whose portion was deleted can't be ordered anymore.
    const portionMissing = item.portionId
      ? !portion
      : portions.length > 1;
    return {
      item,
      name: product?.name ?? item.name,
      portionName: portion?.name ?? item.portionName,
      price: portion?.price ?? (item.portionId ? item.price : (product?.price ?? item.price)),
      image: product?.image ?? item.image,
      unavailable: products
        ? !product || Boolean(product.isSoldOut) || portionMissing
        : false,
    };
  });
  const total = lines.reduce(
    (sum, line) =>
      sum + (line.unavailable ? 0 : line.price * line.item.quantity),
    0,
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-stretch lg:justify-end">
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#2B170E]/45 backdrop-blur-[3px]"
        aria-label="Cerrar pedido"
        tabIndex={-1}
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Mi pedido"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="relative flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-[#FAF3E6] font-[family-name:var(--font-nunito)] text-[#3A2218] shadow-[0_-20px_60px_rgba(43,23,14,0.25)] lg:max-h-none lg:max-w-[440px] lg:rounded-none lg:rounded-l-[28px]"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-11 rounded-full bg-[#3A2218]/15 lg:hidden" />

        {waiterView ? (
          <WaiterView
            lines={lines}
            total={total}
            onBack={() => setWaiterView(false)}
          />
        ) : (
          <>
            <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-3 lg:pt-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-2xl bg-[#C62A1E]/10 text-[#C62A1E]">
                  <Receipt size={22} weight="fill" />
                </span>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold leading-tight">
                    Mi pedido
                  </h2>
                  <p className="text-[12px] text-[#7A6254]">
                    {order.count} {order.count === 1 ? "producto" : "productos"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full bg-white text-[#3A2218] shadow-sm"
                aria-label="Cerrar"
              >
                <X size={18} weight="bold" />
              </button>
            </header>

            <p className="mx-5 mb-3 rounded-2xl bg-white/70 px-3.5 py-2.5 text-[12px] leading-5 text-[#7A6254]">
              Esta lista es solo una guía para ti: aquí no se paga ni se envía
              nada. Muéstrasela a tu mesero para ordenar.
            </p>

            <ul className="flex-1 space-y-2.5 overflow-y-auto px-5 pb-4">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <OrderLine key={line.item.id} {...line} />
                ))}
              </AnimatePresence>
            </ul>

            <footer className="space-y-3 border-t border-[#3A2218]/8 bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-[#7A6254]">
                  Total estimado
                </span>
                <span className="font-[family-name:var(--font-display)] text-[24px] font-semibold text-[#C62A1E] tabular-nums">
                  {formatMenuPrice(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWaiterView(true)}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#C62A1E] font-[family-name:var(--font-display)] text-[16px] font-semibold text-white shadow-[0_10px_24px_rgba(198,42,30,0.3)] transition hover:bg-[#A5221A]"
              >
                <CallBell size={20} weight="fill" />
                Mostrar al mesero
              </button>
              {confirmClear ? (
                <div className="flex items-center justify-between gap-2 rounded-full bg-red-50 py-1.5 pl-4 pr-1.5">
                  <span className="text-[12px] font-semibold text-red-700">
                    ¿Vaciar todo el pedido?
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="h-8 rounded-full px-3 text-[12px] font-semibold text-[#7A6254]"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={order.clear}
                      className="h-8 rounded-full bg-red-600 px-3.5 text-[12px] font-bold text-white"
                    >
                      Sí, vaciar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="mx-auto flex items-center gap-1.5 text-[12px] font-semibold text-[#7A6254] transition hover:text-red-600"
                >
                  <Trash size={14} />
                  Vaciar pedido
                </button>
              )}
            </footer>
          </>
        )}
      </motion.aside>
    </div>
  );
}

type Line = {
  item: OrderItem;
  name: string;
  portionName?: string;
  price: number;
  image?: string;
  unavailable: boolean;
};

function PortionTag({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-[#E9A83B]/18 font-bold text-[#7A4A0C] ${
        large ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[10.5px]"
      }`}
    >
      {name}
    </span>
  );
}

function OrderLine({
  item,
  name,
  portionName,
  price,
  image,
  unavailable,
}: Line) {
  const order = useOrder();
  const [editingNote, setEditingNote] = useState(Boolean(item.note));

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, marginTop: 0 }}
      className="overflow-hidden rounded-[20px] bg-white p-2.5 shadow-[0_6px_18px_rgba(58,34,24,0.05)]"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-[#F1E3CB]">
          <ProductImage
            src={image}
            alt={name}
            productType={item.productType}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="font-[family-name:var(--font-display)] truncate text-[15px] font-semibold">
              {name}
            </p>
            {portionName ? <PortionTag name={portionName} /> : null}
          </div>
          {unavailable ? (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#C62A1E]">
              <Warning size={12} weight="fill" />
              No disponible por ahora
            </p>
          ) : (
            <p className="text-[13px] font-extrabold text-[#C62A1E] tabular-nums">
              {formatMenuPrice(price * item.quantity)}
              {item.quantity > 1 && (
                <span className="ml-1 text-[11px] font-semibold text-[#B09A89]">
                  ({formatMenuPrice(price)} c/u)
                </span>
              )}
            </p>
          )}
        </div>
        <QuantityStepper
          quantity={item.quantity}
          label={name}
          onChange={(next) => order.setQuantity(item.id, next)}
        />
      </div>

      {editingNote ? (
        <input
          value={item.note}
          onChange={(event) => order.setNote(item.id, event.target.value)}
          placeholder="Ej. sin cebolla, término medio…"
          maxLength={140}
          autoFocus={!item.note}
          aria-label={`Nota para ${name}`}
          className="mt-2 h-10 w-full rounded-xl bg-[#FAF3E6] px-3 text-[13px] text-[#3A2218] outline-none placeholder:text-[#B09A89] focus:ring-2 focus:ring-[#C62A1E]/25"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingNote(true)}
          className="mt-1.5 inline-flex items-center gap-1 pl-[68px] text-[11px] font-semibold text-[#7A6254] transition hover:text-[#C62A1E]"
        >
          <NotePencil size={13} />
          Agregar nota
        </button>
      )}
    </motion.li>
  );
}

function WaiterView({
  lines,
  total,
  onBack,
}: {
  lines: Line[];
  total: number;
  onBack: () => void;
}) {
  const available = lines.filter((line) => !line.unavailable);

  return (
    <>
      <header className="flex items-center gap-3 px-5 pb-2 pt-3 lg:pt-6">
        <button
          type="button"
          onClick={onBack}
          className="grid size-10 place-items-center rounded-full bg-white text-[#3A2218] shadow-sm"
          aria-label="Volver a editar"
        >
          <ArrowLeft size={18} weight="bold" />
        </button>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold leading-tight">
            Para tu mesero
          </h2>
          <p className="text-[12px] text-[#7A6254]">
            Gira la pantalla hacia tu mesero
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
        <ul className="divide-y divide-[#3A2218]/10 rounded-[22px] bg-white px-4">
          {available.map(({ item, name, portionName }) => (
            <li key={item.id} className="flex gap-4 py-4">
              <span className="font-[family-name:var(--font-display)] text-[28px] font-semibold leading-none text-[#C62A1E] tabular-nums">
                {item.quantity}×
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="font-[family-name:var(--font-display)] text-[21px] font-semibold leading-tight">
                  {name}
                </p>
                {portionName ? (
                  <div className="mt-1.5">
                    <PortionTag name={portionName} large />
                  </div>
                ) : null}
                {item.note.trim() && (
                  <p className="mt-1 text-[15px] font-semibold italic text-[#7A6254]">
                    “{item.note.trim()}”
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {available.length < lines.length && (
          <p className="mt-3 text-center text-[12px] text-[#7A6254]">
            Se ocultaron los productos que no están disponibles.
          </p>
        )}
      </div>

      <footer className="flex items-baseline justify-between border-t border-[#3A2218]/8 bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
        <span className="text-[14px] font-semibold text-[#7A6254]">
          Total estimado
        </span>
        <span className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-[#3A2218] tabular-nums">
          {formatMenuPrice(total)}
        </span>
      </footer>
    </>
  );
}

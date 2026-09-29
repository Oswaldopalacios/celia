"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const sizes = {
  sm: "max-w-[420px]",
  md: "max-w-[540px]",
  lg: "max-w-[680px]",
  xl: "max-w-[760px]",
} as const;

let openModalCount = 0;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  size?: keyof typeof sizes;
  locked?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = "md",
  locked = false,
  children,
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    openModalCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      openModalCount -= 1;
      if (openModalCount === 0) document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || locked) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, locked, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-end sm:place-items-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !locked && onClose()}
            className="absolute inset-0 cursor-default bg-[#2B170E]/45 backdrop-blur-[6px]"
            aria-label="Cerrar"
            tabIndex={-1}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_32px_80px_rgba(43,23,14,0.28)] sm:m-4 sm:rounded-3xl ${sizes[size]}`}
          >
            <header className="flex items-start gap-4 border-b border-[#3A2218]/8 px-6 pb-5 pt-6">
              {icon && (
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#C62A1E]/10 text-[#C62A1E]">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className="font-[family-name:var(--font-display)] text-[17px] font-semibold text-[#3A2218]">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 font-[family-name:var(--font-nunito)] text-[13px] leading-5 text-[#7A6254]">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={() => !locked && onClose()}
                disabled={locked}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-[#7A6254] transition hover:bg-[#FAF3E6] hover:text-[#3A2218] disabled:opacity-40"
                aria-label="Cerrar ventana"
              >
                <X className="size-[18px]" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 font-[family-name:var(--font-nunito)]">
              {children}
            </div>

            {footer && (
              <footer className="flex items-center justify-end gap-3 border-t border-[#3A2218]/8 bg-[#FAF3E6] px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

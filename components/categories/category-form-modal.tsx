"use client";

import { motion } from "framer-motion";
import { FolderPlus, PencilLine } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { CategoryIconPicker } from "@/components/categories/category-icon-picker";
import { Modal } from "@/components/ui/modal";
import { isCategoryIcon, type CategoryIconId } from "@/lib/category-icons";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-products";
import { getApiErrorMessage } from "@/lib/api";
import {
  dashboardBtnPrimary,
  dashboardBtnSecondary,
  dashboardInput,
  dashboardLabel,
  dashboardTabActive,
  dashboardTabInactive,
  dashboardTabTrack,
} from "@/lib/dashboard-theme";
import type { ProductCategory, ProductType } from "@/lib/types";

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  category?: ProductCategory | null;
  defaultKind?: ProductType;
  onCreated?: (category: ProductCategory) => void;
};

const KIND_OPTIONS: { id: ProductType; label: string; hint: string }[] = [
  { id: "comida", label: "Comida", hint: "Platillos, entradas…" },
  { id: "bebidas", label: "Bebidas", hint: "Drinks, cervezas…" },
];

export function CategoryFormModal({
  open,
  onClose,
  category,
  defaultKind = "comida",
  onCreated,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const pending = createCategory.isPending || updateCategory.isPending;

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ProductType>("comida");
  const [icon, setIcon] = useState<CategoryIconId | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(category?.title ?? "");
    setKind(
      category
        ? category.kind === "bebidas"
          ? "bebidas"
          : "comida"
        : defaultKind,
    );
    setIcon(isCategoryIcon(category?.icon) ? category.icon : "");
    setError("");
  }, [open, category, defaultKind]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Escribe un nombre para la categoría.");
      return;
    }

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category._id,
          payload: { title: trimmed, kind, icon },
        });
      } else {
        const { category: created } = await createCategory.mutateAsync({
          title: trimmed,
          kind,
          icon,
        });
        onCreated?.(created);
      }
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={pending}
      size="md"
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      description={
        isEditing
          ? "Actualiza el nombre, el tipo o el ícono de esta categoría."
          : "Las categorías agrupan productos en el menú."
      }
      icon={
        isEditing ? (
          <PencilLine className="size-5" />
        ) : (
          <FolderPlus className="size-5" />
        )
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={dashboardBtnSecondary}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={pending}
            className={`${dashboardBtnPrimary} px-6`}
          >
            {pending && (
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            )}
            {pending
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear categoría"}
          </button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <div>
          <p className={dashboardLabel}>Tipo</p>
          <div
            className={`grid grid-cols-2 gap-1 ${dashboardTabTrack}`}
            role="radiogroup"
            aria-label="Tipo de categoría"
          >
            {KIND_OPTIONS.map((option) => {
              const active = kind === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setKind(option.id)}
                  className={`rounded-xl px-3 py-2.5 text-left transition ${
                    active ? dashboardTabActive : dashboardTabInactive
                  }`}
                >
                  <span className="block text-[13px] font-bold leading-tight">
                    {option.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] leading-tight ${
                      active ? "text-[#C62A1E]" : "text-[#7A6254]"
                    }`}
                  >
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="category-title" className={dashboardLabel}>
            Nombre
          </label>
          <input
            id="category-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Antojitos"
            className={`h-12 ${dashboardInput}`}
            autoFocus
          />
        </div>

        <div>
          <p className={dashboardLabel}>Ícono</p>
          <p className="-mt-1 mb-2.5 text-[11px] text-[#7A6254]">
            Se muestra en los filtros y en el detalle de los platillos del menú
            público.
          </p>
          <CategoryIconPicker value={icon} onChange={setIcon} title={title} />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
          >
            {error}
          </motion.p>
        )}
      </form>
    </Modal>
  );
}

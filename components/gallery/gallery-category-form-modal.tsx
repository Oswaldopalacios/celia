"use client";

import { motion } from "framer-motion";
import { Check, FolderPlus, PencilLine } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import {
  useCreateGalleryCategory,
  useUpdateGalleryCategory,
} from "@/hooks/use-gallery";
import { getApiErrorMessage } from "@/lib/api";
import {
  dashboardBtnPrimary,
  dashboardBtnSecondary,
  dashboardInput,
} from "@/lib/dashboard-theme";
import type { GalleryCategory } from "@/lib/types";

type GalleryCategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  category?: GalleryCategory | null;
};

export function GalleryCategoryFormModal({
  open,
  onClose,
  category,
}: GalleryCategoryFormModalProps) {
  const isEditing = Boolean(category);
  const createCategory = useCreateGalleryCategory();
  const updateCategory = useUpdateGalleryCategory();
  const pending = createCategory.isPending || updateCategory.isPending;

  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(category?.title ?? "");
    setError("");
  }, [open, category]);

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
          payload: { title: trimmed },
        });
      } else {
        await createCategory.mutateAsync({ title: trimmed });
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
      size="sm"
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      description="Las categorías filtran las fotos en la galería pública (Eventos, Restaurante…)."
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
            form="gallery-category-form"
            disabled={pending}
            className={dashboardBtnPrimary}
          >
            {pending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <Check className="size-4" />
            )}
            {isEditing ? "Guardar" : "Crear"}
          </button>
        </>
      }
    >
      <form id="gallery-category-form" onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="gallery-cat-title"
          className="mb-2 block text-xs font-semibold text-[#3A2218]"
        >
          Nombre
        </label>
        <input
          id="gallery-cat-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Promocionales"
          className={`h-12 ${dashboardInput}`}
          autoFocus
        />
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-xs font-medium text-red-600"
          >
            {error}
          </motion.p>
        ) : null}
      </form>
    </Modal>
  );
}

"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useDeleteGalleryCategory } from "@/hooks/use-gallery";
import { getApiErrorMessage } from "@/lib/api";
import { dashboardBtnSecondary, dashboardInput } from "@/lib/dashboard-theme";
import type { GalleryCategory } from "@/lib/types";

type DeleteGalleryCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  category: GalleryCategory | null;
  categories: GalleryCategory[];
};

export function DeleteGalleryCategoryModal({
  open,
  onClose,
  category,
  categories,
}: DeleteGalleryCategoryModalProps) {
  const deleteCategory = useDeleteGalleryCategory();
  const [reassignTo, setReassignTo] = useState("");
  const [error, setError] = useState("");

  const imageCount = category?.imageCount ?? 0;
  const hasImages = imageCount > 0;

  const reassignOptions = useMemo(() => {
    if (!category) return [];
    return categories.filter((item) => item._id !== category._id);
  }, [categories, category]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setReassignTo("");
  }, [open, category?._id]);

  const handleDelete = async () => {
    if (!category) return;
    setError("");

    if (hasImages && !reassignTo) {
      setError("Elige otra categoría para mover las imágenes antes de eliminar.");
      return;
    }

    try {
      await deleteCategory.mutateAsync({
        id: category._id,
        reassignTo: hasImages ? reassignTo : undefined,
      });
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const canConfirm =
    !deleteCategory.isPending &&
    (!hasImages || (Boolean(reassignTo) && reassignOptions.length > 0));

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={deleteCategory.isPending}
      size="sm"
      title="Eliminar categoría"
      description="Esta acción no se puede deshacer."
      icon={<TriangleAlert className="size-5 text-red-500" />}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteCategory.isPending}
            className={dashboardBtnSecondary}
          >
            Conservar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canConfirm}
            className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleteCategory.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Sí, eliminar
          </button>
        </>
      }
    >
      {category ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#3A2218]/8 bg-[#FAF3E6] px-4 py-3">
            <p className="text-sm font-bold text-[#3A2218]">{category.title}</p>
            <p className="mt-0.5 text-xs text-[#7A6254]">
              {imageCount} imagen{imageCount === 1 ? "" : "es"}
            </p>
          </div>

          {hasImages ? (
            <div>
              <label
                htmlFor="gallery-reassign"
                className="mb-2 block text-xs font-semibold text-[#3A2218]"
              >
                Mover imágenes a
              </label>
              <select
                id="gallery-reassign"
                value={reassignTo}
                onChange={(event) => setReassignTo(event.target.value)}
                className={`h-11 ${dashboardInput}`}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {reassignOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </Modal>
  );
}

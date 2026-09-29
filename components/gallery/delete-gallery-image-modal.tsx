"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useDeleteGalleryImage } from "@/hooks/use-gallery";
import { getApiErrorMessage } from "@/lib/api";
import { dashboardBtnSecondary } from "@/lib/dashboard-theme";
import type { GalleryImage } from "@/lib/types";
import { useState } from "react";

type DeleteGalleryImageModalProps = {
  open: boolean;
  onClose: () => void;
  image: GalleryImage | null;
};

export function DeleteGalleryImageModal({
  open,
  onClose,
  image,
}: DeleteGalleryImageModalProps) {
  const deleteImage = useDeleteGalleryImage();
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!image) return;
    setError("");
    try {
      await deleteImage.mutateAsync(image._id);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={deleteImage.isPending}
      size="sm"
      title="Eliminar imagen"
      description="Se quitará de la galería pública. Esta acción no se puede deshacer."
      icon={<TriangleAlert className="size-5 text-red-500" />}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteImage.isPending}
            className={dashboardBtnSecondary}
          >
            Conservar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteImage.isPending}
            className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleteImage.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {deleteImage.isPending ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </>
      }
    >
      {image ? (
        <div className="rounded-2xl border border-[#3A2218]/8 bg-[#FAF3E6] px-4 py-3">
          <p className="text-sm font-bold text-[#3A2218]">{image.title}</p>
          <p className="mt-0.5 text-xs text-[#7A6254]">
            {image.category?.title ?? "Sin categoría"}
          </p>
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </Modal>
  );
}

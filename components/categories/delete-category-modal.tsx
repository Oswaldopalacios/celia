"use client";

import { motion } from "framer-motion";
import { Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { dashboardBtnSecondary, dashboardInput } from "@/lib/dashboard-theme";
import { useDeleteCategory } from "@/hooks/use-products";
import { getApiErrorMessage } from "@/lib/api";
import type { ProductCategory } from "@/lib/types";

type DeleteCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  /** Otras categorías disponibles para reasignar productos. */
  categories: ProductCategory[];
};

export function DeleteCategoryModal({
  open,
  onClose,
  category,
  categories,
}: DeleteCategoryModalProps) {
  const deleteCategory = useDeleteCategory();
  const [reassignTo, setReassignTo] = useState("");
  const [error, setError] = useState("");

  const productCount = category?.productCount ?? 0;
  const hasProducts = productCount > 0;

  const reassignOptions = useMemo(() => {
    if (!category) return [];
    const kind = category.kind === "bebidas" ? "bebidas" : "comida";
    return categories.filter(
      (item) =>
        item._id !== category._id &&
        (item.kind === "bebidas" ? "bebidas" : "comida") === kind,
    );
  }, [categories, category]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setReassignTo("");
  }, [open, category?._id]);

  const handleDelete = async () => {
    if (!category) return;
    setError("");

    if (hasProducts && !reassignTo) {
      setError(
        "Elige otra categoría para mover los productos antes de eliminar.",
      );
      return;
    }

    if (hasProducts && reassignOptions.length === 0) {
      setError(
        "No hay otra categoría del mismo tipo. Crea una nueva antes de eliminar esta.",
      );
      return;
    }

    try {
      await deleteCategory.mutateAsync({
        id: category._id,
        reassignTo: hasProducts ? reassignTo : undefined,
      });
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const canConfirm =
    !deleteCategory.isPending &&
    (!hasProducts || (Boolean(reassignTo) && reassignOptions.length > 0));

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
            className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(220,38,38,0.22)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteCategory.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {deleteCategory.isPending ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </>
      }
    >
      {category && (
        <div className="rounded-2xl border border-[#3A2218]/8 bg-[#FAF3E6] px-4 py-3">
          <p className="text-sm font-bold text-[#3A2218]">{category.title}</p>
          <p className="mt-0.5 text-xs text-[#7A6254]">
            {category.kind === "bebidas" ? "Bebidas" : "Comida"}
            {" · "}
            {productCount} producto{productCount === 1 ? "" : "s"}
          </p>
        </div>
      )}

      {hasProducts ? (
        <div className="mt-4 space-y-3">
          <p className="text-[13px] leading-6 text-[#7A6254]">
            Esta categoría tiene{" "}
            <strong className="font-semibold text-[#3A2218]">
              {productCount} producto{productCount === 1 ? "" : "s"}
            </strong>
            . Antes de eliminarla debes{" "}
            <strong className="font-semibold text-[#3A2218]">
              cambiarlos a otra categoría
            </strong>{" "}
            del mismo tipo.
          </p>

          {reassignOptions.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
              No hay otra categoría de{" "}
              {category?.kind === "bebidas" ? "bebidas" : "comida"}. Crea una
              nueva y vuelve a intentar.
            </p>
          ) : (
            <div>
              <label
                htmlFor="reassign-category"
                className="mb-2 block text-xs font-semibold text-[#3A2218]"
              >
                Mover productos a
              </label>
              <select
                id="reassign-category"
                value={reassignTo}
                onChange={(event) => setReassignTo(event.target.value)}
                className={`h-12 cursor-pointer appearance-none ${dashboardInput}`}
              >
                <option value="">Selecciona una categoría…</option>
                {reassignOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-[13px] leading-6 text-[#7A6254]">
          No hay productos en esta categoría. Se eliminará del menú y del panel.
        </p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
        >
          {error}
        </motion.p>
      )}
    </Modal>
  );
}

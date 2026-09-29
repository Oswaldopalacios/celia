"use client";

import { motion } from "framer-motion";
import { Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { dashboardBtnSecondary } from "@/lib/dashboard-theme";
import { ProductImage } from "@/components/ui/product-image";
import { useDeleteProduct } from "@/hooks/use-products";
import { getApiErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

type DeleteProductModalProps = {
  open: boolean;
  onClose: () => void;
  product: Product | null;
};

export function DeleteProductModal({
  open,
  onClose,
  product,
}: DeleteProductModalProps) {
  const deleteProduct = useDeleteProduct();
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleDelete = async () => {
    if (!product) return;
    setError("");

    try {
      await deleteProduct.mutateAsync(product._id);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={deleteProduct.isPending}
      size="sm"
      title="Eliminar producto"
      description="Esta acción es permanente y no se puede deshacer."
      icon={<TriangleAlert className="size-5 text-red-500" />}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={deleteProduct.isPending}
            className={dashboardBtnSecondary}
          >
            Conservar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(220,38,38,0.22)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteProduct.isPending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {deleteProduct.isPending ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </>
      }
    >
      {product && (
        <div className="flex items-center gap-4 rounded-2xl border border-[#3A2218]/8 bg-[#FAF3E6] p-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#F1E3CB]">
            <ProductImage
              src={product.image}
              alt={product.name}
              productType={product.productType}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#3A2218]">
              {product.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#7A6254]">
              {product.category?.title ?? "Sin categoría"}
            </p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[13px] leading-6 text-[#7A6254]">
        Se eliminará el producto y su imagen del catálogo. Esta acción no se
        puede deshacer.
      </p>

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

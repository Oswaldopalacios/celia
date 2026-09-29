"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DeleteGalleryCategoryModal } from "@/components/gallery/delete-gallery-category-modal";
import { GalleryCategoryFormModal } from "@/components/gallery/gallery-category-form-modal";
import { useGalleryCategories } from "@/hooks/use-gallery";
import {
  dashboardBtnPrimary,
  dashboardPageSubtitle,
  dashboardPageTitle,
} from "@/lib/dashboard-theme";
import type { GalleryCategory } from "@/lib/types";

export default function GalleryCategoriesPage() {
  const categoriesQuery = useGalleryCategories();
  const categories = categoriesQuery.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryCategory | null>(null);
  const [deleting, setDeleting] = useState<GalleryCategory | null>(null);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[960px] px-5 pb-10 pt-7 sm:px-8 lg:px-10 lg:pt-9">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <h1 className={dashboardPageTitle}>Categorías de galería</h1>
            <p className={dashboardPageSubtitle}>
              Agrupa fotos: Restaurante, Eventos, Promocionales…
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className={dashboardBtnPrimary}
          >
            <Plus className="size-4" />
            Nueva categoría
          </button>
        </motion.header>

        {categoriesQuery.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-[#3A2218]/15 bg-white/60 text-center">
            <div>
              <FolderPlus className="mx-auto mb-3 size-10 text-[#B09A89]" />
              <p className="font-semibold text-[#3A2218]">Sin categorías</p>
              <button
                onClick={() => setFormOpen(true)}
                className={`${dashboardBtnPrimary} mx-auto mt-4`}
              >
                Crear categoría
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {categories.map((category, index) => (
                <motion.li
                  key={category._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: Math.min(index * 0.03, 0.2) }}
                  className="flex items-center gap-3 rounded-2xl border border-[#3A2218]/[0.07] bg-white px-4 py-3.5 shadow-[0_6px_20px_rgba(58,34,24,0.03)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#3A2218]">
                      {category.title}
                    </p>
                    <p className="text-xs text-[#7A6254]">
                      {category.imageCount ?? 0} imagen
                      {(category.imageCount ?? 0) === 1 ? "" : "es"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(category);
                      setFormOpen(true);
                    }}
                    className="grid size-9 place-items-center rounded-lg text-[#3A2218] transition hover:bg-[#FAF3E6]"
                    aria-label={`Editar ${category.title}`}
                  >
                    <PencilLine className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(category)}
                    className="grid size-9 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                    aria-label={`Eliminar ${category.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <GalleryCategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
      />
      <DeleteGalleryCategoryModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        category={deleting}
        categories={categories}
      />
    </DashboardShell>
  );
}

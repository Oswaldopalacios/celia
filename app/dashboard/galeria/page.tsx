"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ImagePlus,
  Images,
  PencilLine,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DeleteGalleryImageModal } from "@/components/gallery/delete-gallery-image-modal";
import { GalleryImageFormModal } from "@/components/gallery/gallery-image-form-modal";
import { ProductImage } from "@/components/ui/product-image";
import {
  useGalleryCategories,
  useGalleryImages,
  useUpdateGalleryImage,
} from "@/hooks/use-gallery";
import { getApiErrorMessage } from "@/lib/api";
import {
  dashboardBtnPrimary,
  dashboardPageSubtitle,
  dashboardPageTitle,
} from "@/lib/dashboard-theme";
import type { GalleryImage } from "@/lib/types";

export default function GalleryDashboardPage() {
  const imagesQuery = useGalleryImages();
  const categoriesQuery = useGalleryCategories();
  const updateImage = useUpdateGalleryImage();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null,
  );

  const images = imagesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return images.filter((image) => {
      const matchesSearch =
        !term ||
        image.title.toLowerCase().includes(term) ||
        (image.description ?? "").toLowerCase().includes(term) ||
        (image.category?.title ?? "").toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" || image.category?._id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [images, search, categoryFilter]);

  const toggleFeatured = async (image: GalleryImage) => {
    if (!image.category?._id || togglingFeaturedId) return;
    setTogglingFeaturedId(image._id);
    try {
      await updateImage.mutateAsync({
        id: image._id,
        payload: {
          title: image.title,
          description: image.description ?? "",
          location: image.location ?? "Restaurante Doña Celia",
          category: image.category._id,
          isFeatured: !image.isFeatured,
          image: null,
        },
      });
    } catch (error) {
      console.error(getApiErrorMessage(error));
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-7 sm:px-8 lg:px-10 lg:pt-9">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <h1 className={dashboardPageTitle}>Galería</h1>
            <p className={dashboardPageSubtitle}>
              {imagesQuery.isLoading
                ? "Cargando imágenes..."
                : `${filtered.length} de ${images.length} imagen${images.length === 1 ? "" : "es"}`}
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className={`${dashboardBtnPrimary} hover:-translate-y-0.5`}
          >
            <Plus className="size-4" />
            Nueva imagen
          </button>
        </motion.header>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B09A89]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título o categoría..."
              className="h-11 w-full rounded-xl border border-[#3A2218]/8 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[#B09A89] focus:border-[#C62A1E]/40 focus:ring-4 focus:ring-[#C62A1E]/8"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                categoryFilter === "all"
                  ? "bg-[#C62A1E] text-white"
                  : "border border-[#3A2218]/10 bg-white text-[#7A6254]"
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => setCategoryFilter(category._id)}
                className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                  categoryFilter === category._id
                    ? "bg-[#C62A1E] text-white"
                    : "border border-[#3A2218]/10 bg-white text-[#7A6254]"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {imagesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[#3A2218]/15 bg-white/60 px-6 text-center">
            <div>
              <Images className="mx-auto mb-3 size-10 text-[#B09A89]" />
              <p className="font-semibold text-[#3A2218]">
                {images.length === 0
                  ? "La galería está vacía"
                  : "Sin resultados"}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-[#7A6254]">
                {images.length === 0
                  ? "Sube fotos del restaurante, eventos o platillos para mostrarlas en la página pública."
                  : "Prueba con otra categoría o búsqueda."}
              </p>
              {images.length === 0 ? (
                <button
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  className={`${dashboardBtnPrimary} mx-auto mt-5`}
                >
                  <ImagePlus className="size-4" />
                  Subir imagen
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((image, index) => (
                <motion.article
                  key={image._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: Math.min(index * 0.03, 0.25) }}
                  className="group overflow-hidden rounded-2xl border border-[#3A2218]/[0.07] bg-white shadow-[0_8px_28px_rgba(58,34,24,0.035)]"
                >
                  <div className="relative aspect-[4/5] bg-[#EAD7BD]">
                    <ProductImage
                      src={image.image}
                      alt={image.title}
                      fill
                      className="object-contain p-2"
                      sizes="(min-width: 1280px) 280px, (min-width: 1024px) 33vw, 50vw"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3A2218] backdrop-blur">
                          {image.category?.title ?? "Sin categoría"}
                        </span>
                        {image.isFeatured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#C62A1E]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                            <Star className="size-2.5 fill-current" />
                            Destacada
                          </span>
                        ) : null}
                      </div>
                      <div className="flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={togglingFeaturedId === image._id}
                          onClick={() => toggleFeatured(image)}
                          className={`grid size-8 place-items-center rounded-lg shadow-sm transition disabled:opacity-60 ${
                            image.isFeatured
                              ? "bg-[#C62A1E] text-white"
                              : "bg-white/95 text-[#3A2218] hover:text-[#C62A1E]"
                          }`}
                          aria-label={
                            image.isFeatured
                              ? `Quitar ${image.title} de destacados`
                              : `Destacar ${image.title}`
                          }
                          aria-pressed={Boolean(image.isFeatured)}
                        >
                          <Star
                            className="size-4"
                            fill={image.isFeatured ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(image);
                            setFormOpen(true);
                          }}
                          className="grid size-8 place-items-center rounded-lg bg-white/95 text-[#3A2218] shadow-sm"
                          aria-label={`Editar ${image.title}`}
                        >
                          <PencilLine className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(image)}
                          className="grid size-8 place-items-center rounded-lg bg-white/95 text-red-500 shadow-sm"
                          aria-label={`Eliminar ${image.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-display)] truncate text-sm font-semibold text-[#3A2218]">
                      {image.title}
                    </h3>
                    {image.description?.trim() ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7A6254]">
                        {image.description}
                      </p>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <GalleryImageFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        image={editing}
      />
      <DeleteGalleryImageModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        image={deleting}
      />
    </DashboardShell>
  );
}

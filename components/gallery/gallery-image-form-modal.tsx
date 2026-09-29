"use client";

import { motion } from "framer-motion";
import {
  AlignLeft,
  Check,
  FolderPlus,
  ImagePlus,
  MapPin,
  PencilLine,
  RefreshCcw,
  Star,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import {
  useCreateGalleryCategory,
  useCreateGalleryImage,
  useUpdateGalleryImage,
} from "@/hooks/use-gallery";
import { getApiErrorMessage, getImageUrl } from "@/lib/api";
import {
  dashboardBtnPrimary,
  dashboardBtnSecondary,
  dashboardInput,
} from "@/lib/dashboard-theme";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

type GalleryImageFormModalProps = {
  open: boolean;
  onClose: () => void;
  categories: GalleryCategory[];
  image?: GalleryImage | null;
};

function FieldLabel({
  icon: Icon,
  htmlFor,
  children,
  optional,
}: {
  icon: typeof Tag;
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-1.5 font-[family-name:var(--font-nunito)] text-xs font-semibold text-[#3A2218]"
    >
      <Icon className="size-3.5 shrink-0 text-[#C62A1E]" strokeWidth={2.4} />
      <span>{children}</span>
      {optional ? (
        <span className="ml-0.5 rounded-full bg-[#F1E3CB] px-1.5 py-0.5 text-[10px] font-semibold text-[#7A6254]">
          Opcional
        </span>
      ) : null}
    </label>
  );
}

export function GalleryImageFormModal({
  open,
  onClose,
  categories,
  image,
}: GalleryImageFormModalProps) {
  const isEditing = Boolean(image);
  const createImage = useCreateGalleryImage();
  const updateImage = useUpdateGalleryImage();
  const createCategory = useCreateGalleryCategory();
  const pending =
    createImage.isPending || updateImage.isPending || createCategory.isPending;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Restaurante Doña Celia");
  const [category, setCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(image?.title ?? "");
    setDescription(image?.description ?? "");
    setLocation(image?.location?.trim() || "Restaurante Doña Celia");
    setCategory(image?.category?._id ?? "");
    setIsFeatured(Boolean(image?.isFeatured));
    setNewCategoryTitle("");
    setShowNewCategory(categories.length === 0);
    setFile(null);
    setPreview(image?.image ? getImageUrl(image.image) : null);
    setDragOver(false);
    setError("");
  }, [open, image, categories.length]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (next: File | null | undefined) => {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    setFile(next);
    setError("");
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateCategory = async () => {
    const value = newCategoryTitle.trim();
    if (!value) {
      setError("Escribe un nombre para la categoría.");
      return;
    }
    try {
      const { category: created } = await createCategory.mutateAsync({
        title: value,
      });
      setCategory(created._id);
      setNewCategoryTitle("");
      setShowNewCategory(false);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !category) {
      setError("Completa título y categoría para continuar.");
      return;
    }
    if (!isEditing && !file) {
      setError("Sube una imagen para la galería.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || "Restaurante Doña Celia",
      category,
      isFeatured,
      image: file,
    };

    try {
      if (isEditing && image) {
        await updateImage.mutateAsync({ id: image._id, payload });
      } else {
        await createImage.mutateAsync(payload);
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
      size="xl"
      title={isEditing ? "Editar imagen" : "Nueva imagen"}
      description={
        isEditing
          ? "Actualiza los datos de esta foto en la galería pública."
          : "Sube una foto y asígnale una categoría (ej. Eventos, Restaurante)."
      }
      icon={
        isEditing ? (
          <PencilLine className="size-5" />
        ) : (
          <ImagePlus className="size-5" />
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
            form="gallery-image-form"
            disabled={pending}
            className={`${dashboardBtnPrimary} min-w-[148px] px-6`}
          >
            {pending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                Guardando...
              </>
            ) : isEditing ? (
              <>
                <Check className="size-4" />
                Guardar cambios
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                Agregar imagen
              </>
            )}
          </button>
        </>
      }
    >
      <form
        id="gallery-image-form"
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <div className="overflow-hidden rounded-[22px] border border-[#3A2218]/10 bg-[#FAF3E6]/50">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              pickFile(event.dataTransfer.files?.[0]);
            }}
            className={`relative border-b border-[#3A2218]/8 transition ${
              dragOver ? "bg-[#C62A1E]/10" : "bg-[#F1E3CB]"
            }`}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative block aspect-[16/10] w-full cursor-pointer"
            >
              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt="Vista previa"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-[#2B170E]/0 opacity-0 transition group-hover:bg-[#2B170E]/45 group-hover:opacity-100">
                    <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#3A2218]">
                      <RefreshCcw className="size-3.5" />
                      Cambiar foto
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex h-full items-center justify-center gap-4 px-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#C62A1E] shadow-sm">
                    <ImagePlus className="size-6" />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-semibold text-[#3A2218]">
                      Subir o soltar imagen
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#7A6254]">
                      Obligatoria · JPG, PNG o WEBP
                    </span>
                  </span>
                </span>
              )}
            </button>
            {preview && !isEditing ? (
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-sm"
                aria-label="Quitar imagen"
              >
                <X className="size-4" />
              </button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
          </div>

          <div className="space-y-4 bg-white p-4 sm:p-5">
            <div>
              <FieldLabel icon={Tag} htmlFor="gallery-title">
                Título
              </FieldLabel>
              <input
                id="gallery-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Nuestro restaurante"
                className={`h-12 ${dashboardInput}`}
                autoFocus={!isEditing}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <FieldLabel icon={FolderPlus} htmlFor="gallery-category">
                  Categoría
                </FieldLabel>
                <button
                  type="button"
                  onClick={() => setShowNewCategory((value) => !value)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C62A1E]"
                >
                  {showNewCategory ? "Usar existente" : "Nueva categoría"}
                </button>
              </div>

              {showNewCategory ? (
                <div className="rounded-2xl border border-[#C62A1E]/20 bg-[#C62A1E]/5 p-3">
                  <div className="flex gap-2">
                    <input
                      value={newCategoryTitle}
                      onChange={(event) =>
                        setNewCategoryTitle(event.target.value)
                      }
                      placeholder="Ej. Eventos"
                      className={`h-11 flex-1 ${dashboardInput}`}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={createCategory.isPending}
                      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#C62A1E] px-3.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <Check className="size-3.5" />
                      Crear
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  id="gallery-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={`h-12 cursor-pointer appearance-none pr-10 ${dashboardInput} ${
                    category ? "" : "text-[#B09A89]"
                  }`}
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categories.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <FieldLabel
                icon={AlignLeft}
                htmlFor="gallery-description"
                optional
              >
                Descripción
              </FieldLabel>
              <textarea
                id="gallery-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Una breve historia de este momento…"
                rows={3}
                className={`resize-none py-3 ${dashboardInput}`}
              />
            </div>

            <div>
              <FieldLabel icon={MapPin} htmlFor="gallery-location" optional>
                Ubicación
              </FieldLabel>
              <input
                id="gallery-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Restaurante Doña Celia"
                className={`h-12 ${dashboardInput}`}
              />
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isFeatured}
              onClick={() => setIsFeatured((value) => !value)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                isFeatured
                  ? "border-[#C62A1E]/30 bg-[#C62A1E]/8"
                  : "border-[#3A2218]/10 bg-[#FAF3E6]/70 hover:border-[#3A2218]/18"
              }`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${
                  isFeatured
                    ? "bg-[#C62A1E] text-white"
                    : "bg-white text-[#3A2218]"
                }`}
              >
                <Star
                  className="size-5"
                  fill={isFeatured ? "currentColor" : "none"}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#3A2218]">
                  Galería destacada
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-[#7A6254]">
                  Aparece en el carrusel de destacados de la página pública.
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  isFeatured ? "bg-[#C62A1E]" : "bg-[#3A2218]/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
                    isFeatured ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
          >
            {error}
          </motion.p>
        ) : null}
      </form>
    </Modal>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  AlignLeft,
  Check,
  FolderPlus,
  Hash,
  ImagePlus,
  PackagePlus,
  PencilLine,
  RefreshCcw,
  Star,
  Tag,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import {
  newPortionDraft,
  ProductPricingField,
  validatePortionDrafts,
  type PortionDraft,
  type PricingMode,
} from "@/components/products/product-pricing-field";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { getApiErrorMessage, getImageUrl } from "@/lib/api";
import {
  dashboardBtnPrimary,
  dashboardBtnSecondary,
  dashboardInput,
} from "@/lib/dashboard-theme";
import type { Product, ProductCategory, ProductType } from "@/lib/types";

type ProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  categories: ProductCategory[];
  product?: Product | null;
};

const PRODUCT_TYPES: {
  id: ProductType;
  label: string;
  hint: string;
  icon: typeof UtensilsCrossed;
}[] = [
  {
    id: "comida",
    label: "Comida",
    hint: "Platillos y entradas",
    icon: UtensilsCrossed,
  },
  {
    id: "bebidas",
    label: "Bebidas",
    hint: "Drinks y refrescos",
    icon: Wine,
  },
];

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A6254]">
      {children}
    </p>
  );
}

export function ProductFormModal({
  open,
  onClose,
  categories,
  product,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const pending = createProduct.isPending || updateProduct.isPending;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pricingMode, setPricingMode] = useState<PricingMode>("single");
  const [portions, setPortions] = useState<PortionDraft[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [productType, setProductType] = useState<ProductType>("comida");
  const [category, setCategory] = useState("");
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(product?.name ?? "");
    setDescription(product?.description ?? "");
    const savedPortions = product?.portions ?? [];
    setPrice(product && savedPortions.length === 0 ? String(product.price) : "");
    setPricingMode(savedPortions.length > 0 ? "portions" : "single");
    setPortions(
      savedPortions.map((portion) => ({
        ...newPortionDraft(portion.name, String(portion.price)),
        _id: portion._id,
      })),
    );
    setQuantity(product?.quantity?.trim() ? product.quantity : "1");
    setProductType(product?.productType === "bebidas" ? "bebidas" : "comida");
    setCategory(product?.category?._id ?? "");
    setIsSoldOut(Boolean(product?.isSoldOut));
    setIsFeatured(Boolean(product?.isFeatured));
    setCategoryModalOpen(false);
    setImage(null);
    setPreview(
      product && product.image?.trim() ? getImageUrl(product.image) : null,
    );
    setDragOver(false);
    setError("");
  }, [open, product]);

  const categoriesForType = useMemo(
    () =>
      categories.filter((c) => {
        const kind = c.kind === "bebidas" ? "bebidas" : "comida";
        return kind === productType;
      }),
    [categories, productType],
  );

  useEffect(() => {
    if (!open || !category) return;
    if (!categoriesForType.some((c) => c._id === category)) setCategory("");
  }, [open, categoriesForType, category]);

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const pickFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    setImage(file);
    setError("");
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCategoryCreated = (created: ProductCategory) => {
    setProductType(created.kind === "bebidas" ? "bebidas" : "comida");
    setCategory(created._id);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const usesPortions = pricingMode === "portions";

    if (!name.trim() || !category || (!usesPortions && !price.trim())) {
      setError("Completa nombre, precio y categoría para continuar.");
      return;
    }

    if (usesPortions) {
      const portionError = validatePortionDrafts(portions);
      if (portionError) {
        setError(portionError);
        return;
      }
    } else if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      setError("El precio debe ser un número mayor a cero.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: usesPortions
        ? String(Math.min(...portions.map((portion) => Number(portion.price))))
        : price,
      quantity: quantity.trim() || "1",
      productType,
      category,
      isSoldOut,
      isFeatured,
      image,
      portions: usesPortions
        ? portions.map((portion) => ({
            _id: portion._id,
            name: portion.name.trim(),
            price: portion.price,
          }))
        : [],
    };

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product._id, payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const selectedCategoryTitle = categoriesForType.find(
    (c) => c._id === category,
  )?.title;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        locked={pending || categoryModalOpen}
        size="xl"
        title={isEditing ? "Editar producto" : "Nuevo producto"}
        description={
          isEditing
            ? "Actualiza lo que ves en el menú. La foto solo cambia si subes una nueva."
            : "Completa los datos clave: tipo, nombre, precio y categoría."
        }
        icon={
          isEditing ? (
            <PencilLine className="size-5" />
          ) : (
            <PackagePlus className="size-5" />
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
              form="product-form"
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
                  <PackagePlus className="size-4" />
                  Crear producto
                </>
              )}
            </button>
          </>
        }
      >
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {/* Tipo */}
          <section className="space-y-2.5">
            <SectionTitle>1. Tipo de producto</SectionTitle>
            <div
              className="grid grid-cols-2 gap-2.5"
              role="radiogroup"
              aria-label="Tipo de producto"
            >
              {PRODUCT_TYPES.map((option) => {
                const active = productType === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setProductType(option.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                      active
                        ? "border-[#C62A1E]/35 bg-[#C62A1E]/8 shadow-[0_8px_20px_rgba(198,42,30,0.12)]"
                        : "border-[#3A2218]/10 bg-[#FAF3E6]/60 hover:border-[#3A2218]/20 hover:bg-[#FAF3E6]"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        active
                          ? "bg-[#C62A1E] text-white"
                          : "bg-white text-[#3A2218]"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-bold ${
                          active ? "text-[#C62A1E]" : "text-[#3A2218]"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-tight text-[#7A6254]">
                        {option.hint}
                      </span>
                    </span>
                    {active ? (
                      <Check className="ml-auto size-4 shrink-0 text-[#C62A1E]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card unificada: foto + datos principales */}
          <section className="space-y-2.5">
            <SectionTitle>2. Datos del producto</SectionTitle>
            <div className="overflow-hidden rounded-[22px] border border-[#3A2218]/10 bg-[#FAF3E6]/50 shadow-[0_8px_28px_rgba(58,34,24,0.05)]">
              {/* Foto a ancho completo */}
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
                  className="group relative block aspect-[21/9] w-full cursor-pointer sm:aspect-[2.4/1]"
                >
                  {preview ? (
                    <>
                      <Image
                        src={preview}
                        alt="Vista previa del producto"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-[#2B170E]/0 opacity-0 transition group-hover:bg-[#2B170E]/45 group-hover:opacity-100">
                        <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#3A2218] shadow-sm">
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
                          Opcional · JPG, PNG o WEBP · se ve así en el menú
                        </span>
                      </span>
                    </span>
                  )}
                </button>
                {preview ? (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-sm transition hover:bg-white hover:text-[#C62A1E]"
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

              {/* Campos debajo de la foto */}
              <div className="space-y-4 bg-white p-4 sm:p-5">
                <div>
                  <FieldLabel icon={Tag} htmlFor="product-name">
                    Nombre
                  </FieldLabel>
                  <input
                    id="product-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Enchiladas de mole"
                    className={`h-12 ${dashboardInput}`}
                    autoFocus={!isEditing}
                  />
                </div>

                <ProductPricingField
                  mode={pricingMode}
                  onModeChange={setPricingMode}
                  price={price}
                  onPriceChange={setPrice}
                  portions={portions}
                  onPortionsChange={setPortions}
                />

                <div>
                  <FieldLabel icon={Hash} htmlFor="product-quantity" optional>
                    Presentación
                  </FieldLabel>
                  <input
                    id="product-quantity"
                    value={quantity === "1" ? "" : quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="Ej. Con arroz, frijoles y tortillas · 250 g"
                    className={`h-12 ${dashboardInput}`}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <FieldLabel icon={FolderPlus} htmlFor="product-category">
                      Categoría
                    </FieldLabel>
                    <button
                      type="button"
                      onClick={() => setCategoryModalOpen(true)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C62A1E] transition hover:text-[#3A2218] disabled:opacity-50"
                    >
                      <FolderPlus className="size-3.5" />
                      Nueva categoría
                    </button>
                  </div>

                  {categoriesForType.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setCategoryModalOpen(true)}
                      disabled={pending}
                      className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-[#C62A1E]/35 bg-[#C62A1E]/5 px-4 py-3.5 text-left transition hover:bg-[#C62A1E]/10 disabled:opacity-50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#C62A1E] shadow-sm">
                        <FolderPlus className="size-4" />
                      </span>
                      <span>
                        <span className="block text-[13px] font-bold text-[#3A2218]">
                          Crear la primera categoría
                        </span>
                        <span className="block text-[11px] text-[#7A6254]">
                          Aún no hay categorías de{" "}
                          {productType === "bebidas" ? "bebidas" : "comida"}.
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div>
                      <select
                        id="product-category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className={`h-12 cursor-pointer appearance-none pr-10 ${dashboardInput} ${
                          category ? "" : "text-[#B09A89]"
                        }`}
                      >
                        <option value="" disabled>
                          Selecciona una categoría
                        </option>
                        {categoriesForType.map((option) => (
                          <option key={option._id} value={option._id}>
                            {option.title}
                          </option>
                        ))}
                      </select>
                      {selectedCategoryTitle ? (
                        <p className="mt-1.5 text-[11px] text-[#7A6254]">
                          Se mostrará en{" "}
                          <span className="font-semibold text-[#3A2218]">
                            {selectedCategoryTitle}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Detalles */}
          <section className="space-y-3">
            <SectionTitle>3. Detalles</SectionTitle>
            <div>
              <FieldLabel
                icon={AlignLeft}
                htmlFor="product-description"
                optional
              >
                Descripción
              </FieldLabel>
              <textarea
                id="product-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ingredientes, acompañamientos o notas para el cliente…"
                rows={3}
                className={`resize-none py-3 ${dashboardInput}`}
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
                  Destacar en el menú
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-[#7A6254]">
                  Aparece en el carrusel de platillos destacados de la página
                  pública.
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

            <button
              type="button"
              role="switch"
              aria-checked={isSoldOut}
              onClick={() => setIsSoldOut((value) => !value)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                isSoldOut
                  ? "border-[#C62A1E]/30 bg-[#C62A1E]/8"
                  : "border-[#3A2218]/10 bg-[#FAF3E6]/70 hover:border-[#3A2218]/18"
              }`}
            >
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  isSoldOut ? "bg-[#C62A1E]" : "bg-[#3A2218]/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
                    isSoldOut ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#3A2218]">
                  Marcar como agotado
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-[#7A6254]">
                  Sigue visible en el menú, pero el cliente ve que no está
                  disponible.
                </span>
              </span>
            </button>
          </section>

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

      <CategoryFormModal
        open={open && categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        defaultKind={productType}
        onCreated={handleCategoryCreated}
      />
    </>
  );
}

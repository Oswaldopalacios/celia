"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  PencilLine,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import { DeleteCategoryModal } from "@/components/categories/delete-category-modal";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CategoryGlyph } from "@/components/public/category-glyph";
import { resolveCategoryIcon } from "@/lib/category-icons";
import {
  dashboardBtnPrimary,
  dashboardPageSubtitle,
  dashboardPageTitle,
  dashboardTabActive,
  dashboardTabInactive,
  dashboardTabTrack,
} from "@/lib/dashboard-theme";
import { useCategories, useReorderCategories } from "@/hooks/use-products";
import { getApiErrorMessage } from "@/lib/api";
import type { ProductCategory, ProductType } from "@/lib/types";

type KindFilter = "all" | ProductType;

export default function CategoriasPage() {
  const { data: categories = [], isLoading, isError } = useCategories();
  const reorder = useReorderCategories();
  const [filter, setFilter] = useState<KindFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [deleting, setDeleting] = useState<ProductCategory | null>(null);
  const [orderError, setOrderError] = useState("");

  const filtered = useMemo(() => {
    if (filter === "all") return categories;
    return categories.filter((category) =>
      filter === "bebidas"
        ? category.kind === "bebidas"
        : category.kind !== "bebidas",
    );
  }, [categories, filter]);

  const moveCategory = (category: ProductCategory, direction: -1 | 1) => {
    const index = filtered.findIndex((item) => item._id === category._id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= filtered.length) return;

    const nextFiltered = [...filtered];
    const [moved] = nextFiltered.splice(index, 1);
    nextFiltered.splice(target, 0, moved);

    const queue = [...nextFiltered];
    const visible = new Set(filtered.map((item) => item._id));
    const ids = categories.map((item) =>
      visible.has(item._id) ? queue.shift()!._id : item._id,
    );

    setOrderError("");
    reorder.mutate(ids, {
      onError: (error) => setOrderError(getApiErrorMessage(error)),
    });
  };

  const counts = useMemo(
    () => ({
      all: categories.length,
      comida: categories.filter((c) => c.kind !== "bebidas").length,
      bebidas: categories.filter((c) => c.kind === "bebidas").length,
    }),
    [categories],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: ProductCategory) => {
    setEditing(category);
    setFormOpen(true);
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[960px] px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pt-9">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6254]">
              Catálogo
            </p>
            <h1 className={`${dashboardPageTitle} mt-1`}>Categorías</h1>
            <p className={`${dashboardPageSubtitle} max-w-lg leading-6`}>
              El orden de esta lista es el del menú público. Todos queda
              siempre al inicio. Las bebidas se muestran juntas, en el lugar
              de la primera categoría de bebidas.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={dashboardBtnPrimary}
          >
            <FolderPlus className="size-4" />
            Nueva categoría
          </button>
        </header>

        <div className={`mb-5 flex gap-1 ${dashboardTabTrack}`}>
          {(
            [
              { id: "all", label: "Todas", count: counts.all },
              { id: "comida", label: "Comida", count: counts.comida },
              { id: "bebidas", label: "Bebidas", count: counts.bebidas },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active ? dashboardTabActive : dashboardTabInactive
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active
                      ? "bg-[#C62A1E]/10 text-[#C62A1E]"
                      : "bg-[#F1E3CB] text-[#7A6254]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl bg-[#F1E3CB]"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            No se pudieron cargar las categorías.
          </p>
        )}

        {orderError && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {orderError}
          </p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#3A2218]/15 bg-white px-6 py-14 text-center">
            <Boxes className="mx-auto size-10 text-[#B09A89]" />
            <p className="mt-3 text-sm font-semibold text-[#3A2218]">
              No hay categorías todavía
            </p>
            <p className="mt-1 text-xs text-[#7A6254]">
              Crea la primera para empezar a organizar el menú.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className={`${dashboardBtnPrimary} mt-5 inline-flex px-4 py-2.5`}
            >
              <FolderPlus className="size-4" />
              Crear categoría
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {filtered.map((category, index) => {
                const isDrink = category.kind === "bebidas";
                const count = category.productCount ?? 0;
                return (
                  <motion.li
                    key={category._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(index * 0.03, 0.2) }}
                    className="flex items-center gap-3 rounded-2xl border border-[#3A2218]/[0.07] bg-white px-4 py-3.5 shadow-[0_4px_18px_rgba(58,34,24,0.04)]"
                  >
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        isDrink
                          ? "bg-[#3A2218]/10 text-[#3A2218]"
                          : "bg-[#C62A1E]/10 text-[#C62A1E]"
                      }`}
                    >
                      <CategoryGlyph
                        icon={resolveCategoryIcon(category)}
                        className="size-5"
                        weight="duotone"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-[family-name:var(--font-display)] truncate text-[15px] font-semibold text-[#3A2218]">
                          {category.title}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isDrink
                              ? "bg-[#3A2218]/10 text-[#3A2218]"
                              : "bg-[#C62A1E]/10 text-[#C62A1E]"
                          }`}
                        >
                          {isDrink ? "Bebidas" : "Comida"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#7A6254]">
                        {count} producto{count === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => moveCategory(category, -1)}
                        disabled={index === 0 || reorder.isPending}
                        className="grid size-10 place-items-center rounded-xl text-[#3A2218] transition hover:bg-[#FAF3E6] disabled:pointer-events-none disabled:opacity-30"
                        aria-label={`Subir ${category.title}`}
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(category, 1)}
                        disabled={
                          index === filtered.length - 1 || reorder.isPending
                        }
                        className="grid size-10 place-items-center rounded-xl text-[#3A2218] transition hover:bg-[#FAF3E6] disabled:pointer-events-none disabled:opacity-30"
                        aria-label={`Bajar ${category.title}`}
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="grid size-10 place-items-center rounded-xl text-[#3A2218] transition hover:bg-[#C62A1E]/10 hover:text-[#C62A1E]"
                        aria-label={`Editar ${category.title}`}
                      >
                        <PencilLine className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(category)}
                        className="grid size-10 place-items-center rounded-xl text-[#A0463A] transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Eliminar ${category.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <CategoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        category={editing}
      />

      <DeleteCategoryModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        category={deleting}
        categories={categories}
      />
    </DashboardShell>
  );
}

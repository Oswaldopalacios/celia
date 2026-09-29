"use client";

import { MagnifyingGlass, MagicWand } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CategoryGlyph } from "@/components/public/category-glyph";
import {
  CATEGORY_ICON_GROUPS,
  CATEGORY_ICON_OPTIONS,
  resolveCategoryIcon,
  type CategoryIconId,
} from "@/lib/category-icons";
import { dashboardInput } from "@/lib/dashboard-theme";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function CategoryIconPicker({
  value,
  onChange,
  title,
}: {
  value: CategoryIconId | "";
  onChange: (icon: CategoryIconId | "") => void;
  title: string;
}) {
  const [query, setQuery] = useState("");
  const autoIcon = resolveCategoryIcon({ title });

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return CATEGORY_ICON_GROUPS.map((group) => ({
      group,
      options: CATEGORY_ICON_OPTIONS.filter(
        (option) =>
          option.group === group &&
          (!q || normalize(option.label).includes(q) || option.id.includes(q)),
      ),
    })).filter((entry) => entry.options.length > 0);
  }, [query]);

  const tileClass = (active: boolean) =>
    `flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition ${
      active
        ? "border-[#C62A1E] bg-[#C62A1E]/10 text-[#C62A1E]"
        : "border-transparent bg-[#FAF3E6] text-[#3A2218] hover:border-[#3A2218]/15 hover:bg-white"
    }`;

  return (
    <div className="space-y-3">
      <div className="relative">
        <MagnifyingGlass
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B09A89]"
          weight="bold"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar ícono (café, chile, pastel…)"
          className={`h-10 pl-10 ${dashboardInput}`}
          aria-label="Buscar ícono"
        />
      </div>

      <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
        {!query && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
              value === ""
                ? "border-[#C62A1E] bg-[#C62A1E]/10"
                : "border-[#3A2218]/10 bg-white hover:bg-[#FAF3E6]"
            }`}
            aria-pressed={value === ""}
          >
            <span className="grid size-9 place-items-center rounded-lg bg-white text-[#3A2218] shadow-sm">
              <CategoryGlyph icon={autoIcon} className="size-5" weight="duotone" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#3A2218]">
                <MagicWand className="size-3.5 text-[#C62A1E]" weight="fill" />
                Automático
              </span>
              <span className="block text-[11px] text-[#7A6254]">
                Se elige según el nombre de la categoría
              </span>
            </span>
          </button>
        )}

        {groups.map(({ group, options }) => (
          <div key={group}>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A6254]">
              {group}
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              {options.map((option) => {
                const active = value === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className={tileClass(active)}
                    aria-pressed={active}
                    title={option.label}
                  >
                    <CategoryGlyph
                      icon={option.id}
                      className="size-6"
                      weight={active ? "fill" : "regular"}
                    />
                    <span className="w-full truncate text-[9.5px] font-semibold leading-tight">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="py-6 text-center text-xs text-[#7A6254]">
            No hay íconos que coincidan con “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

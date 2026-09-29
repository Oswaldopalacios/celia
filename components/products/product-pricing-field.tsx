"use client";

import {
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { dashboardInput } from "@/lib/dashboard-theme";
import { formatMenuPrice } from "@/lib/menu-public";
import { MAX_PORTION_NAME, MAX_PORTIONS, PORTION_PRESETS } from "@/lib/portions";

export type PricingMode = "single" | "portions";

export type PortionDraft = {
  key: string;
  _id?: string;
  name: string;
  price: string;
};

let draftCounter = 0;
export function newPortionDraft(name = "", price = ""): PortionDraft {
  draftCounter += 1;
  return { key: `draft-${draftCounter}`, name, price };
}

/** Returns an error message, or "" when the portions can be saved. */
export function validatePortionDrafts(portions: PortionDraft[]) {
  if (portions.length === 0) return "Agrega al menos una porción.";
  const seen = new Set<string>();
  for (const portion of portions) {
    const name = portion.name.trim();
    if (!name) return "Cada porción necesita un nombre (ej. Orden, 1/2 orden).";
    const key = name.toLocaleLowerCase("es");
    if (seen.has(key)) return `La porción "${name}" está repetida.`;
    seen.add(key);
    const price = Number(portion.price);
    if (!portion.price.trim() || Number.isNaN(price) || price <= 0) {
      return `Escribe un precio mayor a cero para "${name}".`;
    }
  }
  return "";
}

function PriceInput({
  id,
  value,
  onChange,
  placeholder,
  compact = false,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  compact?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-[family-name:var(--font-nunito)] text-sm font-extrabold text-[#C62A1E]">
        $
      </span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.5"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`pl-7 ${compact ? "h-11 pr-3" : "h-12 pr-14"} ${dashboardInput}`}
      />
      {compact ? null : (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#B09A89]">
          MXN
        </span>
      )}
    </div>
  );
}

export function ProductPricingField({
  mode,
  onModeChange,
  price,
  onPriceChange,
  portions,
  onPortionsChange,
}: {
  mode: PricingMode;
  onModeChange: (mode: PricingMode) => void;
  price: string;
  onPriceChange: (price: string) => void;
  portions: PortionDraft[];
  onPortionsChange: (portions: PortionDraft[]) => void;
}) {
  const updatePortion = (key: string, patch: Partial<PortionDraft>) =>
    onPortionsChange(
      portions.map((portion) =>
        portion.key === key ? { ...portion, ...patch } : portion,
      ),
    );

  const movePortion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= portions.length) return;
    const next = [...portions];
    [next[index], next[target]] = [next[target], next[index]];
    onPortionsChange(next);
  };

  const applyPreset = (names: string[]) =>
    onPortionsChange(
      names.map((name, index) => {
        const existing = portions[index];
        return existing
          ? { ...existing, name }
          : newPortionDraft(name);
      }),
    );

  const switchMode = (next: PricingMode) => {
    if (next === mode) return;
    if (next === "portions" && portions.length === 0) {
      onPortionsChange([
        newPortionDraft("Orden", price),
        newPortionDraft("1/2 orden"),
      ]);
    }
    if (next === "single" && !price.trim() && portions[0]?.price) {
      onPriceChange(portions[0].price);
    }
    onModeChange(next);
  };

  const validPrices = portions
    .map((portion) => Number(portion.price))
    .filter((value) => value > 0);
  const lowest = validPrices.length ? Math.min(...validPrices) : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-[family-name:var(--font-nunito)] text-xs font-semibold text-[#3A2218]">
          <CircleDollarSign
            className="size-3.5 shrink-0 text-[#C62A1E]"
            strokeWidth={2.4}
          />
          Precio
        </span>
        <div
          className="inline-flex rounded-xl bg-[#F1E3CB] p-0.5"
          role="radiogroup"
          aria-label="Forma de cobro"
        >
          {(
            [
              { id: "single", label: "Precio único" },
              { id: "portions", label: "Por porciones" },
            ] as const
          ).map((option) => {
            const active = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => switchMode(option.id)}
                className={`rounded-[10px] px-3 py-1.5 text-[11px] font-bold transition ${
                  active
                    ? "bg-white text-[#3A2218] shadow-sm"
                    : "text-[#7A6254] hover:text-[#3A2218]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "single" ? (
        <PriceInput
          id="product-price"
          value={price}
          onChange={onPriceChange}
          placeholder="120"
        />
      ) : (
        <div className="rounded-2xl border border-[#3A2218]/10 bg-[#FAF3E6]/70 p-3">
          <div className="mb-2 grid grid-cols-[1fr_112px_auto] gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7A6254] sm:grid-cols-[1fr_132px_auto]">
            <span>Porción</span>
            <span>Precio</span>
            <span className="w-[68px]" aria-hidden />
          </div>

          <ul className="space-y-2">
            {portions.map((portion, index) => (
              <li
                key={portion.key}
                className="grid grid-cols-[1fr_112px_auto] items-center gap-2 sm:grid-cols-[1fr_132px_auto]"
              >
                <input
                  value={portion.name}
                  onChange={(event) =>
                    updatePortion(portion.key, { name: event.target.value })
                  }
                  maxLength={MAX_PORTION_NAME}
                  placeholder={index === 0 ? "Orden" : "1/2 orden"}
                  aria-label={`Nombre de la porción ${index + 1}`}
                  className={`h-11 ${dashboardInput}`}
                />
                <PriceInput
                  compact
                  value={portion.price}
                  onChange={(value) =>
                    updatePortion(portion.key, { price: value })
                  }
                  placeholder={index === 0 ? "120" : "70"}
                  ariaLabel={`Precio de ${portion.name.trim() || `la porción ${index + 1}`}`}
                />
                <div className="flex w-[68px] items-center justify-end gap-0.5">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => movePortion(index, -1)}
                      disabled={index === 0}
                      className="grid h-5 w-6 place-items-center rounded text-[#7A6254] transition hover:text-[#3A2218] disabled:opacity-25"
                      aria-label="Subir porción"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePortion(index, 1)}
                      disabled={index === portions.length - 1}
                      className="grid h-5 w-6 place-items-center rounded text-[#7A6254] transition hover:text-[#3A2218] disabled:opacity-25"
                      aria-label="Bajar porción"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onPortionsChange(
                        portions.filter((item) => item.key !== portion.key),
                      )
                    }
                    className="grid size-9 place-items-center rounded-lg text-[#A0463A] transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Quitar ${portion.name.trim() || "porción"}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => onPortionsChange([...portions, newPortionDraft()])}
            disabled={portions.length >= MAX_PORTIONS}
            className="mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#C62A1E]/35 text-[12px] font-bold text-[#C62A1E] transition hover:bg-[#C62A1E]/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
            Agregar porción
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7A6254]">
              <Layers className="size-3" />
              Atajos
            </span>
            {PORTION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.names)}
                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3A2218] ring-1 ring-[#3A2218]/10 transition hover:ring-[#C62A1E]/40"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-4 text-[#7A6254]">
            El cliente elige la porción al agregarla a su pedido.
            {lowest !== null ? (
              <>
                {" "}
                En listados se mostrará{" "}
                <span className="font-semibold text-[#3A2218]">
                  desde {formatMenuPrice(lowest)}
                </span>
                .
              </>
            ) : null}
          </p>
        </div>
      )}
    </div>
  );
}

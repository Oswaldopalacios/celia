import type { Product, ProductPortion } from "@/lib/types";

export const MAX_PORTIONS = 8;
export const MAX_PORTION_NAME = 40;

export const PORTION_PRESETS: { label: string; names: string[] }[] = [
  { label: "Orden + ½ orden", names: ["Orden", "1/2 orden"] },
  { label: "Orden + Pieza", names: ["Orden", "Pieza"] },
  { label: "Chico · Mediano · Grande", names: ["Chico", "Mediano", "Grande"] },
  { label: "Vaso + Litro", names: ["Vaso", "Litro"] },
];

export function productPortions(product: Pick<Product, "portions">) {
  return product.portions ?? [];
}

export function hasPortionChoice(product: Pick<Product, "portions">) {
  return productPortions(product).length > 1;
}

/** Portion to use when the product can be added with a single tap. */
export function defaultPortion(
  product: Pick<Product, "portions">,
): ProductPortion | undefined {
  const portions = productPortions(product);
  return portions.length === 1 ? portions[0] : undefined;
}

export function lowestPortionPrice(portions: { price: number }[]) {
  return portions.reduce(
    (min, portion) => Math.min(min, portion.price),
    Number.POSITIVE_INFINITY,
  );
}

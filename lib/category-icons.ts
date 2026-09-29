import { categoryIconKey, type CategoryIconKey } from "@/lib/menu-public";

export const CATEGORY_ICON_GROUPS = [
  "Platillos",
  "Ingredientes",
  "Mariscos",
  "Postres",
  "Bebidas",
  "Otros",
] as const;

export type CategoryIconGroup = (typeof CATEGORY_ICON_GROUPS)[number];

export const CATEGORY_ICON_OPTIONS = [
  { id: "fork-knife", label: "Cubiertos", group: "Platillos" },
  { id: "cooking-pot", label: "Guisados de olla", group: "Platillos" },
  { id: "bowl-steam", label: "Caldos y pozole", group: "Platillos" },
  { id: "bowl-food", label: "Cazuela", group: "Platillos" },
  { id: "chef-hat", label: "De la casa", group: "Platillos" },
  { id: "egg-crack", label: "Desayunos", group: "Platillos" },
  { id: "egg", label: "Huevos al gusto", group: "Platillos" },
  { id: "flame", label: "Al carbón", group: "Platillos" },
  { id: "fire", label: "Picante", group: "Platillos" },
  { id: "popcorn", label: "Botanas", group: "Platillos" },
  { id: "bread", label: "Pan / tortas", group: "Platillos" },
  { id: "tray", label: "Charola", group: "Platillos" },
  { id: "knife", label: "Cuchillo", group: "Platillos" },
  { id: "call-bell", label: "Servicio", group: "Platillos" },
  { id: "hamburger", label: "Hamburguesa", group: "Platillos" },
  { id: "pizza", label: "Pizza", group: "Platillos" },

  { id: "grains", label: "Maíz / tortillas", group: "Ingredientes" },
  { id: "pepper", label: "Chile", group: "Ingredientes" },
  { id: "avocado", label: "Aguacate", group: "Ingredientes" },
  { id: "jar-label", label: "Salsas", group: "Ingredientes" },
  { id: "cheese", label: "Queso", group: "Ingredientes" },
  { id: "cow", label: "Res", group: "Ingredientes" },
  { id: "bird", label: "Pollo", group: "Ingredientes" },
  { id: "carrot", label: "Verduras", group: "Ingredientes" },
  { id: "leaf", label: "Ensalada / nopales", group: "Ingredientes" },
  { id: "plant", label: "Vegetariano", group: "Ingredientes" },
  { id: "orange-slice", label: "Limón / cítricos", group: "Ingredientes" },
  { id: "orange", label: "Naranja", group: "Ingredientes" },
  { id: "cherries", label: "Frutas", group: "Ingredientes" },
  { id: "jar", label: "Frasco", group: "Ingredientes" },

  { id: "shrimp", label: "Camarón", group: "Mariscos" },
  { id: "fish", label: "Pescado", group: "Mariscos" },
  { id: "fish-simple", label: "Filete", group: "Mariscos" },
  { id: "waves", label: "Agua", group: "Mariscos" },
  { id: "tree-palm", label: "Palmera", group: "Mariscos" },

  { id: "cake", label: "Pastel", group: "Postres" },
  { id: "ice-cream", label: "Nieve / helado", group: "Postres" },
  { id: "popsicle", label: "Paleta", group: "Postres" },
  { id: "cookie", label: "Galleta / pan dulce", group: "Postres" },

  { id: "pint-glass", label: "Aguas frescas", group: "Bebidas" },
  { id: "coffee", label: "Café de olla", group: "Bebidas" },
  { id: "tea-bag", label: "Té / atole", group: "Bebidas" },
  { id: "beer-bottle", label: "Cerveza", group: "Bebidas" },
  { id: "beer-stein", label: "Michelada", group: "Bebidas" },
  { id: "brandy", label: "Mezcal / tequila", group: "Bebidas" },
  { id: "martini", label: "Coctel", group: "Bebidas" },
  { id: "wine", label: "Vino", group: "Bebidas" },
  { id: "champagne", label: "Champaña", group: "Bebidas" },
  { id: "coffee-bean", label: "Grano de café", group: "Bebidas" },
  { id: "drop", label: "Agua natural", group: "Bebidas" },
  { id: "snowflake", label: "Frappé", group: "Bebidas" },
  { id: "flask", label: "Mixología", group: "Bebidas" },

  { id: "star", label: "Destacado", group: "Otros" },
  { id: "sparkle", label: "Especial", group: "Otros" },
  { id: "crown", label: "Premium", group: "Otros" },
  { id: "heart", label: "Favoritos", group: "Otros" },
  { id: "gift", label: "Promoción", group: "Otros" },
  { id: "baby", label: "Infantil", group: "Otros" },
  { id: "sun", label: "Temporada", group: "Otros" },
] as const satisfies readonly {
  id: string;
  label: string;
  group: CategoryIconGroup;
}[];

export type CategoryIconId = (typeof CATEGORY_ICON_OPTIONS)[number]["id"];

export function isCategoryIcon(value: unknown): value is CategoryIconId {
  return CATEGORY_ICON_OPTIONS.some((option) => option.id === value);
}

const FALLBACK_BY_KEY: Record<CategoryIconKey, CategoryIconId> = {
  todos: "fork-knife",
  desayunos: "egg-crack",
  antojitos: "pepper",
  caldos: "bowl-steam",
  guisados: "cooking-pot",
  entradas: "avocado",
  mariscos: "shrimp",
  especialidades: "chef-hat",
  postres: "cake",
  bebidas: "pint-glass",
  default: "cooking-pot",
};

/** Explicit icon chosen in the dashboard, or one guessed from the title. */
export function resolveCategoryIcon(category?: {
  title?: string;
  icon?: string;
} | null): CategoryIconId {
  if (isCategoryIcon(category?.icon)) return category.icon;
  return FALLBACK_BY_KEY[categoryIconKey(category?.title ?? "")];
}

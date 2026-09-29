export function formatMenuPrice(price: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);
}

export type CategoryIconKey =
  | "todos"
  | "desayunos"
  | "antojitos"
  | "caldos"
  | "guisados"
  | "entradas"
  | "mariscos"
  | "especialidades"
  | "postres"
  | "bebidas"
  | "default";

export function categoryIconKey(title: string): CategoryIconKey {
  const t = title.toLowerCase();
  if (/(desayuno|almuerzo|chilaquil|huevo)/.test(t)) return "desayunos";
  if (
    /(antojito|taco|quesadilla|sope|gordita|tostada|tlacoyo|huarache|enchilada|tamal|empanada|flauta|pambazo|garnacha)/.test(
      t,
    )
  ) {
    return "antojitos";
  }
  if (/(caldo|pozole|menudo|sopa|consom[eé]|birria|mole de olla)/.test(t)) {
    return "caldos";
  }
  if (/(guisado|mole|cochinita|carnitas|barbacoa|chicharr[oó]n|tinga|comida corrida)/.test(t)) {
    return "guisados";
  }
  if (/(entrada|botana|guacamole|frijol|salsa)/.test(t)) return "entradas";
  if (/(marisco|camar[oó]n|pescado|ceviche|filete)/.test(t)) return "mariscos";
  if (/(especial|de la casa)/.test(t)) return "especialidades";
  if (/(postre|dulce|flan|arroz con leche|churro|pan|pastel|helado|pay)/.test(t)) {
    return "postres";
  }
  if (
    /(bebida|agua|horchata|jamaica|atole|champurrado|caf[eé]|refresco|cerveza|mezcal|tequila|michelada)/.test(
      t,
    )
  ) {
    return "bebidas";
  }
  return "default";
}

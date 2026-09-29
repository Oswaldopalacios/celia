import type { Product, ProductPortion, ProductType } from "@/lib/types";

export type OrderItem = {
  /** Line key: one line per product + portion. */
  id: string;
  productId: string;
  portionId?: string;
  portionName?: string;
  name: string;
  price: number;
  image?: string;
  productType?: ProductType;
  quantity: number;
  note: string;
};

type OrderState = {
  items: OrderItem[];
  updatedAt: number;
};

const STORAGE_KEY = "donacelia:order:v1";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
const MAX_QUANTITY = 99;
const EMPTY: OrderItem[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedItems: OrderItem[] = EMPTY;

export function orderLineId(productId: string, portionId?: string) {
  return portionId ? `${productId}:${portionId}` : productId;
}

function isOrderItem(value: unknown): value is OrderItem {
  const item = value as OrderItem;
  return (
    typeof item?.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

function parse(raw: string | null): OrderItem[] {
  if (!raw) return EMPTY;
  try {
    const state = JSON.parse(raw) as OrderState;
    if (Date.now() - state.updatedAt > MAX_AGE_MS) return EMPTY;
    if (!Array.isArray(state.items)) return EMPTY;
    return state.items.filter(isOrderItem).map((item) => ({
      ...item,
      // Lines saved before portions existed only had the product id.
      productId: typeof item.productId === "string" ? item.productId : item.id,
      quantity: Math.min(Math.floor(item.quantity), MAX_QUANTITY),
      note: typeof item.note === "string" ? item.note : "",
    }));
  } catch {
    return EMPTY;
  }
}

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getOrderSnapshot(): OrderItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

export function getOrderServerSnapshot(): OrderItem[] {
  return EMPTY;
}

export function subscribeOrder(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(items: OrderItem[]) {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const state: OrderState = { items, updatedAt: Date.now() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Storage full or disabled (private mode): the order just won't persist.
  }
  listeners.forEach((listener) => listener());
}

function update(mutate: (items: OrderItem[]) => OrderItem[]) {
  write(mutate(getOrderSnapshot()));
}

export function addToOrder(
  product: Product,
  portion?: ProductPortion,
  quantity = 1,
) {
  const id = orderLineId(product._id, portion?._id);
  update((items) => {
    const existing = items.find((item) => item.id === id);
    if (existing) {
      return items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(item.quantity + quantity, MAX_QUANTITY),
            }
          : item,
      );
    }
    return [
      ...items,
      {
        id,
        productId: product._id,
        portionId: portion?._id,
        portionName: portion?.name,
        name: product.name,
        price: portion?.price ?? product.price,
        image: product.image,
        productType: product.productType,
        quantity: Math.min(quantity, MAX_QUANTITY),
        note: "",
      },
    ];
  });
}

export function setOrderQuantity(id: string, quantity: number) {
  update((items) =>
    quantity <= 0
      ? items.filter((item) => item.id !== id)
      : items.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
            : item,
        ),
  );
}

export function setOrderNote(id: string, note: string) {
  update((items) =>
    items.map((item) =>
      item.id === id ? { ...item, note: note.slice(0, 140) } : item,
    ),
  );
}

export function removeFromOrder(id: string) {
  update((items) => items.filter((item) => item.id !== id));
}

export function clearOrder() {
  write(EMPTY);
}

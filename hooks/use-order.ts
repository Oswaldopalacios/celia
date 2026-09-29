"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  addToOrder,
  clearOrder,
  getOrderServerSnapshot,
  getOrderSnapshot,
  orderLineId,
  removeFromOrder,
  setOrderNote,
  setOrderQuantity,
  subscribeOrder,
} from "@/lib/order-store";

export function useOrder() {
  const items = useSyncExternalStore(
    subscribeOrder,
    getOrderSnapshot,
    getOrderServerSnapshot,
  );

  return useMemo(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      total: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      /** Quantity of one line (a product, or a product in a given portion). */
      quantityOf: (productId: string, portionId?: string) =>
        items.find((item) => item.id === orderLineId(productId, portionId))
          ?.quantity ?? 0,
      /** Quantity of a product across all of its portions. */
      productCount: (productId: string) =>
        items
          .filter((item) => item.productId === productId)
          .reduce((total, item) => total + item.quantity, 0),
      add: addToOrder,
      setQuantity: setOrderQuantity,
      setNote: setOrderNote,
      remove: removeFromOrder,
      clear: clearOrder,
    }),
    [items],
  );
}

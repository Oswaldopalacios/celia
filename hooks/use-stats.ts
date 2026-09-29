"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { productKeys } from "@/hooks/use-products";
import type { CatalogStatsResponse } from "@/lib/types";

export function useCatalogStats() {
  return useQuery({
    queryKey: productKeys.stats,
    queryFn: async () => {
      const { data } = await api.get<CatalogStatsResponse>("/api/stats");
      return data.stats;
    },
  });
}

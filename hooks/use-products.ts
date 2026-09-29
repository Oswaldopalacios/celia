"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CategoriesResponse,
  Product,
  ProductCategory,
  ProductPayload,
  ProductsResponse,
  ProductType,
} from "@/lib/types";

export const productKeys = {
  all: ["products"] as const,
  categories: ["categories"] as const,
  stats: ["catalog-stats"] as const,
};

function toFormData(payload: ProductPayload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description?.trim() ?? "");
  formData.append("price", payload.price);
  formData.append("quantity", payload.quantity?.trim() || "1");
  formData.append("productType", payload.productType);
  formData.append("category", payload.category);
  formData.append("isSoldOut", payload.isSoldOut ? "true" : "false");
  formData.append("isFeatured", payload.isFeatured ? "true" : "false");
  if (payload.image) {
    formData.append("image", payload.image);
  }
  if (payload.portions) {
    formData.append("portions", JSON.stringify(payload.portions));
  }
  return formData;
}

const multipartConfig = {
  headers: { "Content-Type": undefined as unknown as string },
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ProductsResponse>("/api/products");
      return data.products;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: async () => {
      const { data } = await api.get<CategoriesResponse>("/api/categories");
      return data.categories;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const { data } = await api.post<{ message: string; product: Product }>(
        "/api/products",
        toFormData(payload),
        multipartConfig,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
      queryClient.invalidateQueries({ queryKey: productKeys.stats });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ProductPayload;
    }) => {
      const { data } = await api.patch<{ message: string; product: Product }>(
        `/api/products/${id}`,
        toFormData(payload),
        multipartConfig,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
      queryClient.invalidateQueries({ queryKey: productKeys.stats });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      kind: ProductType;
      icon?: string;
    }) => {
      const { data } = await api.post<{
        message: string;
        category: ProductCategory;
      }>("/api/categories", payload);
      return data;
    },
    onSuccess: ({ category }) => {
      queryClient.setQueryData<ProductCategory[]>(
        productKeys.categories,
        (current) => (current ? [...current, category] : current),
      );
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
      queryClient.invalidateQueries({ queryKey: productKeys.stats });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { title?: string; kind?: ProductType; icon?: string };
    }) => {
      const { data } = await api.patch<{
        message: string;
        category: ProductCategory;
      }>(`/api/categories/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.stats });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reassignTo,
    }: {
      id: string;
      reassignTo?: string;
    }) => {
      const { data } = await api.delete<{
        message: string;
        reassignedCount?: number;
      }>(`/api/categories/${id}`, {
        data: reassignTo ? { reassignTo } : {},
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.stats });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ message: string }>(
        `/api/products/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.categories });
      queryClient.invalidateQueries({ queryKey: productKeys.stats });
    },
  });
}

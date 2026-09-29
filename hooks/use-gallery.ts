"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  GalleryCategoriesResponse,
  GalleryCategory,
  GalleryImage,
  GalleryImagePayload,
  GalleryImagesResponse,
} from "@/lib/types";

export const galleryKeys = {
  images: ["gallery-images"] as const,
  categories: ["gallery-categories"] as const,
};

function toFormData(payload: GalleryImagePayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description?.trim() ?? "");
  formData.append("location", payload.location?.trim() || "Restaurante Doña Celia");
  formData.append("category", payload.category);
  formData.append("isFeatured", payload.isFeatured ? "true" : "false");
  if (payload.image) {
    formData.append("image", payload.image);
  }
  return formData;
}

const multipartConfig = {
  headers: { "Content-Type": undefined as unknown as string },
};

export function useGalleryImages() {
  return useQuery({
    queryKey: galleryKeys.images,
    queryFn: async () => {
      const { data } = await api.get<GalleryImagesResponse>("/api/gallery-images");
      return data.images;
    },
  });
}

export function useGalleryCategories() {
  return useQuery({
    queryKey: galleryKeys.categories,
    queryFn: async () => {
      const { data } = await api.get<GalleryCategoriesResponse>(
        "/api/gallery-categories",
      );
      return data.categories;
    },
  });
}

export function useCreateGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GalleryImagePayload) => {
      const { data } = await api.post<{ message: string; image: GalleryImage }>(
        "/api/gallery-images",
        toFormData(payload),
        multipartConfig,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.images });
      queryClient.invalidateQueries({ queryKey: galleryKeys.categories });
    },
  });
}

export function useUpdateGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: GalleryImagePayload;
    }) => {
      const { data } = await api.patch<{ message: string; image: GalleryImage }>(
        `/api/gallery-images/${id}`,
        toFormData(payload),
        multipartConfig,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.images });
      queryClient.invalidateQueries({ queryKey: galleryKeys.categories });
    },
  });
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ message: string }>(
        `/api/gallery-images/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.images });
      queryClient.invalidateQueries({ queryKey: galleryKeys.categories });
    },
  });
}

export function useCreateGalleryCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string }) => {
      const { data } = await api.post<{
        message: string;
        category: GalleryCategory;
      }>("/api/gallery-categories", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.categories });
    },
  });
}

export function useUpdateGalleryCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { title: string };
    }) => {
      const { data } = await api.patch<{
        message: string;
        category: GalleryCategory;
      }>(`/api/gallery-categories/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.categories });
      queryClient.invalidateQueries({ queryKey: galleryKeys.images });
    },
  });
}

export function useDeleteGalleryCategory() {
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
      }>(`/api/gallery-categories/${id}`, {
        data: reassignTo ? { reassignTo } : {},
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.categories });
      queryClient.invalidateQueries({ queryKey: galleryKeys.images });
    },
  });
}

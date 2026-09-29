"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DEFAULT_LOCATION } from "@/lib/location";
import type {
  ContactSettingsInput,
  ContactSettingsResponse,
} from "@/lib/types";

export const contactKeys = {
  all: ["contact-settings"] as const,
};

export function useContactSettings() {
  return useQuery({
    queryKey: contactKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ContactSettingsResponse>("/api/contact");
      return data.contact;
    },
  });
}

/** Public location data; falls back to defaults only if the request fails. */
export function useLocationSettings() {
  const query = useContactSettings();
  return {
    location: query.data ?? DEFAULT_LOCATION,
    isLoading: query.isLoading,
  };
}

export function useUpdateContactSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<ContactSettingsInput>) => {
      const { data } = await api.patch<ContactSettingsResponse>(
        "/api/contact",
        payload,
      );
      return data.contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

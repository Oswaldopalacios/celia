"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoginCredentials, User } from "@/lib/types";

export const authKeys = {
  user: ["auth", "user"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const { data } = await api.get<User>("/auth/isLogged");
      return data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<{ message: string; user: User }>(
        "/auth/login",
        credentials,
      );
      return data;
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.user, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user, null);
      queryClient.removeQueries({ queryKey: authKeys.user });
    },
  });
}

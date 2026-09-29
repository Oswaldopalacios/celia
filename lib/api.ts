import axios from "axios";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function hasProductImage(imagePath?: string | null) {
  return Boolean(imagePath && String(imagePath).trim());
}

export function getImageUrl(imagePath?: string | null) {
  if (!hasProductImage(imagePath)) return "";
  const path = imagePath!.trim();
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No pudimos completar la solicitud.";
  }

  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

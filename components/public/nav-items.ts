export const publicNavLinks = [
  {
    href: "/",
    label: "Menú",
    match: (path: string) => path === "/" || path.startsWith("/platillo"),
  },
  {
    href: "/galeria",
    label: "Galería",
    match: (path: string) => path.startsWith("/galeria"),
  },
  {
    href: "/ubicacion",
    label: "Ubicación",
    match: (path: string) => path.startsWith("/ubicacion"),
  },
] as const;

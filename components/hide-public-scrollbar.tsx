"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/platillo") ||
    pathname.startsWith("/galeria") ||
    pathname.startsWith("/ubicacion")
  );
}

export function HidePublicScrollbar() {
  const pathname = usePathname();

  useEffect(() => {
    const hide = isPublicPath(pathname);
    const root = document.documentElement;

    root.classList.toggle("scrollbar-none", hide);
    document.body.classList.toggle("scrollbar-none", hide);

    return () => {
      root.classList.remove("scrollbar-none");
      document.body.classList.remove("scrollbar-none");
    };
  }, [pathname]);

  return null;
}

"use client";

import { Suspense } from "react";
import { GalleryHome } from "@/components/public/gallery-home";

export default function GaleriaPage() {
  return (
    <Suspense fallback={null}>
      <GalleryHome />
    </Suspense>
  );
}

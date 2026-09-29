import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { GalleryHome } from "@/components/public/gallery-home";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Galería",
  description:
    "Fotos del restaurante Doña Celia: nuestros platillos, la cocina, eventos y el ambiente familiar que nos acompaña desde 1989.",
  path: "/galeria",
});

export default function GaleriaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Menú", path: "/" },
          { name: "Galería", path: "/galeria" },
        ])}
      />
      <Suspense fallback={null}>
        <GalleryHome />
      </Suspense>
    </>
  );
}

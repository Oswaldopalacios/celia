import { JsonLd } from "@/components/json-ld";
import { ComoLlegarHome } from "@/components/public/ubicacion-home";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Cómo llegar",
  description:
    "Cómo llegar al restaurante Doña Celia: mapa, puntos de referencia y medios de contacto para visitarnos.",
  path: "/ubicacion/como-llegar",
});

export default function ComoLlegarPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Menú", path: "/" },
          { name: "Ubicación", path: "/ubicacion" },
          { name: "Cómo llegar", path: "/ubicacion/como-llegar" },
        ])}
      />
      <ComoLlegarHome />
    </>
  );
}

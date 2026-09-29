import { JsonLd } from "@/components/json-ld";
import { UbicacionHome } from "@/components/public/ubicacion-home";
import { breadcrumbJsonLd, getSiteContact, restaurantJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Ubicación y horarios",
  description:
    "Visita el restaurante Doña Celia: dirección, horarios, teléfono y WhatsApp. Comida típica mexicana en un ambiente familiar.",
  path: "/ubicacion",
});

export default async function UbicacionPage() {
  const contact = await getSiteContact();

  return (
    <>
      <JsonLd data={restaurantJsonLd(contact)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Menú", path: "/" },
          { name: "Ubicación", path: "/ubicacion" },
        ])}
      />
      <UbicacionHome />
    </>
  );
}

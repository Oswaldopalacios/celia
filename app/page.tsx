import { JsonLd } from "@/components/json-ld";
import { MenuHome } from "@/components/public/menu-home";
import { getSiteContact, restaurantJsonLd } from "@/lib/seo";
import { pageMetadata, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `${SITE_NAME} · ${SITE_TAGLINE} | Menú de comida típica mexicana`,
  absoluteTitle: true,
  description:
    "Menú de Doña Celia: antojitos, guisados, caldos, desayunos y aguas frescas. Comida típica mexicana hecha en casa desde 1989.",
  path: "/",
});

export default async function Home() {
  const contact = await getSiteContact();

  return (
    <>
      <JsonLd data={restaurantJsonLd(contact)} />
      <MenuHome />
    </>
  );
}

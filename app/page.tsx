import type { Metadata } from "next";
import { MenuHome } from "@/components/public/menu-home";

export const metadata: Metadata = {
  title: "Menú",
  description:
    "Menú de Doña Celia: antojitos, guisados, caldos, desayunos y aguas frescas. Comida típica mexicana desde 1989.",
};

export default function Home() {
  return <MenuHome />;
}

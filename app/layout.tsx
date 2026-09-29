import type { Metadata } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Kaushan_Script,
  Nunito_Sans,
} from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK", "opsz"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const kaushanScript = Kaushan_Script({
  variable: "--font-script",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const siteDescription =
  "Restaurante Doña Celia: comida típica mexicana hecha en casa desde 1989. Antojitos, guisados, caldos y aguas frescas. Las manos del buen sabor.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.restaurantedonacelia.com.mx"),
  title: {
    default: "Doña Celia",
    template: "%s | Doña Celia",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "Doña Celia",
    title: "Doña Celia · Las manos del buen sabor",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Doña Celia · Las manos del buen sabor",
    description: siteDescription,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${nunitoSans.variable} ${kaushanScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

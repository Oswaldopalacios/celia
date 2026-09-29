"use client";

import { ForkKnife, Images, MapPin } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PublicLogo } from "@/components/public/public-logo";
import { publicNavLinks } from "@/components/public/nav-items";

const icons = {
  "/": ForkKnife,
  "/galeria": Images,
  "/ubicacion": MapPin,
} as const;

export function PublicDesktopNav() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 hidden bg-transparent px-6 pt-5 lg:block">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-full border border-[#3A2218]/8 bg-white/92 py-1.5 pl-3 pr-1.5 shadow-[0_10px_32px_rgba(58,34,24,0.1)] backdrop-blur-md">
        <div className="flex shrink-0 items-center gap-2.5">
          <PublicLogo compact className="[&_img]:!h-10 [&_img]:lg:!h-11" />
          <Link href="/" className="leading-none" tabIndex={-1} aria-hidden>
            <span className="block font-[family-name:var(--font-display)] text-[19px] font-semibold text-[#3A2218]">
              Doña Celia
            </span>
            <span className="mt-0.5 block font-[family-name:var(--font-script)] text-[12px] text-[#2F6B3A]">
              Las manos del buen sabor
            </span>
          </Link>
        </div>

        <nav aria-label="Principal">
          <ul className="flex items-center gap-1">
            {publicNavLinks.map((item) => {
              const Icon = icons[item.href];
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-[family-name:var(--font-nunito)] text-[14px] font-semibold tracking-wide transition-all ${
                      active
                        ? "bg-[#C62A1E] text-white shadow-[0_6px_18px_rgba(198,42,30,0.28)]"
                        : "text-[#3A2218] hover:bg-[#FAF3E6]/80 hover:text-[#C62A1E]"
                    }`}
                  >
                    <Icon
                      size={17}
                      weight={active ? "fill" : "regular"}
                      className={active ? "text-white" : "text-[#3A2218]/70"}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

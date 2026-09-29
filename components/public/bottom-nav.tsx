"use client";

import { ForkKnife, Images, MapPin } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavLinks } from "@/components/public/nav-items";
import { PapelPicadoEdge } from "@/components/public/celia-marks";

const icons = {
  "/": ForkKnife,
  "/galeria": Images,
  "/ubicacion": MapPin,
} as const;

export function PublicBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] lg:hidden">
      <PapelPicadoEdge color="#2B170E" />
      <div className="pointer-events-auto bg-[#2B170E] px-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-1.5">
        <ul className="grid grid-cols-3">
          {publicNavLinks.map((item) => {
            const Icon = icons[item.href];
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-1.5 ${
                    active ? "text-[#E9A83B]" : "text-white/88"
                  }`}
                >
                  <Icon
                    size={22}
                    weight={active ? "fill" : "regular"}
                  />
                  <span className="font-[family-name:var(--font-nunito)] text-[11px] font-semibold tracking-wide">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

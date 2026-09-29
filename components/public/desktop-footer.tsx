import Link from "next/link";
import { PapelPicadoBanner } from "@/components/public/celia-marks";
import { publicNavLinks } from "@/components/public/nav-items";

export function PublicDesktopFooter() {
  return (
    <footer className="mt-16 hidden lg:block">
      <PapelPicadoBanner className="text-[#3A2218]/30" />
      <div className="mt-6 bg-[#2B170E] px-8 pb-10 pt-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">
              Doña Celia
            </p>
            <p className="mt-1.5 font-[family-name:var(--font-script)] text-[17px] leading-none text-[#E9A83B]">
              Las manos del buen sabor · Desde 1989
            </p>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {publicNavLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-[family-name:var(--font-nunito)] text-[13px] font-semibold text-white/85 transition-colors hover:text-[#E9A83B]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

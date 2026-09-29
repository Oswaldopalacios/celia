"use client";

import Link from "next/link";
import { useState } from "react";

type BrandLogoProps = {
  compact?: boolean;
  light?: boolean;
};

export function BrandLogo({ compact = false, light = false }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (light) {
    return (
      <Link href="/dashboard" className="block" aria-label="Doña Celia">
        {failed ? (
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
            Doña Celia
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logoV2.png"
            alt="Doña Celia Restaurante"
            onError={() => setFailed(true)}
            className="h-20 w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
          />
        )}
      </Link>
    );
  }

  return (
    <Link href="/dashboard" className="block" aria-label="Doña Celia">
      {failed ? (
        <span
          className={`font-[family-name:var(--font-display)] font-semibold text-[#3A2218] ${
            compact ? "text-base" : "text-xl"
          }`}
        >
          Doña Celia
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logoV2.png"
          alt="Doña Celia Restaurante"
          onError={() => setFailed(true)}
          className={`w-auto object-contain ${compact ? "h-10" : "h-12"}`}
        />
      )}
    </Link>
  );
}

export function BrandLogoSide({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href="/dashboard"
      className="flex w-full flex-col items-center gap-2 text-center"
      aria-label="Doña Celia"
    >
      {failed ? (
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Doña Celia
        </p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logoV2.png"
          alt="Doña Celia Restaurante"
          onError={() => setFailed(true)}
          className={`w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] ${
            compact ? "h-16" : "h-20"
          }`}
        />
      )}
      <p className="font-[family-name:var(--font-nunito)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
        Panel
      </p>
    </Link>
  );
}

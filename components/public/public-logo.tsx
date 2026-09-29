"use client";

import Link from "next/link";
import { useState } from "react";

type PublicLogoProps = {
  compact?: boolean;
  onPhoto?: boolean;
  className?: string;
};

export function PublicLogo({
  compact = false,
  onPhoto = false,
  className = "",
}: PublicLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Link href="/" className={`relative block ${className}`} aria-label="Doña Celia">
      {failed ? (
        <BrandFallback compact={compact} onPhoto={onPhoto} />
      ) : (
        // Native img so a missing logo falls back instead of breaking next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logoV2.png"
          alt="Doña Celia Restaurante, las manos del buen sabor, desde 1989"
          width={615}
          height={815}
          onError={() => setFailed(true)}
          className={`mx-auto w-auto object-contain drop-shadow-[0_6px_16px_rgba(31,15,8,0.28)] ${
            compact ? "h-14 lg:h-16" : "h-[4.75rem]"
          }`}
        />
      )}
    </Link>
  );
}

function BrandFallback({
  compact,
  onPhoto,
}: {
  compact: boolean;
  onPhoto: boolean;
}) {
  return (
    <span
      className={`flex flex-col items-center ${onPhoto ? "text-white" : "text-[#C62A1E]"}`}
    >
      <span
        className={`font-[family-name:var(--font-display)] font-bold leading-none ${
          compact ? "text-[17px]" : "text-[22px]"
        }`}
      >
        Doña Celia
      </span>
      <span
        className={`mt-0.5 font-[family-name:var(--font-script)] leading-none ${
          onPhoto ? "text-white/85" : "text-[#2F6B3A]"
        } ${compact ? "text-[10px]" : "text-[12px]"}`}
      >
        Desde 1989
      </span>
    </span>
  );
}

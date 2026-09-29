"use client";

import Image from "next/image";
import { getImageUrl, hasProductImage } from "@/lib/api";
import type { ProductType } from "@/lib/types";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  productType?: ProductType | null;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

function FoodIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden>
      <circle cx="40" cy="42" r="22" stroke="#C62A1E" strokeWidth="2.2" />
      <circle cx="40" cy="42" r="12" stroke="#C62A1E" strokeWidth="1.6" />
      <path
        d="M28 22c2.5-4 7-6.5 12-6.5S49.5 18 52 22"
        stroke="#C62A1E"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M34 36c1.5 2 3.5 3 6 3s4.5-1 6-3"
        stroke="#C62A1E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="34" cy="40" r="1.6" fill="#C62A1E" />
      <circle cx="46" cy="40" r="1.6" fill="#C62A1E" />
    </svg>
  );
}

function DrinkIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden>
      <path
        d="M30 18h20l-2.5 8H32.5L30 18Z"
        stroke="#3A2218"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M33 26h14L44.5 58a4 4 0 0 1-4 3.5h-1a4 4 0 0 1-4-3.5L33 26Z"
        stroke="#3A2218"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M35.5 36h9"
        stroke="#3A2218"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M48 22c4 1 7 4 7 8"
        stroke="#3A2218"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Placeholder({
  productType,
  className,
}: {
  productType?: ProductType | null;
  className?: string;
}) {
  const isDrink = productType === "bebidas";

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${
        isDrink ? "bg-[#3A2218]/10" : "bg-[#F1E3CB]"
      } ${className ?? ""}`}
    >
      {isDrink ? (
        <DrinkIllustration className="size-[55%] max-h-16 max-w-16 opacity-90" />
      ) : (
        <FoodIllustration className="size-[55%] max-h-16 max-w-16 opacity-90" />
      )}
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  productType,
  fill,
  className = "object-cover",
  sizes,
  width,
  height,
}: ProductImageProps) {
  if (!hasProductImage(src)) {
    if (fill) {
      return (
        <div className="absolute inset-0">
          <Placeholder productType={productType} />
          <span className="sr-only">{alt}</span>
        </div>
      );
    }

    return (
      <div
        className="overflow-hidden"
        style={
          width && height
            ? { width, height }
            : { width: "100%", height: "100%" }
        }
      >
        <Placeholder productType={productType} />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  const url = getImageUrl(src);

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        unoptimized
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? 80}
      height={height ?? 80}
      unoptimized
      className={className}
      sizes={sizes}
    />
  );
}

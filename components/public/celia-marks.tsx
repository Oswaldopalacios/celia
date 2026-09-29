"use client";

import { useId } from "react";

const PAPEL_PICADO_COLORS = ["#C62A1E", "#E9A83B", "#2F6B3A", "#D63A7A"];

/** Small embroidered-style flourish used next to section titles. */
export function SectionMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 12" fill="none" className={className} aria-hidden>
      <circle cx="2.5" cy="6" r="1.4" fill="currentColor" />
      <circle cx="25.5" cy="6" r="1.4" fill="currentColor" />
      <path
        d="M6 6h3.5M18.5 6H22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M14 1.5 18.5 6 14 10.5 9.5 6Z" fill="currentColor" />
    </svg>
  );
}

/** Scalloped edge that sits on top of a solid bar (papel picado cut). */
export function PapelPicadoEdge({
  color,
  className = "",
}: {
  color: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`h-2 w-full ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 100%, ${color} 7.5px, transparent 8px)`,
        backgroundSize: "16px 8px",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom",
      }}
    />
  );
}

/** Festive string of papel picado flags. */
export function PapelPicadoBanner({ className = "" }: { className?: string }) {
  const id = useId();
  const flagWidth = 44;

  return (
    <svg
      className={`block w-full ${className}`}
      height="30"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={id}
          width={flagWidth * PAPEL_PICADO_COLORS.length}
          height="30"
          patternUnits="userSpaceOnUse"
        >
          {PAPEL_PICADO_COLORS.map((color, index) => (
            <path
              key={color}
              transform={`translate(${index * flagWidth} 0)`}
              fill={color}
              fillRule="evenodd"
              d="M4 2h36v20l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4-4 4Zm18 5 4.5 5-4.5 5-4.5-5Z"
            />
          ))}
        </pattern>
      </defs>
      <line
        x1="0"
        y1="2"
        x2="100%"
        y2="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect width="100%" height="30" fill={`url(#${id})`} />
    </svg>
  );
}

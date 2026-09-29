"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  Car,
  Clock,
  EnvelopeSimple,
  MapPin,
  NavigationArrow,
  Phone,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LOCATION_REFERENCE_ICONS } from "@/components/public/location-reference-icon";
import { PublicFrame } from "@/components/public/public-frame";
import { PublicMenuButton } from "@/components/public/menu-button";
import { PublicLogo } from "@/components/public/public-logo";
import { SectionMark } from "@/components/public/celia-marks";
import { fadeUp, staggerFast } from "@/components/public/public-motion";
import {
  locationMapsQuery,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  mapsSearchUrl,
  telUrl,
  whatsappUrl,
} from "@/lib/location";
import { useLocationSettings } from "@/hooks/use-contact";

function SkeletonLine({ className }: { className: string }) {
  return (
    <span
      className={`block animate-pulse rounded-full bg-[#F1E3CB] ${className}`}
    />
  );
}

function MapFrame({
  title,
  query,
  loading,
}: {
  title: string;
  query: string;
  loading: boolean;
}) {
  if (loading || !query) {
    return <div className="absolute inset-0 animate-pulse bg-[#F1E3CB]" />;
  }
  return (
    <iframe
      key={query}
      title={title}
      src={mapsEmbedUrl(query)}
      className="absolute inset-0 size-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

export function UbicacionHome() {
  const { location, isLoading } = useLocationSettings();
  const { phone, whatsapp } = location;
  const mapsQuery = locationMapsQuery(location);

  const quickActions = [
    {
      id: "directions",
      label: "Cómo llegar",
      href: "/ubicacion/como-llegar",
      icon: Car,
      color: "text-[#3A2218]",
      bg: "bg-[#3A2218]/8",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: whatsappUrl(whatsapp),
      external: true,
      icon: WhatsappLogo,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/12",
    },
    {
      id: "call",
      label: "Llamar",
      href: telUrl(phone),
      external: true,
      icon: Phone,
      color: "text-[#C62A1E]",
      bg: "bg-[#C62A1E]/10",
    },
    {
      id: "maps",
      label: "Ver en Maps",
      href: mapsSearchUrl(mapsQuery),
      external: true,
      icon: MapPin,
      color: "text-[#EA4335]",
      bg: "bg-[#EA4335]/10",
    },
  ] as const;

  return (
    <PublicFrame>
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#EAD7BD]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/Headerv2.png"
            alt=""
            className="size-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF3E6]/35 via-[#FAF3E6]/75 to-[#FAF3E6]" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-4 pt-5 lg:hidden">
          <div className="size-10" aria-hidden />
          <PublicLogo compact />
          <PublicMenuButton light={false} />
        </div>

        <div className="relative z-10 px-5 pb-2 pt-6 lg:mx-auto lg:max-w-3xl lg:px-8 lg:pb-4 lg:pt-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <h1 className="font-[family-name:var(--font-display)] text-[34px] font-semibold leading-none text-[#3A2218] lg:text-[48px]">
              Ubicación
            </h1>
            <SectionMark className="mt-2 h-3 w-10 text-[#C62A1E]" />
            <p className="mt-3 text-[14px] font-normal leading-6 text-[#7A6254] lg:text-[16px] lg:leading-7">
              Ven a comer como en casa: sazón de siempre y recetas de Doña
              Celia desde 1989.
            </p>
          </motion.div>
        </div>
      </header>

      <motion.div
        className="space-y-4 px-5 pb-10 pt-4 lg:mx-auto lg:max-w-3xl lg:space-y-5 lg:px-8 lg:pb-16"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        <motion.section
          variants={fadeUp}
          className="rounded-[22px] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(58,34,24,0.08)] lg:px-5 lg:py-5"
        >
          <div className="flex items-start gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#C62A1E]/10 text-[#C62A1E]">
              <MapPin size={26} weight="fill" />
            </span>
            {isLoading ? (
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <SkeletonLine className="h-4 w-40" />
                <SkeletonLine className="h-3 w-full max-w-sm" />
              </div>
            ) : (
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-[#3A2218] lg:text-[20px]">
                  {location.place}
                </p>
                <p className="mt-1 text-[13px] font-normal leading-5 text-[#7A6254] lg:text-[14px] lg:leading-6">
                  {location.address}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-4 gap-2.5 sm:gap-3"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            const className =
              "flex flex-col items-center gap-2 rounded-[18px] bg-white px-1.5 py-3 text-center shadow-[0_8px_22px_rgba(58,34,24,0.06)] transition hover:-translate-y-0.5";
            const content = (
              <>
                <span
                  className={`grid size-10 place-items-center rounded-xl ${action.bg} ${action.color}`}
                >
                  <Icon size={20} weight="fill" />
                </span>
                <span className="font-[family-name:var(--font-nunito)] text-[10px] font-bold leading-tight text-[#3A2218] sm:text-[11px]">
                  {action.label}
                </span>
              </>
            );

            if ("external" in action && action.external) {
              return (
                <a
                  key={action.id}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={action.id} href={action.href} className={className}>
                {content}
              </Link>
            );
          })}
        </motion.div>

        <motion.section
          variants={fadeUp}
          className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_10px_28px_rgba(58,34,24,0.08)]"
        >
          <div className="relative aspect-[5/4] w-full bg-[#F1E3CB] sm:aspect-[16/11]">
            <MapFrame
              title={`Mapa de ${location.name}`}
              query={mapsQuery}
              loading={isLoading}
            />
            <a
              href={mapsSearchUrl(mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[12px] font-bold text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.16)] backdrop-blur"
            >
              Abrir en Google Maps
              <ArrowSquareOut size={14} weight="bold" />
            </a>
          </div>
        </motion.section>

        {(isLoading || location.hours.length > 0) && (
          <motion.section
            variants={fadeUp}
            className="rounded-[22px] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(58,34,24,0.08)] lg:px-5 lg:py-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-[#3A2218]/8 text-[#3A2218]">
                <Clock size={20} weight="fill" />
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-[17px] font-semibold text-[#3A2218]">
                Horarios
              </h2>
            </div>
            <ul className="mt-3 space-y-2">
              {isLoading
                ? [0, 1].map((i) => (
                    <li key={i} className="flex justify-between gap-3 pt-2">
                      <SkeletonLine className="h-3 w-28" />
                      <SkeletonLine className="h-3 w-32" />
                    </li>
                  ))
                : location.hours.map((item, index) => (
                    <li
                      key={`${item.label}-${index}`}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[#3A2218]/6 pt-2 text-[13px] first:border-t-0 first:pt-0"
                    >
                      <span className="font-semibold text-[#3A2218]">
                        {item.label}
                      </span>
                      <span className="text-[#7A6254]">{item.value}</span>
                    </li>
                  ))}
            </ul>
          </motion.section>
        )}

        {!isLoading && location.description && (
          <motion.section variants={fadeUp} className="pt-2">
            <div className="mb-2 flex items-center gap-2">
              <SectionMark className="h-3 w-7 text-[#C62A1E]" />
              <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.12em] text-[#3A2218]">
                Nuestra casa
              </h2>
            </div>
            <p className="whitespace-pre-line text-[14px] font-normal leading-6 text-[#7A6254] lg:text-[15px] lg:leading-7">
              {location.description}
            </p>
          </motion.section>
        )}

        <motion.section
          variants={fadeUp}
          className="relative overflow-hidden rounded-[22px] shadow-[0_12px_32px_rgba(58,34,24,0.12)]"
        >
          <div className="relative aspect-[16/10]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/Headerv2.png"
              alt={`Fachada de ${location.name}`}
              className="absolute inset-0 size-full object-cover object-[center_40%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B170E]/70 via-[#2B170E]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 text-center">
              <p className="font-[family-name:var(--font-script)] text-[36px] leading-none text-white lg:text-[44px]">
                Te esperamos
              </p>
              <SectionMark className="mx-auto mt-2 h-3 w-10 text-[#C62A1E]" />
            </div>
          </div>
        </motion.section>
      </motion.div>
    </PublicFrame>
  );
}

export function ComoLlegarHome() {
  const { location, isLoading } = useLocationSettings();
  const { phone, whatsapp, email } = location;
  const mapsQuery = locationMapsQuery(location);

  const contacts = [
    {
      id: "whatsapp",
      title: "WhatsApp",
      detail: "Enviar mensaje",
      href: whatsappUrl(whatsapp),
      icon: WhatsappLogo,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/12",
    },
    {
      id: "call",
      title: "Llamar",
      detail: phone,
      href: telUrl(phone),
      icon: Phone,
      color: "text-[#C62A1E]",
      bg: "bg-[#C62A1E]/10",
    },
    ...(email
      ? [
          {
            id: "email",
            title: "Email",
            detail: email,
            href: `mailto:${email}`,
            icon: EnvelopeSimple,
            color: "text-[#EA4335]",
            bg: "bg-[#EA4335]/10",
          },
        ]
      : []),
  ];

  return (
    <PublicFrame>
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#EAD7BD]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/Headerv2.png"
            alt=""
            className="size-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF3E6]/35 via-[#FAF3E6]/75 to-[#FAF3E6]" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-4 pt-5 lg:hidden">
          <Link
            href="/ubicacion"
            className="grid size-10 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-[0_6px_16px_rgba(58,34,24,0.1)]"
            aria-label="Volver a ubicación"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <PublicLogo compact />
          <PublicMenuButton light={false} />
        </div>

        <div className="relative z-10 px-5 pb-2 pt-6 lg:mx-auto lg:max-w-3xl lg:px-8 lg:pb-4 lg:pt-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <h1 className="font-[family-name:var(--font-display)] text-[34px] font-semibold leading-none text-[#3A2218] lg:text-[48px]">
              Cómo llegar
            </h1>
            <SectionMark className="mt-2 h-3 w-10 text-[#C62A1E]" />
            <p className="mt-3 text-[14px] font-normal leading-6 text-[#7A6254] lg:text-[16px] lg:leading-7">
              Encuéntranos fácilmente; aquí te esperamos con la mesa puesta.
            </p>
          </motion.div>
        </div>
      </header>

      <motion.div
        className="space-y-5 px-5 pb-10 pt-4 lg:mx-auto lg:max-w-3xl lg:px-8 lg:pb-16"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        <motion.section
          variants={fadeUp}
          className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_10px_28px_rgba(58,34,24,0.08)]"
        >
          <div className="relative aspect-[5/4] w-full bg-[#F1E3CB] sm:aspect-[16/10]">
            <MapFrame
              title={`Indicaciones a ${location.name}`}
              query={mapsQuery}
              loading={isLoading}
            />
            <a
              href={mapsSearchUrl(mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[12px] font-bold text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.16)]"
            >
              Abrir en Google Maps
              <ArrowSquareOut size={14} weight="bold" />
            </a>
            <a
              href={mapsDirectionsUrl(mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-2 text-[12px] font-bold text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.16)]"
            >
              <NavigationArrow size={16} weight="fill" className="text-[#3A2218]" />
              Indicaciones
            </a>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="flex items-center gap-3 rounded-[22px] bg-white p-2.5 pr-4 shadow-[0_8px_24px_rgba(58,34,24,0.06)]"
        >
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[16px] bg-[#F1E3CB]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logoV2.png"
              alt=""
              className="size-full object-contain p-1.5"
            />
          </div>
          {isLoading ? (
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="h-3 w-full max-w-xs" />
            </div>
          ) : (
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] truncate text-[16px] font-semibold text-[#3A2218]">
                {location.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-5 text-[#7A6254]">
                {location.address}
              </p>
            </div>
          )}
        </motion.section>

        <motion.section variants={fadeUp}>
          <div className="mb-3 flex items-center gap-2">
            <SectionMark className="h-3 w-7 text-[#C62A1E]" />
            <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.12em] text-[#3A2218]">
              Medios de contacto
            </h2>
          </div>
          <div
            className={`grid gap-2.5 ${contacts.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {contacts.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.id === "call" ? undefined : "_blank"}
                  rel={item.id === "call" ? undefined : "noopener noreferrer"}
                  className="flex flex-col items-center gap-2 rounded-[18px] bg-white px-2 py-4 text-center shadow-[0_8px_22px_rgba(58,34,24,0.06)] transition hover:-translate-y-0.5"
                >
                  <span
                    className={`grid size-11 place-items-center rounded-xl ${item.bg} ${item.color}`}
                  >
                    <Icon size={22} weight="fill" />
                  </span>
                  <span className="text-[12px] font-bold text-[#3A2218]">
                    {item.title}
                  </span>
                  <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-[#7A6254]">
                    {item.detail}
                  </span>
                </a>
              );
            })}
          </div>
        </motion.section>

        {!isLoading && location.references.length > 0 && (
          <motion.section variants={fadeUp}>
            <div className="mb-3 flex items-center gap-2">
              <SectionMark className="h-3 w-7 text-[#C62A1E]" />
              <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.12em] text-[#3A2218]">
                Puntos de referencia
              </h2>
            </div>
            <ul className="space-y-2.5">
              {location.references.map((item, index) => {
                const Icon = LOCATION_REFERENCE_ICONS[item.icon] ?? MapPin;
                return (
                  <li
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-3 rounded-[18px] bg-white px-3.5 py-3 shadow-[0_8px_22px_rgba(58,34,24,0.05)]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#3A2218]/8 text-[#3A2218]">
                      <Icon size={20} weight="fill" />
                    </span>
                    <span className="text-[14px] font-semibold text-[#3A2218]">
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.section>
        )}
      </motion.div>
    </PublicFrame>
  );
}

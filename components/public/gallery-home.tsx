"use client";

import {
  ArrowLeft,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  MapPin,
  ShareNetwork,
  Star,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { PublicFrame } from "@/components/public/public-frame";
import { PublicMenuButton } from "@/components/public/menu-button";
import { PublicLogo } from "@/components/public/public-logo";
import { SectionMark } from "@/components/public/celia-marks";
import { fadeUp, staggerFast } from "@/components/public/public-motion";
import {
  useGalleryCategories,
  useGalleryImages,
} from "@/hooks/use-gallery";
import { getImageUrl } from "@/lib/api";
import type { GalleryImage } from "@/lib/types";

type FilterId = "all" | string;

const FEATURED_AUTOPLAY_MS = 4500;

function formatGalleryDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function GalleryHome() {
  const imagesQuery = useGalleryImages();
  const categoriesQuery = useGalleryCategories();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterId>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const images = imagesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const loading = imagesQuery.isLoading || categoriesQuery.isLoading;

  useEffect(() => {
    const foto = searchParams.get("foto");
    if (foto && images.some((image) => image._id === foto)) {
      setActiveId(foto);
    }
  }, [searchParams, images]);

  const visible = useMemo(() => {
    if (filter === "all") return images;
    return images.filter((image) => image.category?._id === filter);
  }, [images, filter]);

  const featured = useMemo(() => {
    if (filter !== "all") return [];
    return images.filter((image) => image.isFeatured);
  }, [images, filter]);

  const activeIndex = useMemo(
    () => visible.findIndex((image) => image._id === activeId),
    [visible, activeId],
  );

  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
      if (event.key === "ArrowRight" && visible.length > 0) {
        const next = (Math.max(activeIndex, 0) + 1) % visible.length;
        setActiveId(visible[next]!._id);
      }
      if (event.key === "ArrowLeft" && visible.length > 0) {
        const prev =
          (Math.max(activeIndex, 0) - 1 + visible.length) % visible.length;
        setActiveId(visible[prev]!._id);
      }
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [activeId, activeIndex, visible]);

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
            href="/"
            className="grid size-10 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-[0_6px_16px_rgba(58,34,24,0.1)]"
            aria-label="Volver al menú"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          
          <PublicMenuButton light={false} />
        </div>

        <div className="relative z-10 px-5 pb-2 pt-6 lg:mx-auto lg:max-w-6xl lg:px-8 lg:pb-4 lg:pt-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <h1 className="font-[family-name:var(--font-display)] text-[34px] font-semibold leading-none text-[#3A2218] lg:text-[48px]">
              Galería
            </h1>
            <SectionMark className="mt-2 h-3 w-10 text-[#C62A1E]" />
            <p className="mt-3 text-[14px] font-normal leading-6 text-[#7A6254] lg:text-[16px] lg:leading-7">
              Momentos, sabores y experiencias en un solo lugar.
            </p>
          </motion.div>
        </div>
      </header>

      <motion.div
        className="mt-4 px-5 lg:mx-auto lg:mt-6 lg:max-w-6xl lg:px-8"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Categorías de galería"
        >
          <FilterChip
            label="Todos"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category._id}
              label={category.title}
              active={filter === category._id}
              onClick={() => setFilter(category._id)}
            />
          ))}
        </div>
      </motion.div>

      <div className="mt-5 px-5 pb-8 lg:mx-auto lg:mt-8 lg:max-w-6xl lg:px-8 lg:pb-12">
        {loading ? (
          <div className="space-y-5">
            <div className="aspect-[4/5] animate-pulse rounded-[22px] bg-white/80 md:aspect-[16/10]" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-[18px] bg-white/80"
                />
              ))}
            </div>
          </div>
        ) : imagesQuery.isError ? (
          <p className="py-16 text-center text-sm text-[#7A6254]">
            No pudimos cargar la galería. Intenta de nuevo.
          </p>
        ) : images.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#7A6254]">
            Pronto verás aquí nuestros momentos y sabores.
          </p>
        ) : (
          <div className="space-y-7 lg:space-y-10">
            {featured.length > 0 ? (
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <div className="mb-3 flex items-center gap-2 lg:mb-4">
                  <SectionMark className="h-3 w-7 text-[#C62A1E]" />
                  <h2 className="font-[family-name:var(--font-display)] text-[13px] font-bold uppercase tracking-[0.14em] text-[#3A2218] lg:text-[15px]">
                    Galería destacada
                  </h2>
                </div>
                <FeaturedGalleryCarousel
                  images={featured}
                  onOpen={(id) => setActiveId(id)}
                />
              </motion.section>
            ) : null}

            {visible.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#7A6254]">
                No hay fotos en esta categoría.
              </p>
            ) : (
              <motion.div
                key={filter}
                initial="hidden"
                animate="visible"
                variants={staggerFast}
                className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
              >
                {visible.map((image) => (
                  <motion.button
                    key={image._id}
                    type="button"
                    variants={fadeUp}
                    onClick={() => setActiveId(image._id)}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#EAD7BD] text-left shadow-[0_8px_24px_rgba(58,34,24,0.06)] ring-1 ring-[#3A2218]/6 lg:rounded-[22px]"
                  >
                    <Image
                      src={getImageUrl(image.image)}
                      alt={image.title}
                      fill
                      unoptimized
                      className="object-contain p-2 transition duration-500 group-hover:scale-[1.02] lg:p-2.5"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                    {image.isFeatured ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#C62A1E] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        <Star size={11} weight="fill" />
                        Destacada
                      </span>
                    ) : null}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeId && activeIndex >= 0 ? (
          <GalleryLightbox
            images={visible}
            index={activeIndex}
            onClose={() => setActiveId(null)}
            onSelect={setActiveId}
          />
        ) : null}
      </AnimatePresence>
    </PublicFrame>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition lg:text-[14px] ${
        active
          ? "bg-[#C62A1E] text-white shadow-[0_8px_18px_rgba(198,42,30,0.28)]"
          : "border border-[#3A2218]/12 bg-white text-[#3A2218]"
      }`}
    >
      {label}
    </button>
  );
}

function FeaturedGalleryCarousel({
  images,
  onOpen,
}: {
  images: GalleryImage[];
  onOpen: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const count = images.length;

  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : Math.min(current, count - 1)));
  }, [count]);

  const goTo = useEffectEvent((next: number, dir: number) => {
    if (count <= 1) return;
    setDirection(dir);
    setIndex(((next % count) + count) % count);
  });

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => {
      goTo(index + 1, 1);
    }, FEATURED_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count, index]);

  if (count === 0) return null;

  const image = images[index] ?? images[0]!;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="relative overflow-hidden rounded-[22px] bg-[#EAD7BD] shadow-[0_12px_32px_rgba(58,34,24,0.08)] ring-1 ring-[#3A2218]/6">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.button
            key={image._id}
            type="button"
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onOpen(image._id)}
            className="relative block w-full text-left"
            aria-label={`Ver ${image.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(image.image)}
              alt={image.title}
              className="block h-auto w-full"
            />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#C62A1E] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              <Star size={11} weight="fill" />
              Destacada
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3A2218]/55 to-transparent px-4 pb-4 pt-10">
              <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-white md:text-[22px]">
                {image.title}
              </p>
              {image.category?.title ? (
                <p className="mt-0.5 text-[12px] font-semibold text-white/80">
                  {image.category.title}
                </p>
              ) : null}
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-2 md:flex">
            <button
              type="button"
              onClick={() => goTo(index - 1, -1)}
              className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.14)] transition hover:text-[#C62A1E]"
              aria-label="Imagen destacada anterior"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1, 1)}
              className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white/95 text-[#3A2218] shadow-[0_8px_20px_rgba(58,34,24,0.14)] transition hover:text-[#C62A1E]"
              aria-label="Siguiente imagen destacada"
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>

          <div
            className="mt-3 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Galería destacada"
          >
            {images.map((item, itemIndex) => {
              const active = itemIndex === index;
              return (
                <button
                  key={item._id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Ver ${item.title}`}
                  onClick={() => goTo(itemIndex, itemIndex > index ? 1 : -1)}
                  className={`h-2 rounded-full transition-all ${
                    active
                      ? "w-6 bg-[#C62A1E]"
                      : "w-2 bg-[#3A2218]/20 hover:bg-[#3A2218]/35"
                  }`}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function GalleryLightbox({
  images,
  index,
  onClose,
  onSelect,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const image = images[index]!;
  const total = images.length;

  const share = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/galeria?foto=${image._id}`
        : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.title,
          text: image.description ?? image.title,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      // Usuario canceló o el navegador no permite compartir.
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-[#3A2218]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(image.image)}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-[#3A2218]/30" />
      </div>

      <div className="relative z-20 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] lg:px-8 lg:pt-6">
        <button
          type="button"
          onClick={onClose}
          className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/18 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          aria-label="Cerrar"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <p className="rounded-full border border-white/25 bg-white/18 px-3.5 py-1.5 font-[family-name:var(--font-nunito)] text-[13px] font-semibold tabular-nums text-white backdrop-blur-xl">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={share}
          className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/18 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          aria-label="Compartir"
        >
          <ShareNetwork size={20} weight="bold" />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-3 lg:px-10 lg:py-4">
        <motion.div
          key={image._id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full max-w-4xl"
        >
          <Image
            src={getImageUrl(image.image)}
            alt={image.title}
            fill
            unoptimized
            priority
            className="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
            sizes="(min-width: 1024px) 900px, 100vw"
          />
        </motion.div>
      </div>

      <div className="relative z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:mx-auto lg:w-full lg:max-w-3xl lg:px-8 lg:pb-8">
        <motion.div
          key={`meta-${image._id}`}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[26px] border border-white/30 bg-white/18 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] lg:p-5"
          style={{
            WebkitBackdropFilter: "blur(28px) saturate(1.35)",
            backdropFilter: "blur(28px) saturate(1.35)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-[#FAF3E6]/10" />

          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-white lg:text-[26px]">
              {image.title}
            </h2>
            {image.description?.trim() ? (
              <p className="mt-1.5 text-[13px] font-normal leading-5 text-white/80 lg:text-[15px] lg:leading-6">
                {image.description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-semibold text-white/90 lg:text-[13px]">
              {image.createdAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlank size={14} weight="bold" className="text-[#C62A1E]" />
                  {formatGalleryDate(image.createdAt)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} weight="bold" className="text-[#C62A1E]" />
                {image.location?.trim() || "Restaurante Doña Celia"}
              </span>
            </div>

            {total > 1 ? (
              <div className="mt-4 flex gap-2.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((item, itemIndex) => {
                  const active = itemIndex === index;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => onSelect(item._id)}
                      className={`relative size-14 shrink-0 overflow-hidden rounded-xl bg-white/15 transition lg:size-16 ${
                        active
                          ? "ring-2 ring-[#C62A1E] ring-offset-2 ring-offset-transparent"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`Ver ${item.title}`}
                      aria-current={active}
                    >
                      <Image
                        src={getImageUrl(item.image)}
                        alt=""
                        fill
                        unoptimized
                        className="object-contain p-0.5"
                        sizes="64px"
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

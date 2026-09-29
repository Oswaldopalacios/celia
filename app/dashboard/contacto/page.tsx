"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  ExternalLink,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Text,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LOCATION_REFERENCE_ICONS } from "@/components/public/location-reference-icon";
import {
  useContactSettings,
  useUpdateContactSettings,
} from "@/hooks/use-contact";
import { getApiErrorMessage } from "@/lib/api";
import {
  dashboardBtnPrimary,
  dashboardBtnSecondary,
  dashboardInput,
  dashboardLabel,
  dashboardPageSubtitle,
  dashboardPageTitle,
} from "@/lib/dashboard-theme";
import {
  DEFAULT_LOCATION,
  REFERENCE_ICONS,
  locationMapsQuery,
  mapsEmbedUrl,
  mapsSearchUrl,
} from "@/lib/location";
import type {
  ContactSettings,
  ContactSettingsInput,
  LocationReferenceIcon,
} from "@/lib/types";

function toForm(data: ContactSettings): ContactSettingsInput {
  return {
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    name: data.name,
    place: data.place,
    address: data.address,
    mapsQuery: data.mapsQuery,
    description: data.description,
    hours: data.hours.map((item) => ({ ...item })),
    references: data.references.map((item) => ({ ...item })),
  };
}

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function SectionCard({
  icon,
  title,
  description,
  action,
  children,
  delay = 0,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[22px] border border-[#3A2218]/[0.07] bg-white p-5 shadow-[0_8px_28px_rgba(58,34,24,0.04)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#C62A1E]/10 text-[#C62A1E]">
            {icon}
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-[17px] font-semibold text-[#3A2218]">
              {title}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-[#7A6254]">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

function Field({
  id,
  label,
  hint,
  icon,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={dashboardLabel}>
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </label>
      {children}
      {hint ? (
        <p className="mt-1.5 text-[11px] leading-4 text-[#7A6254]">{hint}</p>
      ) : null}
    </div>
  );
}

const iconButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-[#7A6254] transition hover:bg-[#FAF3E6] hover:text-[#3A2218] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const addButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#3A2218]/12 bg-white px-3 text-xs font-semibold text-[#3A2218] transition hover:border-[#C62A1E]/40 hover:text-[#C62A1E] disabled:opacity-50";

export default function ContactoDashboardPage() {
  const contactQuery = useContactSettings();
  const updateContact = useUpdateContactSettings();

  const [form, setForm] = useState<ContactSettingsInput>(() =>
    toForm({ ...DEFAULT_LOCATION }),
  );
  const [syncedData, setSyncedData] = useState<ContactSettings>();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (contactQuery.data && contactQuery.data !== syncedData) {
    setSyncedData(contactQuery.data);
    setForm(toForm(contactQuery.data));
  }

  const disabled = contactQuery.isLoading || updateContact.isPending;
  const dirty = useMemo(
    () =>
      contactQuery.data
        ? JSON.stringify(form) !== JSON.stringify(toForm(contactQuery.data))
        : false,
    [contactQuery.data, form],
  );
  const mapsQuery = locationMapsQuery(form);

  const update = <K extends keyof ContactSettingsInput>(
    key: K,
    value: ContactSettingsInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);

    try {
      await updateContact.mutateAsync(form);
      setSaved(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const resetForm = () => {
    if (contactQuery.data) setForm(toForm(contactQuery.data));
    setError("");
    setSaved(false);
  };

  return (
    <DashboardShell>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-[1180px] px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-12 lg:pt-9"
      >
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6254]">
              Página pública
            </p>
            <h1 className={`${dashboardPageTitle} mt-1`}>Contacto y ubicación</h1>
            <p className={`${dashboardPageSubtitle} max-w-xl leading-6`}>
              Todo lo que configures aquí se muestra en Ubicación y Cómo
              llegar: dirección, mapa, horarios, referencias y medios de
              contacto.
            </p>
          </div>
          <Link
            href="/ubicacion"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3A2218] transition hover:text-[#C62A1E]"
          >
            Ver página de ubicación
            <ExternalLink className="size-3.5" />
          </Link>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <SectionCard
              icon={<Phone className="size-[18px]" />}
              title="Medios de contacto"
              description="Botones de Llamar, WhatsApp y Email."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="contact-phone"
                  label="Teléfono (Llamar)"
                  hint="Puedes escribirlo con espacios."
                  icon={<Phone className="size-3.5 text-[#C62A1E]" />}
                >
                  <input
                    id="contact-phone"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="755 123 4567"
                    inputMode="tel"
                    className={`h-12 ${dashboardInput}`}
                    disabled={disabled}
                  />
                </Field>
                <Field
                  id="contact-whatsapp"
                  label="WhatsApp"
                  hint="Si no incluye 52, se agrega México automáticamente."
                  icon={<MessageCircle className="size-3.5 text-[#25D366]" />}
                >
                  <input
                    id="contact-whatsapp"
                    value={form.whatsapp}
                    onChange={(event) => update("whatsapp", event.target.value)}
                    placeholder="755 123 4567"
                    inputMode="tel"
                    className={`h-12 ${dashboardInput}`}
                    disabled={disabled}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    id="contact-email"
                    label="Email"
                    hint="Déjalo vacío para ocultar el botón de Email."
                    icon={<Mail className="size-3.5 text-[#EA4335]" />}
                  >
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="hola@donacelia.mx"
                      className={`h-12 ${dashboardInput}`}
                      disabled={disabled}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<MapPin className="size-[18px]" />}
              title="Dirección"
              description="Define el mapa y la tarjeta de dirección de la página de ubicación."
              delay={0.04}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="location-name" label="Nombre del lugar">
                  <input
                    id="location-name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="Doña Celia Restaurante"
                    className={`h-12 ${dashboardInput}`}
                    disabled={disabled}
                  />
                </Field>
                <Field
                  id="location-place"
                  label="Zona"
                  hint="Título corto de la tarjeta de dirección."
                >
                  <input
                    id="location-place"
                    value={form.place}
                    onChange={(event) => update("place", event.target.value)}
                    placeholder="Colonia, Ciudad, Estado"
                    className={`h-12 ${dashboardInput}`}
                    disabled={disabled}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="location-address" label="Dirección completa">
                    <textarea
                      id="location-address"
                      value={form.address}
                      onChange={(event) => update("address", event.target.value)}
                      placeholder="Calle, número, colonia, ciudad, estado, C.P."
                      rows={2}
                      className={`resize-none py-3 leading-6 ${dashboardInput}`}
                      disabled={disabled}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id="location-maps-query"
                    label="Búsqueda en Google Maps (opcional)"
                    hint="Si el mapa no encuentra la dirección exacta, escribe aquí el nombre del negocio en Maps o coordenadas (ej. 17.6431,-101.5512). Vacío = se usa la dirección."
                  >
                    <input
                      id="location-maps-query"
                      value={form.mapsQuery}
                      onChange={(event) =>
                        update("mapsQuery", event.target.value)
                      }
                      placeholder={form.address || "Restaurante Doña Celia"}
                      className={`h-12 ${dashboardInput}`}
                      disabled={disabled}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<Clock className="size-[18px]" />}
              title="Horarios"
              description="Cada fila es un renglón de la tarjeta de horarios. Sin filas, la tarjeta se oculta."
              delay={0.08}
              action={
                <button
                  type="button"
                  className={addButton}
                  disabled={disabled}
                  onClick={() =>
                    update("hours", [...form.hours, { label: "", value: "" }])
                  }
                >
                  <Plus className="size-3.5" />
                  Agregar
                </button>
              }
            >
              {form.hours.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#3A2218]/15 px-4 py-6 text-center text-xs text-[#7A6254]">
                  No hay horarios. Agrega uno, por ejemplo “Lunes - Viernes”.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {form.hours.map((item, index) => (
                    <li
                      key={index}
                      className="flex flex-col gap-2 rounded-2xl bg-[#FAF3E6]/70 p-2.5 sm:flex-row sm:items-center"
                    >
                      <input
                        value={item.label}
                        onChange={(event) =>
                          update(
                            "hours",
                            form.hours.map((hour, i) =>
                              i === index
                                ? { ...hour, label: event.target.value }
                                : hour,
                            ),
                          )
                        }
                        placeholder="Lunes - Domingo"
                        aria-label={`Días del horario ${index + 1}`}
                        className={`h-11 sm:w-[42%] ${dashboardInput}`}
                        disabled={disabled}
                      />
                      <input
                        value={item.value}
                        onChange={(event) =>
                          update(
                            "hours",
                            form.hours.map((hour, i) =>
                              i === index
                                ? { ...hour, value: event.target.value }
                                : hour,
                            ),
                          )
                        }
                        placeholder="11:00 a.m. - 10:00 p.m."
                        aria-label={`Horario ${index + 1}`}
                        className={`h-11 flex-1 ${dashboardInput}`}
                        disabled={disabled}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className={iconButton}
                          disabled={disabled || index === 0}
                          onClick={() =>
                            update("hours", moveItem(form.hours, index, index - 1))
                          }
                          aria-label="Subir"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          className={iconButton}
                          disabled={disabled || index === form.hours.length - 1}
                          onClick={() =>
                            update("hours", moveItem(form.hours, index, index + 1))
                          }
                          aria-label="Bajar"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                          disabled={disabled}
                          onClick={() =>
                            update(
                              "hours",
                              form.hours.filter((_, i) => i !== index),
                            )
                          }
                          aria-label="Eliminar horario"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              icon={<Landmark className="size-[18px]" />}
              title="Puntos de referencia"
              description="Se muestran en Cómo llegar. Elige un ícono para cada uno."
              delay={0.12}
              action={
                <button
                  type="button"
                  className={addButton}
                  disabled={disabled}
                  onClick={() =>
                    update("references", [
                      ...form.references,
                      { label: "", icon: "pin" },
                    ])
                  }
                >
                  <Plus className="size-3.5" />
                  Agregar
                </button>
              }
            >
              {form.references.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#3A2218]/15 px-4 py-6 text-center text-xs text-[#7A6254]">
                  No hay puntos de referencia. La sección se ocultará.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {form.references.map((item, index) => (
                    <li
                      key={index}
                      className="space-y-2.5 rounded-2xl bg-[#FAF3E6]/70 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          value={item.label}
                          onChange={(event) =>
                            update(
                              "references",
                              form.references.map((ref, i) =>
                                i === index
                                  ? { ...ref, label: event.target.value }
                                  : ref,
                              ),
                            )
                          }
                          placeholder="A dos cuadras de la plaza principal"
                          aria-label={`Referencia ${index + 1}`}
                          className={`h-11 flex-1 ${dashboardInput}`}
                          disabled={disabled}
                        />
                        <button
                          type="button"
                          className={iconButton}
                          disabled={disabled || index === 0}
                          onClick={() =>
                            update(
                              "references",
                              moveItem(form.references, index, index - 1),
                            )
                          }
                          aria-label="Subir"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          className={iconButton}
                          disabled={
                            disabled || index === form.references.length - 1
                          }
                          onClick={() =>
                            update(
                              "references",
                              moveItem(form.references, index, index + 1),
                            )
                          }
                          aria-label="Bajar"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                          disabled={disabled}
                          onClick={() =>
                            update(
                              "references",
                              form.references.filter((_, i) => i !== index),
                            )
                          }
                          aria-label="Eliminar referencia"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div
                        className="flex flex-wrap gap-1.5"
                        role="radiogroup"
                        aria-label={`Ícono de la referencia ${index + 1}`}
                      >
                        {REFERENCE_ICONS.map((option) => {
                          const Icon = LOCATION_REFERENCE_ICONS[option.id];
                          const active = item.icon === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              title={option.label}
                              disabled={disabled}
                              onClick={() =>
                                update(
                                  "references",
                                  form.references.map((ref, i) =>
                                    i === index
                                      ? {
                                          ...ref,
                                          icon: option.id as LocationReferenceIcon,
                                        }
                                      : ref,
                                  ),
                                )
                              }
                              className={`grid size-9 cursor-pointer place-items-center rounded-lg border transition ${
                                active
                                  ? "border-[#C62A1E] bg-[#C62A1E]/10 text-[#C62A1E]"
                                  : "border-transparent bg-white text-[#3A2218] hover:border-[#3A2218]/15"
                              }`}
                            >
                              <Icon size={18} weight={active ? "fill" : "regular"} />
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              icon={<Text className="size-[18px]" />}
              title="Descripción"
              description="Texto de la sección “Un lugar único”. Déjalo vacío para ocultarla."
              delay={0.16}
            >
              <textarea
                id="location-description"
                aria-label="Descripción del lugar"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                rows={4}
                placeholder="Cuéntale a tus clientes qué hace especial al lugar."
                className={`resize-y py-3 leading-6 ${dashboardInput}`}
                disabled={disabled}
              />
            </SectionCard>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-[22px] border border-[#3A2218]/[0.07] bg-white shadow-[0_8px_28px_rgba(58,34,24,0.06)]"
            >
              <div className="relative aspect-[4/3] bg-[#F1E3CB]">
                {mapsQuery && !contactQuery.isLoading ? (
                  <iframe
                    key={mapsQuery}
                    title="Vista previa del mapa"
                    src={mapsEmbedUrl(mapsQuery)}
                    className="absolute inset-0 size-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-[#7A6254]">
                    {contactQuery.isLoading
                      ? "Cargando mapa..."
                      : "Escribe una dirección para ver el mapa"}
                  </div>
                )}
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A6254]">
                    Vista previa
                  </p>
                  <p className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold text-[#3A2218]">
                    {form.place || "Zona"}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#7A6254]">
                    {form.address || "Sin dirección"}
                  </p>
                  {mapsQuery ? (
                    <a
                      href={mapsSearchUrl(mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#C62A1E] hover:underline"
                    >
                      Probar en Google Maps
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>

                {form.hours.some((item) => item.label.trim()) ? (
                  <ul className="space-y-1.5 border-t border-[#3A2218]/8 pt-4">
                    {form.hours
                      .filter((item) => item.label.trim())
                      .map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between gap-3 text-[12px]"
                        >
                          <span className="font-semibold text-[#3A2218]">
                            {item.label}
                          </span>
                          <span className="text-right text-[#7A6254]">
                            {item.value || "—"}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : null}

                {error ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="hidden space-y-2 border-t border-[#3A2218]/8 pt-4 lg:block">
                  <SaveButton pending={updateContact.isPending} disabled={disabled || !dirty} />
                  <StatusLine dirty={dirty} saved={saved} onReset={resetForm} />
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#3A2218]/8 bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
            <StatusLine dirty={dirty} saved={saved} onReset={resetForm} />
            <div className="w-[170px] shrink-0">
              <SaveButton pending={updateContact.isPending} disabled={disabled || !dirty} />
            </div>
          </div>
        </div>
      </form>
    </DashboardShell>
  );
}

function SaveButton({
  pending,
  disabled,
}: {
  pending: boolean;
  disabled: boolean;
}) {
  return (
    <button type="submit" disabled={disabled} className={`${dashboardBtnPrimary} w-full`}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          Guardando...
        </>
      ) : (
        <>
          <Save className="size-4" />
          Guardar cambios
        </>
      )}
    </button>
  );
}

function StatusLine({
  dirty,
  saved,
  onReset,
}: {
  dirty: boolean;
  saved: boolean;
  onReset: () => void;
}) {
  if (dirty) {
    return (
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#7A6254]">
        <span>Tienes cambios sin guardar</span>
        <button
          type="button"
          onClick={onReset}
          className={`${dashboardBtnSecondary} !h-8 inline-flex items-center gap-1 !px-2.5 text-[11px]`}
        >
          <RotateCcw className="size-3" />
          Descartar
        </button>
      </div>
    );
  }
  if (saved) {
    return (
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3A2218]">
        <Check className="size-3.5 text-[#C62A1E]" />
        Cambios guardados
      </p>
    );
  }
  return (
    <p className="text-[11px] font-medium text-[#B09A89]">Todo al día</p>
  );
}

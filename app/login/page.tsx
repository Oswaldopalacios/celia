"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  CookingPot,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { PapelPicadoBanner } from "@/components/public/celia-marks";
import { dashboardBtnPrimary, dashboardInput } from "@/lib/dashboard-theme";
import { useCurrentUser, useLogin } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api";

function dashboardTarget() {
  const from = new URLSearchParams(window.location.search).get("from");
  return from?.startsWith("/dashboard") ? from : "/dashboard";
}

/**
 * Full navigation so the proxy re-checks the new session cookie; a client
 * navigation can reuse a cached "/dashboard -> /login" redirect.
 */
function goToDashboard() {
  window.location.replace(dashboardTarget());
}

export default function LoginPage() {
  const login = useLogin();
  const { data: currentUser, isLoading: checkingSession } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const redirecting = login.isSuccess;

  useEffect(() => {
    if (currentUser) goToDashboard();
  }, [currentUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }

    try {
      await login.mutateAsync({ email: email.trim(), password });
      goToDashboard();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <main className="grid min-h-screen bg-[#FAF3E6] font-[family-name:var(--font-nunito)] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#2B170E] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <PapelPicadoBanner className="absolute inset-x-0 top-0 opacity-90 text-white/25" />
        <div className="absolute -bottom-32 -right-20 size-[430px] rounded-full bg-[#C62A1E]/[0.14] blur-3xl" />
        <div className="absolute -left-24 top-1/3 size-72 rounded-full bg-[#E9A83B]/[0.06] blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 pt-6"
        >
          <BrandLogo light />
        </motion.div>

        <div className="relative z-10 my-auto max-w-xl pb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
          >
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#E9A83B]/30 bg-[#E9A83B]/10 px-3 py-1.5 font-[family-name:var(--font-nunito)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#E9A83B]">
              <CookingPot className="size-3.5" />
              Cocina tradicional mexicana
            </span>
            <h1 className="font-[family-name:var(--font-display)] max-w-lg text-[42px] font-semibold leading-[1.08] xl:text-[52px]">
              Todo tu menú,
              <br />
              <span className="text-[#E9A83B]">en un solo lugar.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/55">
              Administra productos y categorías desde un panel claro, listo
              para el menú público del restaurante.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-12 flex items-center gap-8"
          >
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                100%
              </p>
              <p className="mt-1 text-xs text-white/40">Información segura</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                24/7
              </p>
              <p className="mt-1 text-xs text-white/40">Acceso a tu panel</p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-white/30">
          <ShieldCheck className="size-3.5" />
          Acceso protegido para el equipo de Doña Celia
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="absolute left-5 top-6 lg:hidden">
          <BrandLogo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-9">
            <p className="mb-3 font-[family-name:var(--font-nunito)] text-xs font-bold uppercase tracking-[0.16em] text-[#C62A1E]">
              Bienvenido de vuelta
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-[32px] font-semibold text-[#3A2218] sm:text-[36px]">
              Inicia sesión
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7A6254]">
              Ingresa tus datos para acceder al panel administrativo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-[family-name:var(--font-nunito)] text-xs font-semibold text-[#3A2218]"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-[#B09A89]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@donacelia.com"
                  className={`h-13 pl-11 pr-4 ${dashboardInput}`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-[family-name:var(--font-nunito)] text-xs font-semibold text-[#3A2218]"
              >
                Contraseña
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-[#B09A89]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className={`h-13 pl-11 pr-12 ${dashboardInput}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#7A6254] transition hover:bg-[#FAF3E6] hover:text-[#3A2218]"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-[17px]" />
                  ) : (
                    <Eye className="size-[17px]" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={login.isPending || redirecting || checkingSession}
              className={`${dashboardBtnPrimary} h-13 w-full`}
            >
              {login.isPending || redirecting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  {redirecting ? "Entrando..." : "Verificando..."}
                </>
              ) : (
                <>
                  Entrar al dashboard
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-[11px] leading-5 text-[#7A6254]">
            Al continuar confirmas que eres un usuario autorizado de Doña Celia.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

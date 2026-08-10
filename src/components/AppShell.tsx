"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();

  const items = [
    { href: "/", label: t("nav_dashboard"), icon: "📊", match: (p: string) => p === "/" },
    { href: "/trucks", label: t("nav_trucks"), icon: "🚛", match: (p: string) => p.startsWith("/trucks") },
    { href: "/fuel", label: t("nav_fuel"), icon: "⛽", match: (p: string) => p.startsWith("/fuel") },
{ href: "/concrete-pours", label: "Pompe à Béton", icon: "🏗️", match: (p: string) => p.startsWith("/concrete-pours") },  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              🚛
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-base font-extrabold text-white">{t("appName")}</span>
              <span className="text-[11px] text-slate-400">{t("tagline")}</span>
            </span>
          </Link>

          <nav className="ms-auto hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto md:ms-4">
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-800/70 px-3 py-2 md:hidden">
          {items.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        {t("appName")} — {new Date().getFullYear()}
      </footer>
    </div>
  );
}

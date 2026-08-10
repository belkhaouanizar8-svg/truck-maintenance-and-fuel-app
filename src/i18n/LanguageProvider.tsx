"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, LOCALES, CURRENCY, type Lang } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  formatNumber: (n: number, digits?: number) => string;
  formatMoney: (n: number) => string;
  formatDate: (iso: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    let saved: Lang | null = null;
    try {
      const raw = window.localStorage.getItem("flotte-lang") as Lang | null;
      if (raw && translations[raw]) saved = raw;
    } catch {
      /* ignore */
    }
    if (!saved) {
      const nav = (navigator.language || "en").toLowerCase();
      saved = nav.startsWith("ar") ? "ar" : nav.startsWith("fr") ? "fr" : "en";
    }
    setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("flotte-lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback((key: string) => translations[lang][key] ?? key, [lang]);

  const formatNumber = useCallback(
    (n: number, digits = 2) => {
      try {
        return new Intl.NumberFormat(LOCALES[lang], {
          maximumFractionDigits: digits,
          minimumFractionDigits: 0,
        }).format(n);
      } catch {
        return String(n);
      }
    },
    [lang]
  );

  const formatMoney = useCallback(
    (n: number) => `${formatNumber(n)} ${CURRENCY[lang]}`,
    [lang, formatNumber]
  );

  const formatDate = useCallback(
    (iso: string) => {
      try {
        return new Intl.DateTimeFormat(LOCALES[lang], {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(`${iso}T00:00:00`));
      } catch {
        return iso;
      }
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, dir, setLang, t, formatNumber, formatMoney, formatDate }),
    [lang, dir, setLang, t, formatNumber, formatMoney, formatDate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

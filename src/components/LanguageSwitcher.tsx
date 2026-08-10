"use client";

import { useLang } from "@/i18n/LanguageProvider";
import { LANG_NAMES, type Lang } from "@/i18n/translations";

const OPTIONS: Lang[] = ["ar", "fr", "en"];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-900 p-1">
      {OPTIONS.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            title={LANG_NAMES[code]}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
              active
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {code === "ar" ? "ع" : code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { Truck } from "@/db/schema";

export interface TruckFormValues {
  name: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
}

interface TruckFormProps {
  initial?: Truck | null;
  submitLabel: string;
  onSubmit: (values: TruckFormValues) => void;
  onCancel: () => void;
}

export default function TruckForm({ initial, submitLabel, onSubmit, onCancel }: TruckFormProps) {
  const { t } = useLang();
  const [values, setValues] = useState<TruckFormValues>({
    name: initial?.name ?? "",
    plateNumber: initial?.plateNumber ?? "",
    brand: initial?.brand ?? "",
    model: initial?.model ?? "",
    year: initial?.year ? String(initial.year) : "",
  });
  const [error, setError] = useState(false);

  const set = (key: keyof TruckFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError(true);
      return;
    }
    onSubmit(values);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">
          {t("form_name")} <span className="text-rose-400">*</span>
        </label>
        <input className={inputCls} value={values.name} onChange={set("name")} placeholder={t("form_namePh")} />
        {error ? <p className="mt-1 text-xs text-rose-400">{t("form_required")}</p> : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">{t("form_plate")}</label>
        <input className={inputCls} value={values.plateNumber} onChange={set("plateNumber")} placeholder={t("form_platePh")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">{t("form_brand")}</label>
          <input className={inputCls} value={values.brand} onChange={set("brand")} placeholder={t("form_brandPh")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">{t("form_model")}</label>
          <input className={inputCls} value={values.model} onChange={set("model")} placeholder={t("form_modelPh")} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">{t("form_year")}</label>
        <input
          className={inputCls}
          type="number"
          min={1960}
          max={2100}
          value={values.year}
          onChange={set("year")}
          placeholder="2015"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
        >
          {t("form_cancel")}
        </button>
      </div>
    </form>
  );
}

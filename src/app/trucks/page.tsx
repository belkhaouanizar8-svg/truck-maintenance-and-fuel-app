"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/i18n/LanguageProvider";
import Modal from "@/components/Modal";
import TruckForm, { type TruckFormValues } from "@/components/TruckForm";

interface TruckAgg {
  id: number;
  name: string;
  plateNumber: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  repairTotal: number;
  fuelTotal: number;
  liters: number;
  avgConsumption: number | null;
}

export default function TrucksPage() {
  const { t, formatNumber, formatMoney } = useLang();
  const router = useRouter();
  const [trucks, setTrucks] = useState<TruckAgg[] | null>(null);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/trucks");
      if (!res.ok) throw new Error("bad status");
      setTrucks(await res.json());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (values: TruckFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setModalOpen(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`${t("trucks_confirmDelete")}\n\n${name}`)) return;
    await fetch(`/api/trucks/${id}`, { method: "DELETE" });
    await load();
  };

  if (error) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="text-slate-400">{t("common_error")}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">
          {t("common_retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("trucks_title")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("trucks_subtitle")}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
        >
          + {t("trucks_add")}
        </button>
      </div>

      {!trucks ? (
        <div className="grid place-items-center py-24">
          <div className="size-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
        </div>
      ) : trucks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <p className="text-4xl">🚛</p>
          <p className="mt-3 text-slate-300">{t("trucks_empty")}</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
          >
            + {t("trucks_add")}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {trucks.map((tr) => (
            <div
              key={tr.id}
              className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-xl">🚛</span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">{tr.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[tr.brand, tr.model, tr.year ? String(tr.year) : null].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 inline-flex w-fit rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {tr.plateNumber || t("trucks_noPlate")}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-800/50 p-3">
                  <p className="text-[11px] text-slate-500">{t("trucks_repairsCost")}</p>
                  <p className="mt-0.5 font-bold text-rose-300">{formatMoney(tr.repairTotal)}</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-3">
                  <p className="text-[11px] text-slate-500">{t("trucks_fuelCost")}</p>
                  <p className="mt-0.5 font-bold text-amber-300">{formatMoney(tr.fuelTotal)}</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-3">
                  <p className="text-[11px] text-slate-500">{t("trucks_liters")}</p>
                  <p className="mt-0.5 font-bold text-emerald-300">{formatNumber(tr.liters)}</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-3">
                  <p className="text-[11px] text-slate-500">{t("trucks_avgConsumption")}</p>
                  <p className="mt-0.5 font-bold text-violet-300">
                    {tr.avgConsumption != null ? `${formatNumber(tr.avgConsumption)}` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  href={`/trucks/${tr.id}`}
                  className="flex-1 rounded-xl bg-slate-800 px-4 py-2 text-center text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                >
                  {t("trucks_details")}
                </Link>
                <button
                  onClick={() => handleDelete(tr.id, tr.name)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("form_addTruckTitle")}>
        <TruckForm
          submitLabel={saving ? "..." : t("form_save")}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

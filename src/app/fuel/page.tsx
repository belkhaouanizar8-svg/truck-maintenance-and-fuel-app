"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/i18n/LanguageProvider";
import StatCard from "@/components/StatCard";

interface FuelRow {
  id: number;
  truckId: number;
  truckName: string;
  date: string;
  odometerKm: number | null;
  pricePerLiter: number;
  totalCost: number;
  liters: number;
  consumption: number | null;
}

interface FuelData {
  entries: FuelRow[];
  totals: { totalLiters: number; totalCost: number; avgConsumption: number | null; count: number };
}

export default function FuelPage() {
  const { t, formatNumber, formatMoney, formatDate } = useLang();
  const [data, setData] = useState<FuelData | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/fuel");
      if (!res.ok) throw new Error("bad status");
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deleteEntry = async (id: number) => {
    if (!window.confirm(t("common_delete"))) return;
    await fetch(`/api/fuel/${id}`, { method: "DELETE" });
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

  if (!data) {
    return (
      <div className="grid place-items-center py-24">
        <div className="size-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
      </div>
    );
  }

  const { entries, totals } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">⛽ {t("fuel_title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("fuel_subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="🛢️" label={t("fuel_totalLiters")} value={formatNumber(totals.totalLiters)} sub={t("trucks_liters")} accent="bg-emerald-500/15" />
        <StatCard icon="💵" label={t("fuel_totalCost")} value={formatMoney(totals.totalCost)} accent="bg-amber-500/15" />
        <StatCard
          icon="📉"
          label={t("fuel_avgConsumption")}
          value={totals.avgConsumption != null ? formatNumber(totals.avgConsumption) : "—"}
          sub={t("fuel_per100km")}
          accent="bg-violet-500/15"
        />
        <StatCard icon="🧾" label={t("fuel_entries")} value={formatNumber(totals.count, 0)} accent="bg-sky-500/15" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl">⛽</p>
            <p className="mt-3 text-slate-400">{t("fuel_empty")}</p>
            <Link href="/trucks" className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400">
              {t("nav_trucks")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-start text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-start font-semibold">{t("table_truck")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table_date")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table_odometer")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table_price")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table_liters")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table_cost")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table_consumption")}</th>
                  <th className="px-4 py-3 text-end font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {entries.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link href={`/trucks/${f.truckId}`} className="font-semibold text-slate-200 hover:text-emerald-300">
                        {f.truckName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(f.date)}</td>
                    <td className="px-4 py-3 text-slate-300">{f.odometerKm != null ? `${formatNumber(f.odometerKm, 0)} km` : "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{formatNumber(f.pricePerLiter)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-300">{formatNumber(f.liters)}</td>
                    <td className="px-4 py-3 font-semibold text-amber-300">{formatMoney(f.totalCost)}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {f.consumption != null ? `${formatNumber(f.consumption)} ${t("fuel_per100km")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button onClick={() => deleteEntry(f.id)} className="text-slate-500 transition-colors hover:text-rose-400">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

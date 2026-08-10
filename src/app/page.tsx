"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/i18n/LanguageProvider";
import StatCard from "@/components/StatCard";

interface TruckAgg {
  id: number;
  name: string;
  plateNumber: string | null;
  brand: string | null;
  model: string | null;
  repairTotal: number;
  fuelTotal: number;
  liters: number;
  avgConsumption: number | null;
}

interface RecentFuel {
  id: number;
  truckId: number;
  truckName: string;
  date: string;
  liters: number;
  totalCost: number;
}

interface RecentRepair {
  id: number;
  truckId: number;
  truckName: string;
  date: string;
  description: string;
  cost: number;
}

interface DashData {
  trucks: TruckAgg[];
  recentFuel: RecentFuel[];
  recentRepairs: RecentRepair[];
}

export default function DashboardPage() {
  const { t, formatNumber, formatMoney, formatDate } = useLang();
  const [data, setData] = useState<DashData | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("bad status");
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      <div className="grid place-items-center py-24 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
        <p className="mt-4 text-sm text-slate-400">{t("common_loading")}</p>
      </div>
    );
  }

  const { trucks, recentFuel, recentRepairs } = data;
  const totalRepairs = trucks.reduce((s, tr) => s + tr.repairTotal, 0);
  const totalFuel = trucks.reduce((s, tr) => s + tr.fuelTotal, 0);
  const totalLiters = trucks.reduce((s, tr) => s + tr.liters, 0);
  const totalKm = trucks.reduce((s, tr) => s + (tr.avgConsumption != null ? 1 : 0), 0);
  const avgConsumption =
    totalLiters > 0 && totalKm > 0
      ? trucks.reduce((s, tr) => s + (tr.avgConsumption ?? 0), 0) / totalKm
      : null;
  const maxSpend = Math.max(1, ...trucks.map((tr) => tr.repairTotal + tr.fuelTotal));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("nav_dashboard")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("dash_subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon="🚛" label={t("dash_trucks")} value={formatNumber(trucks.length, 0)} accent="bg-sky-500/15" />
        <StatCard icon="🔧" label={t("dash_repairsCost")} value={formatMoney(totalRepairs)} accent="bg-rose-500/15" />
        <StatCard icon="⛽" label={t("dash_fuelCost")} value={formatMoney(totalFuel)} accent="bg-amber-500/15" />
        <StatCard icon="🛢️" label={t("dash_totalLiters")} value={formatNumber(totalLiters)} sub={t("trucks_liters")} accent="bg-emerald-500/15" />
        <StatCard
          icon="📉"
          label={t("dash_avgConsumption")}
          value={avgConsumption != null ? formatNumber(avgConsumption) : "—"}
          sub={t("dash_per100km")}
          accent="bg-violet-500/15"
        />
      </div>

      {trucks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <p className="text-4xl">🚛</p>
          <p className="mt-3 text-slate-300">{t("trucks_empty")}</p>
          <Link
            href="/trucks"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
          >
            + {t("dash_addFirst")}
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">{t("dash_perTruck")}</h2>
            <div className="mt-5 space-y-4">
              {trucks.map((tr) => {
                const total = tr.repairTotal + tr.fuelTotal;
                const repairPct = total > 0 ? (tr.repairTotal / total) * 100 : 0;
                return (
                  <div key={tr.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <Link href={`/trucks/${tr.id}`} className="font-semibold text-slate-200 hover:text-emerald-300">
                        {tr.name}
                      </Link>
                      <span className="shrink-0 text-slate-400">{formatMoney(total)}</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-rose-500/80 transition-all" style={{ width: `${repairPct}%` }} />
                      <div className="h-full flex-1 bg-amber-500/80" />
                    </div>
                    <div className="mt-1 flex gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-rose-500" /> {t("dash_repairsCost")} {formatMoney(tr.repairTotal)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-amber-500" /> {t("dash_fuelCost")} {formatMoney(tr.fuelTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">⛽ {t("dash_recentFuel")}</h2>
                <Link href="/fuel" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                  {t("nav_fuel")} →
                </Link>
              </div>
              <div className="mt-4 divide-y divide-slate-800">
                {recentFuel.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">{t("dash_noEntries")}</p>
                ) : (
                  recentFuel.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link href={`/trucks/${f.truckId}`} className="truncate text-sm font-semibold text-slate-200 hover:text-emerald-300">
                          {f.truckName}
                        </Link>
                        <p className="text-xs text-slate-500">{formatDate(f.date)}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-bold text-amber-300">{formatNumber(f.liters)} {t("trucks_liters")}</p>
                        <p className="text-xs text-slate-500">{formatMoney(f.totalCost)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">🔧 {t("dash_recentRepairs")}</h2>
                <span className="text-sm font-semibold text-slate-500">{formatMoney(totalRepairs)}</span>
              </div>
              <div className="mt-4 divide-y divide-slate-800">
                {recentRepairs.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">{t("dash_noEntries")}</p>
                ) : (
                  recentRepairs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link href={`/trucks/${r.truckId}`} className="truncate text-sm font-semibold text-slate-200 hover:text-emerald-300">
                          {r.truckName}
                        </Link>
                        <p className="truncate text-xs text-slate-500">
                          {r.description} · {formatDate(r.date)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-rose-300">{formatMoney(r.cost)}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

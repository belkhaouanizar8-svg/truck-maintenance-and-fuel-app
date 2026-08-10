"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/i18n/LanguageProvider";
import Modal from "@/components/Modal";
import TruckForm, { type TruckFormValues } from "@/components/TruckForm";
import type { Truck } from "@/db/schema";
import type { FuelItem, FuelTotals } from "@/lib/calc";

interface RepairRow {
  id: number;
  truckId: number;
  date: string;
  description: string;
  cost: number;
}

interface DetailData {
  truck: Truck;
  repairs: RepairRow[];
  repairTotal: number;
  fuel: FuelItem[];
  fuelTotals: FuelTotals;
}

const inputCls =
  "w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TruckDetailClient({ truckId }: { truckId: string }) {
  const { t, formatNumber, formatMoney, formatDate } = useLang();
  const router = useRouter();
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Repair form
  const [repairDate, setRepairDate] = useState(today());
  const [repairDesc, setRepairDesc] = useState("");
  const [repairCost, setRepairCost] = useState("");

  // Fuel form
  const [fuelDate, setFuelDate] = useState(today());
  const [fuelOdometer, setFuelOdometer] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelAmount, setFuelAmount] = useState("");

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch(`/api/trucks/${truckId}`);
      if (!res.ok) throw new Error("bad status");
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, [truckId]);

  useEffect(() => {
    load();
  }, [load]);

  const addRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairDesc.trim() || !repairCost) return;
    const res = await fetch(`/api/trucks/${truckId}/repairs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: repairDate, description: repairDesc.trim(), cost: repairCost }),
    });
    if (res.ok) {
      setRepairDesc("");
      setRepairCost("");
      await load();
    }
  };

  const addFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelPrice || !fuelAmount) return;
    const res = await fetch(`/api/trucks/${truckId}/fuel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: fuelDate,
        odometerKm: fuelOdometer,
        pricePerLiter: fuelPrice,
        totalCost: fuelAmount,
      }),
    });
    if (res.ok) {
      setFuelOdometer("");
      setFuelPrice("");
      setFuelAmount("");
      await load();
    }
  };

  const deleteRepair = async (id: number) => {
    if (!window.confirm(t("common_delete"))) return;
    await fetch(`/api/repairs/${id}`, { method: "DELETE" });
    await load();
  };

  const deleteFuel = async (id: number) => {
    if (!window.confirm(t("common_delete"))) return;
    await fetch(`/api/fuel/${id}`, { method: "DELETE" });
    await load();
  };

  const handleEdit = async (values: TruckFormValues) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/trucks/${truckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setEditOpen(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTruck = async () => {
    if (!window.confirm(t("trucks_confirmDelete"))) return;
    await fetch(`/api/trucks/${truckId}`, { method: "DELETE" });
    router.push("/trucks");
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

  const { truck, repairs, repairTotal, fuel, fuelTotals } = data;
  const computedLiters = Number(fuelPrice) > 0 && Number(fuelAmount) >= 0 ? (Number(fuelAmount) / Number(fuelPrice)).toFixed(2) : "0.00";
  const fuelDesc = [...fuel].reverse();

  return (
    <div className="space-y-6">
      <Link href="/trucks" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-300">
        ← {t("detail_back")}
      </Link>

      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl border border-sky-500/25 bg-sky-500/10 text-3xl">🚛</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{truck.name}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {[truck.brand, truck.model, truck.year ? String(truck.year) : null].filter(Boolean).join(" · ") || "—"}
              </p>
              <p className="mt-1 inline-flex rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                {truck.plateNumber || t("trucks_noPlate")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              ✏️ {t("detail_edit")}
            </button>
            <button
              onClick={handleDeleteTruck}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
            >
              🗑 {t("detail_deleteTruck")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-xs text-slate-400">{t("dash_repairsCost")}</p>
            <p className="mt-1 text-lg font-extrabold text-rose-300">{formatMoney(repairTotal)}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-slate-400">{t("dash_fuelCost")}</p>
            <p className="mt-1 text-lg font-extrabold text-amber-300">{formatMoney(fuelTotals.totalCost)}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-slate-400">{t("dash_totalLiters")}</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-300">
              {formatNumber(fuelTotals.totalLiters)} <span className="text-xs font-semibold">{t("trucks_liters")}</span>
            </p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-xs text-slate-400">{t("dash_avgConsumption")}</p>
            <p className="mt-1 text-lg font-extrabold text-violet-300">
              {fuelTotals.avgConsumption != null ? formatNumber(fuelTotals.avgConsumption) : "—"}
              <span className="text-xs font-semibold"> {t("dash_per100km")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Repairs */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-white">🔧 {t("detail_repairs")}</h2>

          <form onSubmit={addRepair} className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_date")}</label>
                <input type="date" className={inputCls} value={repairDate} onChange={(e) => setRepairDate(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_cost")}</label>
                <input type="number" min={0} step="0.01" className={inputCls} value={repairCost} onChange={(e) => setRepairCost(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_description")}</label>
              <input className={inputCls} value={repairDesc} onChange={(e) => setRepairDesc(e.target.value)} placeholder={t("form_descriptionPh")} />
            </div>
            <button
              type="submit"
              disabled={!repairDesc.trim() || !repairCost}
              className="w-full rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + {t("form_addRepair")}
            </button>
          </form>

          <div className="mt-4 divide-y divide-slate-800">
            {repairs.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{t("detail_noRepairs")}</p>
            ) : (
              repairs.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200">{r.description}</p>
                    <p className="text-xs text-slate-500">{formatDate(r.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="text-sm font-bold text-rose-300">{formatMoney(r.cost)}</p>
                    <button onClick={() => deleteRepair(r.id)} className="text-xs text-slate-500 transition-colors hover:text-rose-400">
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Fuel */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-white">⛽ {t("detail_fuel")}</h2>

          <form onSubmit={addFuel} className="mt-4 space-y-3 rounded-xl border border-amber-500/20 bg-slate-950/50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_date")}</label>
                <input type="date" className={inputCls} value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_odometer")}</label>
                <input type="number" min={0} step="1" className={inputCls} value={fuelOdometer} onChange={(e) => setFuelOdometer(e.target.value)} placeholder="120000" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_pricePerLiter")}</label>
                <input type="number" min={0} step="0.01" className={inputCls} value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} placeholder="10.50" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">{t("form_totalSpent")}</label>
                <input type="number" min={0} step="0.01" className={inputCls} value={fuelAmount} onChange={(e) => setFuelAmount(e.target.value)} placeholder="500" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2 text-sm">
              <span className="text-amber-200/80">{t("form_litersComputed")}</span>
              <span className="font-extrabold text-amber-300">
                {formatNumber(Number(computedLiters))} {t("trucks_liters")}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{t("form_odometerHint")}</p>
            <button
              type="submit"
              disabled={!fuelPrice || !fuelAmount}
              className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + {t("form_addFuel")}
            </button>
          </form>

          <div className="mt-4 divide-y divide-slate-800">
            {fuel.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{t("detail_noFuel")}</p>
            ) : (
              fuelDesc.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200">
                      {formatNumber(f.liters)} {t("trucks_liters")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(f.date)}
                      {f.odometerKm != null ? ` · ${formatNumber(f.odometerKm, 0)} km` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="text-sm font-bold text-amber-300">{formatMoney(f.totalCost)}</p>
                    <p className="text-xs text-slate-500">
                      {f.consumption != null ? `${formatNumber(f.consumption)} ${t("fuel_per100km")}` : "—"}
                    </p>
                  </div>
                  <button onClick={() => deleteFuel(f.id)} className="shrink-0 text-xs text-slate-500 transition-colors hover:text-rose-400">
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t("form_editTruckTitle")}>
        <TruckForm
          initial={truck}
          submitLabel={saving ? "..." : t("form_save")}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  );
}

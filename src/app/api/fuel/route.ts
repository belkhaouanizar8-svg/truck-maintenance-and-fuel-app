import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { trucks, fuelEntries } from "@/db/schema";
import { buildFuelStats, round2 } from "@/lib/calc";

export const dynamic = "force-dynamic";

export async function GET() {
  const allTrucks = await db.select().from(trucks);
  const allFuel = await db.select().from(fuelEntries).orderBy(desc(fuelEntries.date), desc(fuelEntries.id));

  const truckMap = new Map<number, string>();
  for (const t of allTrucks) truckMap.set(t.id, t.name);

  // Per-truck stats to resolve per-entry consumption + global averages.
  const byTruck = new Map<number, typeof allFuel>();
  for (const f of allFuel) {
    const arr = byTruck.get(f.truckId) ?? [];
    arr.push(f);
    byTruck.set(f.truckId, arr);
  }

  const consumptionById = new Map<number, number | null>();
  let totalLiters = 0;
  let totalCost = 0;
  let totalKm = 0;
  for (const [, rows] of byTruck) {
    const { items, totals } = buildFuelStats(rows);
    totalLiters += totals.totalLiters;
    totalCost += totals.totalCost;
    totalKm += totals.totalKm;
    for (const item of items) consumptionById.set(item.id, item.consumption);
  }

  const entries = allFuel.map((f) => ({
    id: f.id,
    truckId: f.truckId,
    truckName: truckMap.get(f.truckId) ?? "—",
    date: f.date,
    odometerKm: f.odometerKm ? Number(f.odometerKm) : null,
    pricePerLiter: Number(f.pricePerLiter),
    totalCost: Number(f.totalCost),
    liters: Number(f.liters),
    consumption: consumptionById.get(f.id) ?? null,
  }));

  return NextResponse.json({
    entries,
    totals: {
      totalLiters: round2(totalLiters),
      totalCost: round2(totalCost),
      avgConsumption: totalKm > 0 ? round2((totalLiters / totalKm) * 100) : null,
      count: entries.length,
    },
  });
}

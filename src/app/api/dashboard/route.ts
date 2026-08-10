import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { trucks, repairs, fuelEntries } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const allTrucks = await db.select().from(trucks).orderBy(desc(trucks.createdAt));
  const allRepairs = await db.select().from(repairs).orderBy(desc(repairs.date), desc(repairs.id));
  const allFuel = await db.select().from(fuelEntries).orderBy(desc(fuelEntries.date), desc(fuelEntries.id));

  const truckMap = new Map<number, string>();
  for (const t of allTrucks) truckMap.set(t.id, t.name);

  const repairMap = new Map<number, number>();
  for (const r of allRepairs) {
    repairMap.set(r.truckId, (repairMap.get(r.truckId) ?? 0) + Number(r.cost));
  }

  const fuelMap = new Map<number, { cost: number; liters: number }>();
  for (const f of allFuel) {
    const cur = fuelMap.get(f.truckId) ?? { cost: 0, liters: 0 };
    cur.cost += Number(f.totalCost);
    cur.liters += Number(f.liters);
    fuelMap.set(f.truckId, cur);
  }

  const data = allTrucks.map((t) => ({
    ...t,
    repairTotal: repairMap.get(t.id) ?? 0,
    fuelTotal: fuelMap.get(t.id)?.cost ?? 0,
    liters: fuelMap.get(t.id)?.liters ?? 0,
  }));

  const recentFuel = allFuel.slice(0, 6).map((f) => ({
    id: f.id,
    truckId: f.truckId,
    truckName: truckMap.get(f.truckId) ?? "—",
    date: f.date,
    odometerKm: f.odometerKm ? Number(f.odometerKm) : null,
    pricePerLiter: Number(f.pricePerLiter),
    totalCost: Number(f.totalCost),
    liters: Number(f.liters),
  }));

  const recentRepairs = allRepairs.slice(0, 6).map((r) => ({
    id: r.id,
    truckId: r.truckId,
    truckName: truckMap.get(r.truckId) ?? "—",
    date: r.date,
    description: r.description,
    cost: Number(r.cost),
  }));

  return NextResponse.json({ trucks: data, recentFuel, recentRepairs });
}

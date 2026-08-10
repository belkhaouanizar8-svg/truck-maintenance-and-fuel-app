import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { trucks, repairs, fuelEntries } from "@/db/schema";
import { buildFuelStats } from "@/lib/calc";

export const dynamic = "force-dynamic";

export async function GET() {
  const allTrucks = await db.select().from(trucks).orderBy(desc(trucks.createdAt));
  const allRepairs = await db.select().from(repairs);
  const allFuel = await db.select().from(fuelEntries);

  const repairMap = new Map<number, number>();
  for (const r of allRepairs) {
    repairMap.set(r.truckId, (repairMap.get(r.truckId) ?? 0) + Number(r.cost));
  }

  const byTruck = new Map<number, typeof allFuel>();
  for (const f of allFuel) {
    const arr = byTruck.get(f.truckId) ?? [];
    arr.push(f);
    byTruck.set(f.truckId, arr);
  }

  const fuelMap = new Map<number, { cost: number; liters: number; km: number; avg: number | null }>();
  for (const [tid, rows] of byTruck) {
    const { totals } = buildFuelStats(rows);
    fuelMap.set(tid, {
      cost: totals.totalCost,
      liters: totals.totalLiters,
      km: totals.totalKm,
      avg: totals.avgConsumption,
    });
  }

  const data = allTrucks.map((t) => ({
    ...t,
    repairTotal: repairMap.get(t.id) ?? 0,
    fuelTotal: fuelMap.get(t.id)?.cost ?? 0,
    liters: fuelMap.get(t.id)?.liters ?? 0,
    fuelKm: fuelMap.get(t.id)?.km ?? 0,
    avgConsumption: fuelMap.get(t.id)?.avg ?? null,
  }));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const year = body.year ? Number(body.year) : null;

  const [created] = await db
    .insert(trucks)
    .values({
      name,
      plateNumber: body.plateNumber ? String(body.plateNumber).trim() : null,
      brand: body.brand ? String(body.brand).trim() : null,
      model: body.model ? String(body.model).trim() : null,
      year: year && year >= 1960 && year <= 2100 ? Math.round(year) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

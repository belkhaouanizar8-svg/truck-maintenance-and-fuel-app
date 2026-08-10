import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { trucks, repairs, fuelEntries } from "@/db/schema";
import { buildFuelStats } from "@/lib/calc";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const truckId = Number(id);
  if (!Number.isInteger(truckId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const [truck] = await db.select().from(trucks).where(eq(trucks.id, truckId));
  if (!truck) return NextResponse.json({ error: "not found" }, { status: 404 });

  const repairList = await db
    .select()
    .from(repairs)
    .where(eq(repairs.truckId, truckId))
    .orderBy(desc(repairs.date), desc(repairs.id));

  const fuelRows = await db.select().from(fuelEntries).where(eq(fuelEntries.truckId, truckId));
  const { items, totals } = buildFuelStats(fuelRows);

  const repairTotal = repairList.reduce((s, r) => s + Number(r.cost), 0);

  return NextResponse.json({
    truck,
    repairs: repairList.map((r) => ({ ...r, cost: Number(r.cost) })),
    repairTotal,
    fuel: items,
    fuelTotals: totals,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const truckId = Number(id);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const patch: Partial<typeof trucks.$inferInsert> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.plateNumber !== undefined) patch.plateNumber = body.plateNumber ? String(body.plateNumber).trim() : null;
  if (body.brand !== undefined) patch.brand = body.brand ? String(body.brand).trim() : null;
  if (body.model !== undefined) patch.model = body.model ? String(body.model).trim() : null;
  if (body.year !== undefined) {
    const year = Number(body.year);
    patch.year = year && year >= 1960 && year <= 2100 ? Math.round(year) : null;
  }

  const [updated] = await db.update(trucks).set(patch).where(eq(trucks.id, truckId)).returning();
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const truckId = Number(id);
  await db.delete(trucks).where(eq(trucks.id, truckId));
  return NextResponse.json({ ok: true });
}

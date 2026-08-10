import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fuelEntries } from "@/db/schema";
import { round2 } from "@/lib/calc";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const truckId = Number(id);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const pricePerLiter = Number(body.pricePerLiter);
  const totalCost = Number(body.totalCost);
  if (!Number.isFinite(pricePerLiter) || pricePerLiter <= 0 || !Number.isFinite(totalCost) || totalCost < 0) {
    return NextResponse.json({ error: "valid price per liter and amount required" }, { status: 400 });
  }

  // Liters = money spent / price per liter
  const liters = round2(totalCost / pricePerLiter);
  const odometerValue = body.odometerKm !== "" && body.odometerKm != null ? Number(body.odometerKm) : null;
  const odometerKm = odometerValue !== null && Number.isFinite(odometerValue) ? round2(odometerValue).toFixed(1) : null;
  const date = String(body.date || new Date().toISOString().slice(0, 10));

  const [created] = await db
    .insert(fuelEntries)
    .values({
      truckId,
      date,
      odometerKm,
      pricePerLiter: pricePerLiter.toFixed(2),
      totalCost: totalCost.toFixed(2),
      liters: liters.toFixed(2),
    })
    .returning();

  return NextResponse.json(
    { ...created, pricePerLiter: Number(created.pricePerLiter), totalCost: Number(created.totalCost), liters: Number(created.liters) },
    { status: 201 }
  );
}

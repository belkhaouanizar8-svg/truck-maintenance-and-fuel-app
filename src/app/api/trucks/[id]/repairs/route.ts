import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repairs } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const truckId = Number(id);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const description = String(body.description ?? "").trim();
  const cost = Number(body.cost);
  if (!description || !Number.isFinite(cost) || cost < 0) {
    return NextResponse.json({ error: "description and valid cost required" }, { status: 400 });
  }

  const date = String(body.date || new Date().toISOString().slice(0, 10));

  const [created] = await db
    .insert(repairs)
    .values({ truckId, date, description, cost: cost.toFixed(2) })
    .returning();

  return NextResponse.json({ ...created, cost: Number(created.cost) }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { repairs } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const repairId = Number(id);
  await db.delete(repairs).where(eq(repairs.id, repairId));
  return NextResponse.json({ ok: true });
}

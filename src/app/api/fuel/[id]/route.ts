import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fuelEntries } from "@/db/schema";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const entryId = Number(id);
  await db.delete(fuelEntries).where(eq(fuelEntries.id, entryId));
  return NextResponse.json({ ok: true });
}

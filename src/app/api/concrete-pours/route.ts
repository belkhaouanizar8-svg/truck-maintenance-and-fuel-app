import { NextResponse } from "next/server";
import { db } from "@/db";
import { concretePours, trucks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allPours = await db
    .select()
    .from(concretePours)
    .orderBy(desc(concretePours.date), desc(concretePours.id));

  const allTrucks = await db.select().from(trucks);
  const truckMap = new Map<number, string>();
  for (const t of allTrucks) truckMap.set(t.id, t.name);

  const result = allPours.map((p) => ({
    ...p,
    truckName: truckMap.get(p.truckId) ?? "Inconnu",
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
body.location = body.location || "";
  const [newPour] = await db
    .insert(concretePours)
    .values({
      truckId: body.truckId,
      date: body.date,
      clientName: body.clientName,
      cubicMeters: body.cubicMeters,
      location: body.location
    })
    .returning();

  return NextResponse.json(newPour);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(concretePours).where(eq(concretePours.id, Number(id)));

  return NextResponse.json({ success: true });
}

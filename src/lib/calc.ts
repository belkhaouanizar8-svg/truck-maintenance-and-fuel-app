export interface FuelEntryRow {
  id: number;
  truckId: number;
  date: string;
  odometerKm: string | null;
  pricePerLiter: string;
  totalCost: string;
  liters: string;
}

export interface FuelItem {
  id: number;
  truckId: number;
  date: string;
  odometerKm: number | null;
  pricePerLiter: number;
  totalCost: number;
  liters: number;
  consumption: number | null;
}

export interface FuelTotals {
  totalLiters: number;
  totalCost: number;
  totalKm: number;
  avgConsumption: number | null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Computes per-entry fuel consumption (L/100km) by comparing each entry's
 * odometer with the previous entry of the same truck, plus totals.
 * Entries must be sorted chronologically for accurate segment distances.
 */
export function buildFuelStats(rows: FuelEntryRow[]): {
  items: FuelItem[];
  totals: FuelTotals;
} {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  let totalLiters = 0;
  let totalCost = 0;
  let totalKm = 0;

  const items: FuelItem[] = sorted.map((row, i) => {
    const liters = round2(Number(row.liters) || 0);
    const cost = round2(Number(row.totalCost) || 0);
    const pricePerLiter = round2(Number(row.pricePerLiter) || 0);
    const odometerKm =
      row.odometerKm !== null && row.odometerKm !== undefined && row.odometerKm !== ""
        ? Number(row.odometerKm)
        : null;

    totalLiters += liters;
    totalCost += cost;

    let consumption: number | null = null;
    const prev = sorted[i - 1];
    if (prev) {
      const prevKm =
        prev.odometerKm !== null && prev.odometerKm !== undefined && prev.odometerKm !== ""
          ? Number(prev.odometerKm)
          : null;
      if (odometerKm !== null && prevKm !== null && odometerKm > prevKm) {
        const dist = odometerKm - prevKm;
        if (dist > 0) {
          consumption = round2((liters / dist) * 100);
          totalKm += dist;
        }
      }
    }

    return {
      id: row.id,
      truckId: row.truckId,
      date: row.date,
      odometerKm,
      pricePerLiter,
      totalCost: cost,
      liters,
      consumption,
    };
  });

  const avgConsumption = totalKm > 0 ? round2((totalLiters / totalKm) * 100) : null;

  return {
    items,
    totals: { totalLiters: round2(totalLiters), totalCost: round2(totalCost), totalKm, avgConsumption },
  };
}

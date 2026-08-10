import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const trucks = pgTable("trucks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plateNumber: text("plate_number"),
  brand: text("brand"),
  model: text("model"),
  year: integer("year"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  truckId: integer("truck_id")
    .notNull()
    .references(() => trucks.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  description: text("description").notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const fuelEntries = pgTable("fuel_entries", {
  id: serial("id").primaryKey(),
  truckId: integer("truck_id")
    .notNull()
    .references(() => trucks.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  odometerKm: numeric("odometer_km", { precision: 12, scale: 1 }),
  pricePerLiter: numeric("price_per_liter", { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  liters: numeric("liters", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const concretePours = pgTable("concrete_pours", {
  id: serial("id").primaryKey(),
  truckId: integer("truck_id")
    .notNull()
    .references(() => trucks.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  clientName: text("client_name").notNull(),
  cubicMeters: numeric("cubic_meters", { precision: 12, scale: 2 }).notNull(),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Truck = typeof trucks.$inferSelect;
export type NewTruck = typeof trucks.$inferInsert;
export type Repair = typeof repairs.$inferSelect;
export type FuelEntry = typeof fuelEntries.$inferSelect;
export type ConcretePour = typeof concretePours.$inferSelect;
export type NewConcretePour = typeof concretePours.$inferInsert;

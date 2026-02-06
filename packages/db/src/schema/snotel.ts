import { pgTable, serial, text, integer, real, date, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const snotelStations = pgTable('snotel_stations', {
  id: serial('id').primaryKey(),
  stationId: text('station_id').notNull().unique(),
  name: text('name').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  elevation: integer('elevation').notNull(),
  resortMappings: jsonb('resort_mappings'), // [{resort_id, distance_miles}]
  state: text('state'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const snotelReadings = pgTable('snotel_readings', {
  id: serial('id').primaryKey(),
  stationId: text('station_id')
    .notNull()
    .references(() => snotelStations.stationId),
  date: date('date').notNull(),
  swe: real('swe'), // snow water equivalent in inches
  sweMedianPct: real('swe_median_pct'), // percentage of 30-year median
  snowDepth: real('snow_depth'), // inches
  precipAccum: real('precip_accum'), // inches
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const avalancheZones = pgTable('avalanche_zones', {
  id: serial('id').primaryKey(),
  zoneId: text('zone_id').notNull().unique(),
  name: text('name').notNull(),
  boundary: jsonb('boundary'), // GeoJSON polygon
  dangerRating: text('danger_rating'), // 'low', 'moderate', 'considerable', 'high', 'extreme'
  dangerElevationHigh: text('danger_elevation_high'),
  dangerElevationMiddle: text('danger_elevation_middle'),
  dangerElevationLow: text('danger_elevation_low'),
  source: text('source'), // 'caic', 'avalanche.org', etc.
  forecastUrl: text('forecast_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

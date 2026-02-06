import { pgTable, serial, text, integer, real, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { resorts } from './resorts.js';

export const driveTimes = pgTable(
  'drive_times',
  {
    id: serial('id').primaryKey(),
    originCity: text('origin_city').notNull(), // e.g., "Denver, CO"
    originLat: real('origin_lat').notNull(),
    originLng: real('origin_lng').notNull(),
    resortId: integer('resort_id')
      .notNull()
      .references(() => resorts.id),
    durationMinutes: integer('duration_minutes').notNull(),
    distanceMiles: real('distance_miles').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('drive_times_origin_resort_idx').on(table.originCity, table.resortId)],
);

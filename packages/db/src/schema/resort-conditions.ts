import { pgTable, serial, integer, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { resorts } from './resorts.js';

export const resortConditions = pgTable(
  'resort_conditions',
  {
    id: serial('id').primaryKey(),
    resortId: integer('resort_id')
      .notNull()
      .references(() => resorts.id)
      .unique(),
    snowfall24h: real('snowfall_24h'),
    snowfall48h: real('snowfall_48h'),
    snowfall72h: real('snowfall_72h'),
    baseDepth: integer('base_depth'),
    summitDepth: integer('summit_depth'),
    liftsOpen: integer('lifts_open'),
    trailsOpen: integer('trails_open'),
    surfaceCondition: text('surface_condition'),
    resortStatus: text('resort_status'), // 'open', 'closed', 'expected'
    source: text('source'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('resort_conditions_resort_id_idx').on(table.resortId)],
);

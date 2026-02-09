import {
  pgTable,
  bigserial,
  bigint,
  integer,
  text,
  date,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { resorts } from './resorts.js';

export const snowReports = pgTable(
  'snow_reports',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    resortId: bigint('resort_id', { mode: 'number' })
      .notNull()
      .references(() => resorts.id, { onDelete: 'cascade' }),
    reportDate: date('report_date').notNull(),
    openFlag: integer('open_flag'), // 1=Open, 2=Closed, 3=Temp Closed
    openingDate: date('opening_date'),
    closingDate: date('closing_date'),
    depthBaseCm: integer('depth_base_cm'),
    depthMiddleCm: integer('depth_middle_cm'),
    depthSummitCm: integer('depth_summit_cm'),
    snowfall24hCm: integer('snowfall_24h_cm'),
    snowfall48hCm: integer('snowfall_48h_cm'),
    snowfall72hCm: integer('snowfall_72h_cm'),
    snowfall7dayCm: integer('snowfall_7day_cm'),
    liftsTotal: integer('lifts_total'),
    liftsOpen: integer('lifts_open'),
    runsTotal: integer('runs_total'),
    runsOpen: integer('runs_open'),
    runsBeginnerPct: integer('runs_beginner_pct'),
    runsIntermediatePct: integer('runs_intermediate_pct'),
    runsAdvancedPct: integer('runs_advanced_pct'),
    acresTotal: integer('acres_total'),
    acresOpen: integer('acres_open'),
    parksTotal: integer('parks_total'),
    parksOpen: integer('parks_open'),
    surfaceTypeSummit: integer('surface_type_summit'), // code 1-18
    surfaceTypeBase: integer('surface_type_base'), // code 1-18
    surfaceDescription: text('surface_description'),
    snowpackPercentNormal: integer('snowpack_percent_normal'),
    stormSeverity: text('storm_severity'),
    stormScore: integer('storm_score'),
    dataSource: text('data_source').default('scraped'),
    lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('snow_reports_resort_date_uniq').on(table.resortId, table.reportDate),
    index('snow_reports_resort_id_idx').on(table.resortId),
    index('snow_reports_report_date_idx').on(table.reportDate),
  ],
);

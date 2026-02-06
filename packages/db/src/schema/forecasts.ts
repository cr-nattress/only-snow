import {
  pgTable,
  serial,
  integer,
  real,
  text,
  date,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { resorts } from './resorts.js';

export const forecasts = pgTable(
  'forecasts',
  {
    id: serial('id').primaryKey(),
    resortId: integer('resort_id')
      .notNull()
      .references(() => resorts.id),
    date: date('date').notNull(),
    snowfall: real('snowfall'), // inches
    tempHigh: real('temp_high'), // fahrenheit
    tempLow: real('temp_low'),
    windSpeed: real('wind_speed'), // mph
    windDirection: text('wind_direction'),
    cloudCover: integer('cloud_cover'), // percentage
    precipProbability: integer('precip_probability'), // percentage
    freezingLevel: integer('freezing_level'), // feet
    conditions: text('conditions'), // 'snow', 'rain', 'clear', 'cloudy', etc.
    confidence: text('confidence'), // 'high', 'medium', 'low'
    source: text('source').notNull().default('open-meteo'),
    forecastNarrative: text('forecast_narrative'), // AI-generated snow report
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('forecasts_resort_date_idx').on(table.resortId, table.date)],
);

import { pgTable, serial, integer, real, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { resorts } from './resorts.js';

export const forecastHourly = pgTable(
  'forecast_hourly',
  {
    id: serial('id').primaryKey(),
    resortId: integer('resort_id')
      .notNull()
      .references(() => resorts.id),
    datetime: timestamp('datetime', { withTimezone: true }).notNull(),
    temperature: real('temperature'), // fahrenheit
    snowfall: real('snowfall'), // inches
    precipitation: real('precipitation'), // inches
    windSpeed: real('wind_speed'), // mph
    windDirection: integer('wind_direction'), // degrees
    cloudCover: integer('cloud_cover'), // percentage
    freezingLevel: integer('freezing_level'), // feet
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('forecast_hourly_resort_datetime_idx').on(table.resortId, table.datetime),
  ],
);

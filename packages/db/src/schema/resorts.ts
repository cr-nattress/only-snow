import { pgTable, serial, text, integer, jsonb, timestamp, real, boolean, index } from 'drizzle-orm/pg-core';
import { chaseRegions } from './chase-regions.js';

export const resorts = pgTable(
  'resorts',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    elevationSummit: integer('elevation_summit').notNull(),
    elevationBase: integer('elevation_base').notNull(),
    region: text('region').notNull(),
    chaseRegionId: integer('chase_region_id').references(() => chaseRegions.id),
    passType: text('pass_type'), // 'epic', 'ikon', 'independent', 'both'
    aspect: text('aspect'),
    terrainProfile: jsonb('terrain_profile'), // {beginner: 20, intermediate: 40, advanced: 40}
    totalLifts: integer('total_lifts'),
    totalTrails: integer('total_trails'),
    terrainAcres: integer('terrain_acres'),
    annualSnowfall: integer('annual_snowfall'), // average annual snowfall in inches
    nightSkiing: boolean('night_skiing'),
    snowmakingPercent: integer('snowmaking_percent'), // % of terrain with snowmaking
    longestRun: real('longest_run'), // longest run in miles
    terrainParks: integer('terrain_parks'),
    website: text('website'),
    webcamUrl: text('webcam_url'),
    nearestAirport: text('nearest_airport'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('resorts_region_idx').on(table.region)],
);

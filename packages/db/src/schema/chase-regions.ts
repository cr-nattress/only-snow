import { pgTable, serial, text, real } from 'drizzle-orm/pg-core';

export const chaseRegions = pgTable('chase_regions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  bestAirport: text('best_airport'),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
});

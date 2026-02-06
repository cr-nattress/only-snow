import { pgTable, serial, integer, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { resorts } from './resorts.js';

export const savedTrips = pgTable('saved_trips', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  resortId: integer('resort_id')
    .notNull()
    .references(() => resorts.id),
  startDate: text('start_date'), // ISO date string
  endDate: text('end_date'),
  flightSnapshot: jsonb('flight_snapshot'), // {price_cents, airline, origin, destination}
  lodgingSnapshot: jsonb('lodging_snapshot'), // {price_cents, name, type}
  totalEstimate: integer('total_estimate'), // cents
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

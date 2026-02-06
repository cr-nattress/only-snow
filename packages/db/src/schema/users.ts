import { pgTable, text, integer, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // matches Supabase auth.users.id
  email: text('email').notNull(),
  displayName: text('display_name'),
  location: text('location'), // city/state or lat,lng
  lat: integer('lat'),
  lng: integer('lng'),
  passType: text('pass_type'), // 'epic', 'ikon', 'both', 'none'
  driveRadius: integer('drive_radius'), // miles
  chaseWillingness: text('chase_willingness'), // 'local', 'regional', 'national'
  persona: text('persona'), // 'powder-hunter', 'family-planner', 'beginner', 'weekend-warrior', 'destination-traveler'
  preferences: jsonb('preferences'), // flexible storage for additional prefs
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

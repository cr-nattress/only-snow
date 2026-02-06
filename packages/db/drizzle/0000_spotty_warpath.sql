CREATE TABLE "avalanche_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"zone_id" text NOT NULL,
	"name" text NOT NULL,
	"boundary" jsonb,
	"danger_rating" text,
	"danger_elevation_high" text,
	"danger_elevation_middle" text,
	"danger_elevation_low" text,
	"source" text,
	"forecast_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "avalanche_zones_zone_id_unique" UNIQUE("zone_id")
);
--> statement-breakpoint
CREATE TABLE "chase_regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"best_airport" text,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	CONSTRAINT "chase_regions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "drive_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"origin_city" text NOT NULL,
	"origin_lat" real NOT NULL,
	"origin_lng" real NOT NULL,
	"resort_id" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"distance_miles" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forecast_hourly" (
	"id" serial PRIMARY KEY NOT NULL,
	"resort_id" integer NOT NULL,
	"datetime" timestamp with time zone NOT NULL,
	"temperature" real,
	"snowfall" real,
	"precipitation" real,
	"wind_speed" real,
	"wind_direction" integer,
	"cloud_cover" integer,
	"freezing_level" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"resort_id" integer NOT NULL,
	"date" date NOT NULL,
	"snowfall" real,
	"temp_high" real,
	"temp_low" real,
	"wind_speed" real,
	"wind_direction" text,
	"cloud_cover" integer,
	"precip_probability" integer,
	"freezing_level" integer,
	"conditions" text,
	"confidence" text,
	"source" text DEFAULT 'open-meteo' NOT NULL,
	"forecast_narrative" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resort_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"resort_id" integer NOT NULL,
	"snowfall_24h" real,
	"snowfall_48h" real,
	"snowfall_72h" real,
	"base_depth" integer,
	"summit_depth" integer,
	"lifts_open" integer,
	"trails_open" integer,
	"surface_condition" text,
	"resort_status" text,
	"source" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resort_conditions_resort_id_unique" UNIQUE("resort_id")
);
--> statement-breakpoint
CREATE TABLE "resorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"elevation_summit" integer NOT NULL,
	"elevation_base" integer NOT NULL,
	"region" text NOT NULL,
	"chase_region_id" integer,
	"pass_type" text,
	"aspect" text,
	"terrain_profile" jsonb,
	"total_lifts" integer,
	"total_trails" integer,
	"terrain_acres" integer,
	"website" text,
	"nearest_airport" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resorts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "saved_trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"resort_id" integer NOT NULL,
	"start_date" text,
	"end_date" text,
	"flight_snapshot" jsonb,
	"lodging_snapshot" jsonb,
	"total_estimate" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snotel_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"date" date NOT NULL,
	"swe" real,
	"swe_median_pct" real,
	"snow_depth" real,
	"precip_accum" real,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snotel_stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"name" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"elevation" integer NOT NULL,
	"resort_mappings" jsonb,
	"state" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snotel_stations_station_id_unique" UNIQUE("station_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"location" text,
	"lat" integer,
	"lng" integer,
	"pass_type" text,
	"drive_radius" integer,
	"chase_willingness" text,
	"persona" text,
	"preferences" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drive_times" ADD CONSTRAINT "drive_times_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecast_hourly" ADD CONSTRAINT "forecast_hourly_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_conditions" ADD CONSTRAINT "resort_conditions_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resorts" ADD CONSTRAINT "resorts_chase_region_id_chase_regions_id_fk" FOREIGN KEY ("chase_region_id") REFERENCES "public"."chase_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_trips" ADD CONSTRAINT "saved_trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_trips" ADD CONSTRAINT "saved_trips_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snotel_readings" ADD CONSTRAINT "snotel_readings_station_id_snotel_stations_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."snotel_stations"("station_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "drive_times_origin_resort_idx" ON "drive_times" USING btree ("origin_city","resort_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forecast_hourly_resort_datetime_idx" ON "forecast_hourly" USING btree ("resort_id","datetime");--> statement-breakpoint
CREATE UNIQUE INDEX "forecasts_resort_date_idx" ON "forecasts" USING btree ("resort_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "resort_conditions_resort_id_idx" ON "resort_conditions" USING btree ("resort_id");--> statement-breakpoint
CREATE INDEX "resorts_region_idx" ON "resorts" USING btree ("region");
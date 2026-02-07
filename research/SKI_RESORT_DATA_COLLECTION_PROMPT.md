# Ski Resort / Ski Area Data Collection Prompt

## Instructions
Replace `{RESORT_NAME}` with the name of any US ski resort or ski area. Paste this entire prompt into a new conversation with web search enabled.

---

## Prompt

```
Search the web for comprehensive, up-to-date statistics and figures for the ski resort or ski area named "{RESORT_NAME}" in the United States. Collect as much data as possible across every category below. If a data point is not available or not applicable, use null.

Return the results as a single valid JSON object using the exact schema below. Do not include any commentary outside the JSON. Use the units specified in the field descriptions. All numeric values should be numbers (not strings). All boolean values should be true/false. Strings should be concise.

If a field has multiple credible but conflicting sources, prefer the resort's own official website, then Wikipedia, then major ski industry aggregators (OnTheSnow, SkiCentral, ZRankings, etc.).

{
  "meta": {
    "resort_name": "string — official name of the resort",
    "also_known_as": ["string — any former or alternate names"],
    "data_retrieved_date": "string — YYYY-MM-DD of when this data was gathered",
    "primary_sources": ["string — URLs of the main sources used"]
  },

  "location": {
    "state": "string — two-letter state abbreviation",
    "county": "string",
    "nearest_town": "string",
    "nearest_major_city": "string",
    "distance_to_nearest_major_city_miles": "number or null",
    "drive_time_to_nearest_major_city_hours": "number or null",
    "latitude": "number — decimal degrees",
    "longitude": "number — decimal degrees",
    "address": "string — street address if available",
    "region": "string — e.g. Rocky Mountain, Northeast, Mid-Atlantic, Pacific Northwest, Sierra Nevada, Midwest, Southeast"
  },

  "ownership_and_operations": {
    "owner_operator": "string — parent company or ownership entity",
    "publicly_traded": "boolean or null",
    "stock_ticker": "string or null — e.g. MTN",
    "management_type": "string — e.g. Corporate, Independent, Municipal, Cooperative",
    "multi_resort_pass_affiliations": ["string — e.g. Epic Pass, Ikon Pass, Indy Pass, Mountain Collective"],
    "year_opened": "number — four-digit year",
    "year_of_last_major_expansion": "number or null"
  },

  "elevation": {
    "base_elevation_ft": "number",
    "summit_elevation_ft": "number",
    "vertical_drop_ft": "number",
    "mid_mountain_elevation_ft": "number or null"
  },

  "terrain": {
    "skiable_acres": "number",
    "total_named_trails": "number",
    "longest_run_miles": "number or null",
    "longest_run_name": "string or null",
    "terrain_breakdown_pct": {
      "beginner_green": "number — percentage",
      "intermediate_blue": "number — percentage",
      "advanced_black": "number — percentage",
      "expert_double_black": "number or null — percentage, if reported separately"
    },
    "trail_count_by_difficulty": {
      "beginner_green": "number or null",
      "intermediate_blue": "number or null",
      "advanced_black": "number or null",
      "expert_double_black": "number or null"
    },
    "gladed_trails": "boolean or null",
    "bowl_skiing": "boolean",
    "number_of_bowls": "number or null",
    "alpine_above_treeline_terrain": "boolean or null",
    "terrain_zones": [
      {
        "zone_name": "string",
        "acres": "number or null",
        "description": "string — brief"
      }
    ]
  },

  "lifts": {
    "total_lifts": "number",
    "uphill_capacity_per_hour": "number or null",
    "lift_breakdown": {
      "gondolas": "number",
      "high_speed_six_packs": "number",
      "high_speed_quads": "number",
      "fixed_grip_quads": "number",
      "triples": "number",
      "doubles": "number",
      "surface_lifts_carpet_tbar_poma": "number",
      "tow_ropes": "number"
    },
    "notable_lifts": [
      {
        "name": "string",
        "type": "string",
        "year_installed": "number or null",
        "notes": "string or null"
      }
    ]
  },

  "snow_and_weather": {
    "average_annual_snowfall_inches": "number",
    "snowfall_by_month_inches": {
      "october": "number or null",
      "november": "number or null",
      "december": "number or null",
      "january": "number or null",
      "february": "number or null",
      "march": "number or null",
      "april": "number or null",
      "may": "number or null"
    },
    "snowmaking_coverage_pct": "number or null — percentage of terrain with snowmaking",
    "snowmaking_available": "boolean",
    "average_days_with_natural_snowfall": "number or null",
    "predominant_snow_type": "string or null — e.g. powder, packed powder, man-made, variable"
  },

  "season": {
    "typical_opening_date": "string — e.g. mid-November, early December",
    "typical_closing_date": "string — e.g. mid-April, late March",
    "average_season_length_days": "number or null",
    "current_or_most_recent_season": {
      "season_label": "string — e.g. 2025-2026",
      "opening_date": "string — YYYY-MM-DD or null",
      "closing_date": "string — YYYY-MM-DD or null if still open/unknown",
      "season_snowfall_to_date_inches": "number or null"
    }
  },

  "terrain_parks_and_features": {
    "terrain_parks_count": "number",
    "halfpipe": "boolean",
    "superpipe": "boolean",
    "terrain_park_names": ["string"],
    "terrain_park_difficulty_levels": ["string — e.g. beginner, intermediate, advanced, expert"],
    "tubing": "boolean",
    "tubing_lanes": "number or null",
    "cross_country_nordic_trails": "boolean",
    "cross_country_trail_miles": "number or null",
    "snowshoeing": "boolean",
    "cat_skiing": "boolean",
    "heli_skiing": "boolean"
  },

  "night_skiing": {
    "available": "boolean",
    "lit_trails": "number or null",
    "lit_acres": "number or null",
    "night_skiing_coverage_pct": "number or null — percentage of total terrain lit"
  },

  "pricing": {
    "currency": "USD",
    "season": "string — e.g. 2025-2026",
    "adult_weekend_day_ticket_usd": "number or null — window/peak price",
    "adult_midweek_day_ticket_usd": "number or null",
    "child_day_ticket_usd": "number or null",
    "senior_day_ticket_usd": "number or null",
    "season_pass_usd": "number or null — resort-specific full season pass if available",
    "multi_resort_pass_name": "string or null — e.g. Epic Pass, Ikon Pass",
    "multi_resort_pass_price_usd": "number or null",
    "dynamic_pricing": "boolean or null — does the resort use variable/demand-based pricing",
    "notes": "string or null — any pricing caveats"
  },

  "amenities_and_services": {
    "ski_school": "boolean",
    "rental_shop": "boolean",
    "on_mountain_dining_venues": "number or null",
    "base_area_dining_venues": "number or null",
    "lodging_on_site_or_slopeside": "boolean",
    "childcare": "boolean",
    "adaptive_skiing_program": "boolean",
    "retail_shops": "boolean",
    "spa_or_fitness": "boolean or null",
    "ice_skating": "boolean or null",
    "snowmobile_tours": "boolean or null",
    "dog_sledding": "boolean or null",
    "summer_operations": "boolean",
    "summer_activities": ["string — e.g. mountain biking, hiking, zip line, alpine coaster, golf"]
  },

  "accessibility_and_transportation": {
    "nearest_commercial_airport_code": "string — IATA code",
    "nearest_commercial_airport_name": "string",
    "distance_to_airport_miles": "number or null",
    "shuttle_service_from_airport": "boolean or null",
    "public_transit_access": "boolean or null",
    "free_resort_shuttle": "boolean or null",
    "parking_free": "boolean or null",
    "parking_paid_cost_usd": "number or null",
    "interstate_highway_proximity": "string or null — e.g. I-70 Exit 176"
  },

  "rankings_and_awards": {
    "notable_rankings": [
      {
        "source": "string",
        "ranking": "string",
        "year": "number or null"
      }
    ],
    "hosted_events": ["string — e.g. FIS World Cup, X Games, World Championships"]
  },

  "history_and_notable_facts": {
    "year_founded": "number",
    "founder_or_founding_entity": "string or null",
    "historical_significance": "string or null — brief paragraph",
    "notable_facts": ["string — interesting bullet points"]
  },

  "financials_and_visitation": {
    "estimated_annual_skier_visits": "number or null",
    "skier_visit_trend": "string or null — e.g. growing, declining, stable",
    "annual_revenue_usd": "number or null — if publicly available",
    "economic_impact_to_region_usd": "number or null",
    "employees_seasonal": "number or null",
    "employees_year_round": "number or null"
  },

  "environmental_and_sustainability": {
    "renewable_energy_use": "boolean or null",
    "sustainability_certifications": ["string or null"],
    "carbon_offset_programs": "boolean or null",
    "water_reclamation_for_snowmaking": "boolean or null",
    "notable_sustainability_initiatives": ["string"]
  }
}
```

---

## Usage Notes

- **Works for any US ski resort** — from mega-resorts (Vail, Park City, Whistler Blackcomb) to small regional areas (Montage Mountain, Mad River Glen, Hyland Hills).
- **Null handling** — Small ski areas will naturally have many null fields (e.g. no bowls, no gondolas, no heli-skiing). That's expected and keeps the schema consistent for comparative analysis.
- **Sources** — The prompt instructs the model to prefer official resort websites, then Wikipedia, then aggregators. You can adjust source priority as needed.
- **Season-specific data** — Pricing and current season fields will need to be re-collected each year.
- **Batch usage** — Run this prompt once per resort, swapping out `{RESORT_NAME}`. The consistent schema makes it easy to load results into a database, spreadsheet, or data pipeline.

## Example Resort Names to Query

- Vail
- Montage Mountain
- Park City Mountain Resort
- Steamboat Springs
- Stowe Mountain Resort
- Big Sky Resort
- Jackson Hole Mountain Resort
- Mammoth Mountain
- Killington Resort
- Mad River Glen
- Snowshoe Mountain
- Boyne Mountain
- Crystal Mountain (WA)
- Schweitzer Mountain
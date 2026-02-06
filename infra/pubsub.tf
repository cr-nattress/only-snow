# Pub/Sub topics for pipeline triggers (enables retry logic)

resource "google_pubsub_topic" "forecast_refresh" {
  name = "onlysnow-forecast-refresh"
}

resource "google_pubsub_topic" "conditions_refresh" {
  name = "onlysnow-conditions-refresh"
}

resource "google_pubsub_topic" "snotel_daily" {
  name = "onlysnow-snotel-daily"
}

resource "google_pubsub_topic" "avalanche_daily" {
  name = "onlysnow-avalanche-daily"
}

resource "google_pubsub_topic" "road_conditions" {
  name = "onlysnow-road-conditions"
}

resource "google_pubsub_topic" "drive_times" {
  name = "onlysnow-drive-times"
}

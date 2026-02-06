# Cloud Scheduler jobs for each pipeline

# Forecast Refresh: every 6 hours
resource "google_cloud_scheduler_job" "forecast_refresh" {
  name        = "onlysnow-forecast-refresh"
  description = "Trigger forecast refresh pipeline every 6 hours"
  schedule    = "0 */6 * * *"
  time_zone   = "America/Denver"

  pubsub_target {
    topic_name = google_pubsub_topic.forecast_refresh.id
    data       = base64encode("{\"trigger\": \"scheduled\"}")
  }

  retry_config {
    retry_count          = 3
    min_backoff_duration = "30s"
    max_backoff_duration = "300s"
  }
}

# Conditions Refresh: every 2 hours during ski season (Nov-Apr)
# During off-season, disable this job via console or CI
resource "google_cloud_scheduler_job" "conditions_refresh" {
  name        = "onlysnow-conditions-refresh"
  description = "Trigger conditions refresh every 2 hours (in-season)"
  schedule    = "0 */2 * 11,12,1,2,3,4 *"
  time_zone   = "America/Denver"

  pubsub_target {
    topic_name = google_pubsub_topic.conditions_refresh.id
    data       = base64encode("{\"trigger\": \"scheduled\"}")
  }

  retry_config {
    retry_count = 3
  }
}

# SNOTEL Daily: once daily at 08:00 UTC (1:00 AM MT)
resource "google_cloud_scheduler_job" "snotel_daily" {
  name        = "onlysnow-snotel-daily"
  description = "Trigger daily SNOTEL data pull"
  schedule    = "0 1 * * *"
  time_zone   = "America/Denver"

  pubsub_target {
    topic_name = google_pubsub_topic.snotel_daily.id
    data       = base64encode("{\"trigger\": \"scheduled\"}")
  }

  retry_config {
    retry_count = 3
  }
}

# Avalanche Daily: once daily at 22:00 UTC (3:00 PM MT, after CAIC publishes)
resource "google_cloud_scheduler_job" "avalanche_daily" {
  name        = "onlysnow-avalanche-daily"
  description = "Trigger daily avalanche danger rating pull"
  schedule    = "0 15 * * *"
  time_zone   = "America/Denver"

  pubsub_target {
    topic_name = google_pubsub_topic.avalanche_daily.id
    data       = base64encode("{\"trigger\": \"scheduled\"}")
  }

  retry_config {
    retry_count = 3
  }
}

# Road Conditions: 4x daily during season, can be increased during storms
resource "google_cloud_scheduler_job" "road_conditions" {
  name        = "onlysnow-road-conditions"
  description = "Trigger road conditions check"
  schedule    = "0 6,10,14,18 * 11,12,1,2,3,4 *"
  time_zone   = "America/Denver"

  pubsub_target {
    topic_name = google_pubsub_topic.road_conditions.id
    data       = base64encode("{\"trigger\": \"scheduled\"}")
  }

  retry_config {
    retry_count = 2
  }
}

# Drive Times: weekly on Sundays at 3:00 AM MT
resource "google_cloud_scheduler_job" "drive_times" {
  name        = "onlysnow-drive-times"
  description = "Recompute drive times from major metros"
  schedule    = "0 3 * * 0"
  time_zone   = "America/Denver"

  pubsub_target {
    topic_name = google_pubsub_topic.drive_times.id
    data       = base64encode("{\"trigger\": \"scheduled\"}")
  }

  retry_config {
    retry_count = 2
  }
}

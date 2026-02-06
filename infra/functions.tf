# Cloud Functions Gen2 for data pipelines
# Note: Source code is deployed via GitHub Actions (gcloud functions deploy)
# These resource definitions manage the function configuration only.

locals {
  pipeline_env_vars = {
    DATABASE_URL          = var.database_url
    UPSTASH_REDIS_REST_URL   = var.upstash_redis_url
    UPSTASH_REDIS_REST_TOKEN = var.upstash_redis_token
    ANTHROPIC_API_KEY     = var.anthropic_api_key
    NODE_ENV              = "production"
  }
}

# Forecast Refresh (most resource-intensive: processes all resorts)
resource "google_cloudfunctions2_function" "forecast_refresh" {
  name     = "onlysnow-forecast-refresh"
  location = var.gcp_region

  build_config {
    runtime     = "nodejs20"
    entry_point = "forecastRefresh"
    source {
      storage_source {
        bucket = google_storage_bucket.pipeline_source.name
        object = "forecast-refresh.zip"
      }
    }
  }

  service_config {
    max_instance_count    = 1
    min_instance_count    = 0
    available_memory      = "512Mi"
    timeout_seconds       = 540
    service_account_email = google_service_account.pipeline_sa.email
    environment_variables = local.pipeline_env_vars
  }

  event_trigger {
    trigger_region = var.gcp_region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.forecast_refresh.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }
}

# Storage bucket for Cloud Function source code
resource "google_storage_bucket" "pipeline_source" {
  name     = "${var.gcp_project_id}-pipeline-source"
  location = var.gcp_region

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Enable required GCP APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "cloudscheduler.googleapis.com",
    "pubsub.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

output "forecast_refresh_url" {
  description = "URL of the forecast refresh Cloud Function"
  value       = google_cloudfunctions2_function.forecast_refresh.service_config[0].uri
}

output "pipeline_service_account" {
  description = "Email of the pipeline service account"
  value       = google_service_account.pipeline_sa.email
}

output "source_bucket" {
  description = "GCS bucket for Cloud Function source code"
  value       = google_storage_bucket.pipeline_source.name
}

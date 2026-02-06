# Service account for pipeline Cloud Functions
resource "google_service_account" "pipeline_sa" {
  account_id   = "onlysnow-pipelines"
  display_name = "OnlySnow Pipeline Functions"
  description  = "Service account for data ingestion Cloud Functions"
}

# Allow Cloud Scheduler to invoke Cloud Functions via Pub/Sub
resource "google_project_iam_member" "scheduler_invoker" {
  project = var.gcp_project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.pipeline_sa.email}"
}

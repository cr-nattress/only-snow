variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region for Cloud Functions and Scheduler"
  type        = string
  default     = "us-central1"
}

variable "database_url" {
  description = "Supabase PostgreSQL connection string (pooled)"
  type        = string
  sensitive   = true
}

variable "upstash_redis_url" {
  description = "Upstash Redis REST URL"
  type        = string
  sensitive   = true
}

variable "upstash_redis_token" {
  description = "Upstash Redis REST token"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for Claude AI narratives"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_maps_api_key" {
  description = "Google Maps API key for drive time calculations"
  type        = string
  sensitive   = true
}

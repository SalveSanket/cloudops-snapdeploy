variable "bucket_name" {
  description = "Name of the S3 bucket to store snapshot folders."
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. dev, prod)."
  type        = string
  default     = "dev"
}
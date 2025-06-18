variable "table_name" {
  description = "The name of the DynamoDB table to create."
  type        = string
}

variable "environment" {
  description = "The environment (e.g. dev, prod)."
  type        = string
  default     = "dev"
}
provider "aws" {
  region = var.aws_region
}

# root/variables.tf (append)
variable "aws_region" {
  description = "AWS region to deploy resources."
  type        = string
  default     = "us-east-1"
}
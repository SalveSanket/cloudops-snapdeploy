# root/outputs.tf

# DynamoDB Outputs
output "dynamodb_table_name" {
  description = "The name of the DynamoDB table that stores AWS account credentials."
  value       = module.dynamodb_accounts.table_name
}

output "dynamodb_table_arn" {
  description = "The ARN (Amazon Resource Name) of the DynamoDB table used for storing account metadata."
  value       = module.dynamodb_accounts.table_arn
}

# S3 Bucket Outputs
output "s3_bucket_name" {
  description = "The name of the S3 bucket where service snapshots are stored."
  value       = module.s3_snapshots.bucket_name
}

output "s3_bucket_arn" {
  description = "The ARN (Amazon Resource Name) of the S3 bucket used to store snapshot data for different AWS accounts."
  value       = module.s3_snapshots.bucket_arn
}
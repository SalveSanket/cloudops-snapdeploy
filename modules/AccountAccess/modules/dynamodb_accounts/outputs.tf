output "table_name" {
  description = "The name of the DynamoDB table."
  value       = aws_dynamodb_table.accounts.name
}

output "table_arn" {
  description = "The ARN of the DynamoDB table."
  value       = aws_dynamodb_table.accounts.arn
}
resource "aws_dynamodb_table" "accounts" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "account_id"

  attribute {
    name = "account_id"
    type = "S"
  }

  tags = {
    Environment = var.environment
    Project     = "CloudOps SnapDeploy"
  }
}
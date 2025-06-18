module "dynamodb_accounts" {
  source      = "./modules/dynamodb_accounts"
  table_name  = "snapdeploy-accounts"
  environment = var.environment
}

module "s3_snapshots" {
  source      = "./modules/s3_snapshots"
  bucket_name = "cloudops-snapdeploy-snapshots"
  environment = var.environment
}
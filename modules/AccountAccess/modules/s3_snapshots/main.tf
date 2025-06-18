resource "aws_s3_bucket" "snapshots" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Environment = var.environment
    Project     = "CloudOps SnapDeploy"
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.snapshots.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
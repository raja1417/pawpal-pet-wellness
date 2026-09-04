terraform {
  backend "s3" {
    bucket         = "pawpal-terraform-state"
    key            = "pawpal/dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "pawpal-terraform-locks"
  }
}

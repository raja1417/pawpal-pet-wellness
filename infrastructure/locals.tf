locals {
  name_prefix = "${var.app_name}-${var.environment}"

  common_tags = {
    Application = var.app_name
    Environment = var.environment
    CreatedBy   = "pawpal"
    ManagedBy   = "terraform"
  }
}

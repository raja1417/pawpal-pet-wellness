variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be either dev or prod."
  }
}

variable "region" {
  description = "AWS region in which to deploy."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name used in resource names."
  type        = string
  default     = "pawpal"
}

variable "instance_count" {
  description = "Desired number of EKS worker nodes."
  type        = number
  default     = 1

  validation {
    condition     = var.instance_count >= 1
    error_message = "instance_count must be at least 1."
  }
}

variable "db_size" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_storage" {
  description = "RDS allocated storage in GiB."
  type        = number
  default     = 20

  validation {
    condition     = var.db_storage >= 20
    error_message = "db_storage must be at least 20 GiB."
  }
}

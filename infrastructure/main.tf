terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = local.common_tags
  }
}

data "aws_caller_identity" "current" {}

module "vpc" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/vpc?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name               = local.name_prefix
  cidr_block         = "10.0.0.0/16"
  create_nat_gateway = true
  subnets = {
    public-a = {
      cidr_block              = "10.0.1.0/24"
      availability_zone       = "${var.region}a"
      public                  = true
      map_public_ip_on_launch = true
    }
    public-b = {
      cidr_block              = "10.0.2.0/24"
      availability_zone       = "${var.region}b"
      public                  = true
      map_public_ip_on_launch = true
    }
    private-a = {
      cidr_block        = "10.0.11.0/24"
      availability_zone = "${var.region}a"
    }
    private-b = {
      cidr_block        = "10.0.12.0/24"
      availability_zone = "${var.region}b"
    }
  }
  tags = local.common_tags
}

module "alb_security_group" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/security-group?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name   = "${local.name_prefix}-alb"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [
    {
      description = "HTTP ingress"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "HTTPS ingress"
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
  tags = local.common_tags
}

module "eks_security_group" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/security-group?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name   = "${local.name_prefix}-eks"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [
    {
      description     = "Application traffic from ALB"
      from_port       = 3000
      to_port         = 8080
      protocol        = "tcp"
      security_groups = [module.alb_security_group.id]
    },
    {
      description = "EKS node communication"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      self        = true
    }
  ]
  tags = local.common_tags
}

module "rds_security_group" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/security-group?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name   = "${local.name_prefix}-rds"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [{
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks_security_group.id]
  }]
  tags = local.common_tags
}

resource "aws_iam_role" "eks_cluster" {
  name = "${local.name_prefix}-eks-cluster"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "eks_nodes" {
  name = "${local.name_prefix}-eks-nodes"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_nodes" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  ])

  role       = aws_iam_role.eks_nodes.name
  policy_arn = each.value
}

module "eks" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/eks?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name                   = local.name_prefix
  cluster_role_arn       = aws_iam_role.eks_cluster.arn
  node_role_arn          = aws_iam_role.eks_nodes.arn
  subnet_ids             = module.vpc.private_subnet_ids
  security_group_ids     = [module.eks_security_group.id]
  endpoint_public_access = true
  node_groups = {
    application = {
      subnet_ids     = module.vpc.private_subnet_ids
      instance_types = ["t3.medium"]
      desired_size   = var.instance_count
      min_size       = var.environment == "prod" ? 3 : 1
      max_size       = var.environment == "prod" ? 6 : 2
      disk_size      = 30
    }
  }
  addons = {
    coredns    = {}
    kube-proxy = {}
    vpc-cni    = {}
  }
  tags = local.common_tags

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster,
    aws_iam_role_policy_attachment.eks_nodes
  ]
}

module "rds" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/rds?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name                            = "${local.name_prefix}-postgres"
  engine                          = "postgres"
  instance_class                  = var.db_size
  allocated_storage               = var.db_storage
  max_allocated_storage           = var.db_storage * 5
  db_name                         = "pawpal"
  username                        = "pawpal_admin"
  manage_master_user_password     = true
  subnet_ids                      = module.vpc.private_subnet_ids
  vpc_security_group_ids          = [module.rds_security_group.id]
  backup_retention_period         = var.environment == "prod" ? 30 : 7
  multi_az                        = var.environment == "prod"
  deletion_protection             = var.environment == "prod"
  skip_final_snapshot             = var.environment != "prod"
  monitoring_interval             = 0
  performance_insights_enabled    = var.environment == "prod"
  enabled_cloudwatch_logs_exports = ["postgresql"]
  tags                            = local.common_tags
}

module "app_data" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/s3?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name          = "${local.name_prefix}-${data.aws_caller_identity.current.account_id}-data"
  force_destroy = var.environment != "prod"
  lifecycle_rules = [{
    id                                 = "archive-backups"
    noncurrent_version_expiration_days = 90
    transitions = [{
      days          = 30
      storage_class = "STANDARD_IA"
    }]
  }]
  tags = local.common_tags
}

module "alb" {
  source = "git::https://github.com/raja1417/terraform-modules.git//aws/alb?ref=368a0e709a8829885f1ebda6572eb72d22486811"

  name                       = substr(local.name_prefix, 0, 32)
  security_group_ids         = [module.alb_security_group.id]
  subnet_ids                 = module.vpc.public_subnet_ids
  enable_deletion_protection = var.environment == "prod"
  target_groups = {
    web = {
      port        = 80
      vpc_id      = module.vpc.vpc_id
      target_type = "ip"
      health_check = {
        path = "/"
      }
    }
  }
  listeners = {
    http = {
      port             = 80
      protocol         = "HTTP"
      target_group_key = "web"
    }
  }
  tags = local.common_tags
}

data "aws_eks_cluster" "this" {
  name = module.eks.cluster_name
}

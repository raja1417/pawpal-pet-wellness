output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_endpoint" {
  value     = module.eks.endpoint
  sensitive = true
}

output "kubeconfig" {
  description = "Kubeconfig for authenticating to the EKS cluster with the AWS CLI."
  sensitive   = true
  value = yamlencode({
    apiVersion = "v1"
    kind       = "Config"
    clusters = [{
      name = module.eks.cluster_name
      cluster = {
        server                     = module.eks.endpoint
        certificate-authority-data = data.aws_eks_cluster.this.certificate_authority[0].data
      }
    }]
    contexts = [{
      name = module.eks.cluster_name
      context = {
        cluster = module.eks.cluster_name
        user    = module.eks.cluster_name
      }
    }]
    current-context = module.eks.cluster_name
    users = [{
      name = module.eks.cluster_name
      user = {
        exec = {
          apiVersion = "client.authentication.k8s.io/v1beta1"
          command    = "aws"
          args       = ["eks", "get-token", "--region", var.region, "--cluster-name", module.eks.cluster_name]
        }
      }
    }]
  })
}

output "rds_endpoint" {
  value     = module.rds.endpoint
  sensitive = true
}

output "rds_port" {
  value = module.rds.port
}

output "database_name" {
  value = "pawpal"
}

output "alb_dns_name" {
  value = module.alb.dns_name
}

output "security_group_ids" {
  value = {
    alb = module.alb_security_group.id
    eks = module.eks_security_group.id
    rds = module.rds_security_group.id
  }
}

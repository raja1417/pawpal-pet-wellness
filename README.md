# PawPal — Pet Care & Wellness

PawPal is a deliberately small, full-stack application for keeping a pet's everyday health information in one friendly place. Owners can record pets, wellness observations, vaccinations, and see reminders and practical, rule-based tips.

## Features

- Secure email registration and JWT login
- Pet profiles with photo, breed, birthday, and current weight
- Weight and activity history with an interactive trend chart
- Vaccination due dates and upcoming/overdue reminders
- Simple, transparent wellness tips for weight, activity, and vaccinations
- Responsive, keyboard-friendly React UI with useful empty/error/loading states
- Production-ready containers, Kubernetes/Helm packaging, and CI/CD examples

## Architecture

```mermaid
flowchart LR
  Browser[React web app] -->|/api| API[Express API]
  API --> Auth[JWT auth]
  API --> Tips[Pure tips engine]
  API --> Prisma[Prisma ORM]
  Prisma --> DB[(PostgreSQL)]
  subgraph Kubernetes
    Ingress --> Browser
    Ingress --> API
  end
```

## Quick start

Requirements: Docker with Compose, or Node.js 20 and PostgreSQL 15+.

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
docker compose up --build
```

Open <http://localhost:5173>. The API is at <http://localhost:3000/api> and the health check is `/api/health`. Compose applies migrations and seeds a demo account (`demo@pawpal.local` / `PawPal123!`) once. Change all example credentials outside local development.

For a host-based setup:

```bash
npm install --prefix server && npm install --prefix web
docker compose up -d postgres
npm --prefix server run prisma:migrate
npm --prefix server run seed
make dev
```

## API

All routes except health and auth require an `Authorization` header containing the login JWT.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness/readiness status |
| POST | `/api/auth/register` | Create an owner account |
| POST | `/api/auth/login` | Obtain a JWT |
| GET, POST | `/api/pets` | List or create pets |
| GET, PATCH, DELETE | `/api/pets/:id` | Read, update, or remove a pet |
| GET, POST | `/api/pets/:id/wellness` | List or add wellness entries |
| GET, POST | `/api/pets/:id/vaccinations` | List or add vaccinations |
| PATCH, DELETE | `/api/pets/:id/vaccinations/:vaccinationId` | Update or remove a vaccination |
| GET, POST | `/api/pets/:id/vet-visits` | List or schedule vet visits |
| PATCH | `/api/pets/:id/vet-visits/:visitId` | Update a vet visit |
| GET | `/api/reminders` | Upcoming and overdue care items |
| GET | `/api/tips/:petId` | Explainable wellness tips |

## Common commands

`make dev`, `make test`, `make lint`, `make build`, and `make seed` operate both packages where applicable. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.

## Deployment

- Private production images: `ghcr.io/raja1417/pawpal-api` and `ghcr.io/raja1417/pawpal-web`
- Local stack: `docker-compose.yml`
- Helm chart: `charts/pawpal` (bundled PostgreSQL in dev, external RDS in production)
- Standalone namespace/config examples: `k8s`
- CI, image publication/security scanning, chart verification, CodeQL, and gated deployment: `.github/workflows`

Images are published with `latest`, branch, commit SHA, and release semver tags. The shared build workflow scans the immutable image digest with Trivy. Keep both GHCR packages private and grant the cluster pull access through `imagePullSecrets`.

### AWS infrastructure

The `infrastructure` wrapper provisions a two-AZ VPC, EKS, managed PostgreSQL, private S3 storage, security groups, and an ALB using an immutable `raja1417/terraform-modules` revision.

Create the backend S3 bucket and DynamoDB lock table before the first run. Then initialize with an environment-specific key and apply the matching values:

```bash
terraform -chdir=infrastructure init \
  -backend-config="bucket=pawpal-terraform-state" \
  -backend-config="key=pawpal/dev/terraform.tfstate" \
  -backend-config="region=us-east-1"
terraform -chdir=infrastructure plan -var-file=dev.tfvars -out=tfplan
terraform -chdir=infrastructure apply tfplan
```

Use `prod.tfvars` and `pawpal/prod/terraform.tfstate` for production. RDS manages its master password in AWS Secrets Manager; create the `pawpal-prod-secrets` Kubernetes secret with `database-url` and `jwt-secret` keys before deployment.

### Repository configuration

Configure these repository variables:

| Variable | Example |
|---|---|
| `PAWPAL_DEV_HOST` | `pawpal-dev.example.com` |
| `PAWPAL_PROD_HOST` | `pawpal.example.com` |
| `AWS_REGION` | `us-east-1` |
| `TF_BACKEND_BUCKET` | `pawpal-terraform-state` |

Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `KUBECONFIG_DEV` in the `dev` environment. Configure the AWS credentials and `KUBECONFIG_PROD` in the `production` environment, and enable required reviewers there. Shared modules and workflows are pinned to immutable revisions; move those pins to the documented `v1.0.0` and `v1` release tags once those tags are published upstream.

The API deployment runs `npx prisma migrate deploy` in an init container before each rollout. Development creates and preserves chart-managed credentials; production always consumes the pre-created secret.

## Screenshots

> Screenshot placeholder — run the app and add a dashboard capture here.

PawPal provides informational prompts, not veterinary diagnosis. Consult a veterinarian for health concerns.

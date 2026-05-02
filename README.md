# RentFlow

A production-ready rent management platform with a tenant portal, owner dashboard, and super-admin panel.

| Service                        | Tech            | Port  |
| ------------------------------ | --------------- | ----- |
| Client (tenant & owner portal) | Next.js 14      | 3000  |
| Admin panel                    | React 18 + Vite | 3001  |
| API                            | NestJS 10       | 4000  |
| Database                       | MongoDB 7       | 27017 |

---

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for containerised run)
- A [Stripe](https://stripe.com) account (test keys are fine for development)
- A [Resend](https://resend.com) account (free tier is sufficient)

---

## Environment Setup

```bash
cp .env.example .env
```

Open `.env` and fill in every value:

```env
# MongoDB
MONGODB_URI=mongodb://db:27017/rentflow   # use this for Docker; change host for local

# JWT
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-long-random-string

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
EMAIL_PROVIDER_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Platform
SERVICE_FEE_PERCENT=2.5
ADMIN_EMAIL=admin@yourdomain.com
PLATFORM_URL=http://localhost:3000

# Exposed to Next.js browser bundle
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> For Docker Compose production, copy `.env` to `.env.production` — the `api` service reads `.env.production`.

---

## Running with Docker (recommended)

```bash
# 1. Build and start all services
docker compose up --build

# 2. Services are now available at:
#    Client  → http://localhost:3000
#    Admin   → http://localhost:3001
#    API     → http://localhost:4000
```

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

To stop and delete the database volume:

```bash
docker compose down -v
```

---

## Running Locally (without Docker)

You need MongoDB running locally. The quickest way:

```bash
# Start MongoDB via Docker (just the DB)
docker run -d -p 27017:27017 --name mongo mongo:7
```

Then update `MONGODB_URI` in `.env` to `mongodb://localhost:27017/rentflow`.

### API

```bash
cd api
npm install
npm run start:dev        # watch mode on port 4000
```

### Client (Next.js)

```bash
cd client
npm install
npm run dev              # http://localhost:3000
```

### Admin Panel (Vite)

```bash
cd admin
npm install
npm run dev              # http://localhost:3001
```

---

## Stripe Webhooks (local development)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events to the local API:

```bash
stripe listen --forward-to http://localhost:4000/api/v1/webhooks/stripe
```

Copy the `whsec_...` secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## Seeding an Admin User

There is no seed script included. Create a regular account via the client register page, then update the user directly in MongoDB:

```bash
docker exec -it rentflow-db mongosh rentflow

# In the Mongo shell:
db.users.updateOne(
  { email: "your@email.com" },
  { $addToSet: { roles: "admin" }, $set: { isVerified: true } }
)
```

Then log in at `http://localhost:3001` with those credentials.

---

## Project Structure

```
RentFlow/
├── api/                  # NestJS REST API
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── flats/
│       ├── renters/
│       ├── payments/
│       ├── wallet/
│       ├── webhooks/
│       ├── admin/
│       └── email/
├── client/               # Next.js 14 tenant & owner portal
│   └── src/
│       ├── app/
│       ├── components/
│       ├── contexts/
│       └── lib/
├── admin/                # React 18 + Vite super-admin panel
│   └── src/
│       ├── components/
│       ├── pages/
│       └── lib/
├── docker-compose.yml
└── .env.example
```

---

## CI/CD

GitHub Actions is configured in `.github/workflows/ci.yml`:

1. **Lint & Test** — runs on every push and pull request to `main`/`develop`
2. **Build & Push** — builds Docker images and pushes to Docker Hub (runs on `main` only)
3. **Deploy** — SSHes into the production server and runs `docker compose pull && docker compose up -d` (runs on `main` only)

Required GitHub secrets:

| Secret                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| `DOCKER_USERNAME`        | Docker Hub username                           |
| `DOCKER_PASSWORD`        | Docker Hub password / token                   |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (for client build arg) |
| `DEPLOY_HOST`            | Production server IP or hostname              |
| `DEPLOY_USER`            | SSH username                                  |
| `DEPLOY_SSH_KEY`         | SSH private key                               |

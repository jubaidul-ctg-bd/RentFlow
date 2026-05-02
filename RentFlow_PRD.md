# RentFlow — Product Requirements Document

**Version:** 1.0 | **Status:** Draft | **Date:** May 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Stakeholders & User Roles](#2-stakeholders--user-roles)
3. [Product Scope](#3-product-scope)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Payment & Wallet Flow](#7-payment--wallet-flow)
8. [API Design](#8-api-design-key-endpoints)
9. [Docker & Infrastructure](#9-docker--infrastructure)
10. [Security Considerations](#10-security-considerations)
11. [Key User Flows](#11-key-user-flows)
12. [Delivery Milestones](#12-delivery-milestones)
13. [Assumptions & Risks](#13-assumptions--risks)
14. [Appendix: Glossary](#appendix-glossary)

---

## 1. Executive Summary

RentFlow is a multi-sided SaaS web platform that streamlines rent collection for flat owners and simplifies monthly payments for tenants. Property owners register their flats, invite tenants via a unique code, and receive rent directly into a virtual wallet — with funds withdrawable after a small service fee. Tenants enjoy a clean, one-click payment experience with a full payment history. A centralized Super Admin panel governs platform operations, flat approvals, and reporting.

> **Vision:** Make rent collection effortless, transparent, and trustworthy for every flat owner and tenant.

> **Business Model:** A small transaction/service fee is deducted from each rent payment before crediting the owner's virtual wallet. This fee funds platform operations.

---

## 2. Stakeholders & User Roles

A single registered account may simultaneously hold Owner and Renter roles across different flats.

| Role | Description | Primary Actions |
|---|---|---|
| Guest | Unauthenticated visitor | View landing page, sign up or log in |
| Owner | Registers & manages flat(s) | Add flat, generate invite code, view wallet, withdraw funds |
| Renter | Tenant in an owner's flat | Enter invite code, pay monthly rent, view payment history |
| Super Admin | Platform operator | Approve/reject/edit flats, view all reports, manage users |

---

## 3. Product Scope

### 3.1 In Scope

- Public landing page with Owner and Renter entry points
- Unified authentication system (single account, dual role)
- Owner dashboard: flat management, invite code generation, wallet, withdrawals
- Renter dashboard: flat linking, monthly rent payment, payment history
- Stripe payment integration with virtual wallet and service fee logic
- Super Admin panel: flat approval workflow, platform-wide reports, user management
- Email notifications for key events (payment received, approval status, withdrawal)
- Fully Dockerized deployment for all services

### 3.2 Out of Scope (v1.0)

- Mobile native applications (iOS / Android)
- Multi-currency support beyond BDT/USD
- Lease/contract document management
- Maintenance request ticketing
- In-app chat between owner and renter

---

## 4. Functional Requirements

### 4.1 Landing Page

The public landing page is the primary acquisition surface. It must clearly communicate the dual-sided nature of the platform.

- Hero section with platform value proposition and a clear call-to-action
- Two prominent entry-point cards: **"I am an Owner"** and **"I am a Renter"**
- Clicking either card navigates to the respective feature overview page, then prompts sign-up or login
- Responsive design supporting desktop and mobile browsers
- Static pages: About, Pricing/Fee disclosure, Terms of Service, Privacy Policy

### 4.2 Authentication & Account Management

- Email and password registration with email verification
- OAuth login via Google *(optional for v1.0, flagged in backlog)*
- JWT-based session management with refresh tokens
- Password reset via email link
- A single user account can activate both Owner and Renter modes from the dashboard
- Profile management: name, phone number, profile photo, notification preferences

### 4.3 Owner Module

#### 4.3.1 Flat Registration

- Owner fills a flat registration form: flat name/number, address, monthly rent amount, description
- Flat is submitted with status **PENDING** and awaits Super Admin approval
- Owner receives email notification when flat is approved or rejected
- Owner can edit flat details *(triggers re-approval if rent amount is changed)*
- Owner can deactivate a flat *(stops new payments; existing history preserved)*

#### 4.3.2 Invite Code Generation

- After flat approval, owner can generate a unique alphanumeric invite code (e.g., `FLAT-A4X9Z`)
- Each code is linked to exactly one flat and one renter slot
- Owner can regenerate code *(previous code is invalidated)*
- Owner can revoke/deactivate a renter's access
- Owner sees a list of all active renters per flat

#### 4.3.3 Virtual Wallet

- Each owner has a platform-managed virtual wallet (balance in local currency)
- Wallet is credited with rent amount minus service fee when a renter pays
- Wallet dashboard shows: current balance, pending credits, transaction history
- Owner can request a withdrawal to their registered bank account or mobile banking number
- Withdrawal requests are processed within 1–3 business days

### 4.4 Renter Module

#### 4.4.1 Flat Linking

- Renter enters the invite code provided by their owner
- System validates code and links the renter to the corresponding flat
- Renter sees flat details: address, monthly rent amount, owner name

#### 4.4.2 Rent Payment

- Renter selects the month to pay for *(current month pre-selected, past-due months highlighted)*
- Payment initiated via Stripe Checkout or embedded payment form
- Accepted methods: credit/debit card; local payment methods via Stripe if available in region
- On successful payment, a receipt is generated and emailed to both renter and owner
- System prevents duplicate payment for the same month

#### 4.4.3 Payment History

- Renter views a paginated, filterable list of all past payments
- Each record shows: month, amount paid, payment date, transaction ID, status
- Downloadable PDF receipt per payment

### 4.5 Super Admin Panel

#### 4.5.1 Flat Management

- Tabbed view: Pending, Approved, Rejected, Deactivated
- Admin can Approve, Reject *(with a rejection reason)*, or Edit any flat
- Admin can permanently deactivate a flat
- Flat edit history is logged with timestamps and admin username

#### 4.5.2 User Management

- Search and filter users by name, email, role, registration date
- View user profile, linked flats, and transaction history
- Ability to suspend or ban a user account with reason

#### 4.5.3 Reporting Dashboard

- Total revenue collected (gross and net after service fee) — daily, weekly, monthly
- Number of active flats, pending approvals, total registered users
- Payment volume chart (line graph by date range)
- Failed/refunded payment log
- Withdrawal requests queue with approve/reject actions
- Export reports to CSV

#### 4.5.4 Service Fee Configuration

- Admin can configure the global service fee percentage *(default: configurable at launch)*
- Fee changes are versioned; historical payments are not retroactively affected

---

## 5. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Performance | API response time (p95) | < 300 ms under normal load |
| Availability | Uptime SLA | 99.5% monthly |
| Security | Authentication | JWT + HTTPS; PCI-DSS via Stripe |
| Security | Data at rest | MongoDB encrypted volumes |
| Scalability | Horizontal scaling | Stateless API; Docker Compose / Swarm ready |
| Accessibility | WCAG compliance | AA level for all public-facing pages |
| Localization | Language support | English (v1.0); Bengali (v1.1 backlog) |
| Audit Logging | Financial transactions | Immutable audit log; 7-year retention |

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Client / Frontend | Next.js 14 (App Router) | TypeScript, Tailwind CSS, React Query |
| Admin Panel | React 18 (Vite) | TypeScript, React Admin or custom, Recharts |
| Backend / API | NestJS (TypeScript) | REST + optional GraphQL; Passport.js for auth |
| Database | MongoDB (Mongoose) | Atlas or self-hosted; Replica Set for transactions |
| Payments | **Stripe** | Stripe Checkout + Webhooks; Connect for payouts |
| Email | SendGrid / Resend | Transactional email templates |
| File Storage | AWS S3 / Cloudflare R2 | Receipts, profile photos |
| Containerization | Docker + Docker Compose | One compose file for all services |
| CI/CD | GitHub Actions | Lint → Test → Build → Deploy pipeline |

### 6.2 System Architecture Overview

The system is composed of five Docker services orchestrated via Docker Compose:

- `rentflow-client` — Next.js frontend (port 3000)
- `rentflow-admin` — React admin panel (port 3001)
- `rentflow-api` — NestJS REST API (port 4000)
- `rentflow-db` — MongoDB instance (port 27017)
- `rentflow-nginx` — Nginx reverse proxy routing traffic to services

All services communicate over an internal Docker bridge network. Only Nginx is exposed externally. The API connects to Stripe over HTTPS for payment processing and uses Stripe Webhooks for asynchronous event handling (payment confirmation, refunds, payout status).

### 6.3 Core Data Models

#### User
```
_id, email, passwordHash, firstName, lastName, phone,
roles: ['owner' | 'renter'], isVerified, isSuspended, createdAt
```

#### Flat
```
_id, ownerId (ref User), name, address, monthlyRent, description,
status: ['pending' | 'approved' | 'rejected' | 'inactive'],
inviteCode, createdAt, approvedAt, approvedBy
```

#### RenterLink
```
_id, flatId (ref Flat), renterId (ref User), linkedAt, isActive
```

#### Payment
```
_id, flatId, renterId, ownerId, amount, serviceFee, netAmount,
month (YYYY-MM), stripePaymentIntentId,
status: ['pending' | 'paid' | 'failed' | 'refunded'], paidAt
```

#### WalletTransaction
```
_id, ownerId, type: ['credit' | 'withdrawal'],
amount, relatedPaymentId, status, createdAt
```

#### WithdrawalRequest
```
_id, ownerId, amount, bankDetails (encrypted),
status: ['pending' | 'processed' | 'rejected'], requestedAt, processedAt
```

---

## 7. Payment & Wallet Flow

### 7.1 End-to-End Payment Flow

1. Renter clicks **"Pay Rent"** for a specific month
2. Frontend calls `POST /payments/initiate` — API creates a Stripe Payment Intent
3. Renter completes payment on Stripe Checkout page
4. Stripe sends webhook event `payment_intent.succeeded` to `/webhooks/stripe`
5. API handler: marks Payment as `paid`, calculates service fee, credits owner wallet (net amount)
6. Email receipts sent to renter and owner via email service
7. Owner sees updated wallet balance in dashboard

### 7.2 Withdrawal Flow

1. Owner submits withdrawal request from wallet dashboard
2. System validates sufficient balance; creates `WithdrawalRequest` in `pending` state
3. Super Admin reviews request in Admin Panel
4. Admin approves: system initiates Stripe payout *(or marks as manually processed)*
5. Owner's wallet balance is debited; owner receives email confirmation

### 7.3 Service Fee Logic

```
Net Amount = Monthly Rent - (Monthly Rent × Fee Rate)
```

The fee rate is configurable in Admin settings. The fee goes to the platform Stripe account. The net amount is credited to the owner's virtual wallet.

---

## 8. API Design (Key Endpoints)

All endpoints prefixed with `/api/v1`. Authentication via Bearer JWT unless noted as public.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new account |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/flats` | Owner | List owner's flats |
| POST | `/flats` | Owner | Create new flat (PENDING) |
| PATCH | `/flats/:id` | Owner | Edit flat details |
| POST | `/flats/:id/invite` | Owner | Generate invite code |
| POST | `/renters/link` | Renter | Link renter to flat via code |
| POST | `/payments/initiate` | Renter | Create Stripe Payment Intent |
| GET | `/payments/history` | Renter | Renter payment history |
| GET | `/wallet` | Owner | Owner wallet balance & history |
| POST | `/wallet/withdraw` | Owner | Request withdrawal |
| POST | `/webhooks/stripe` | Public* | Stripe event handler (*signature verified) |
| GET | `/admin/flats` | Admin | All flats with filters |
| PATCH | `/admin/flats/:id` | Admin | Approve / reject / edit flat |
| GET | `/admin/reports` | Admin | Platform-wide reports |
| GET | `/admin/users` | Admin | User list with filters |

---

## 9. Docker & Infrastructure

### 9.1 Docker Compose Services

| Service | Image / Build | Notes |
|---|---|---|
| `rentflow-client` | `./client` Dockerfile | Next.js; `NODE_ENV=production`; depends_on: api |
| `rentflow-admin` | `./admin` Dockerfile | React; served via Nginx static build |
| `rentflow-api` | `./api` Dockerfile | NestJS; env vars from `.env.production` |
| `rentflow-db` | `mongo:7` | Persistent volume: `mongo_data` |
| `rentflow-nginx` | `nginx:alpine` | Custom `nginx.conf`; ports `80:80`, `443:443` |

### 9.2 Environment Variables

```dotenv
# ── API (NestJS) ───────────────────────────────────────────────
MONGODB_URI=mongodb://rentflow-db:27017/rentflow
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# ── Stripe ─────────────────────────────────────────────────────
STRIPE_PUBLISHABLE_KEY=pk_live_...        # provided by owner
STRIPE_SECRET_KEY=sk_live_...            # provided by owner
STRIPE_WEBHOOK_SECRET=whsec_...          # from Stripe dashboard

# ── Email ──────────────────────────────────────────────────────
EMAIL_PROVIDER_API_KEY=your_sendgrid_or_resend_key

# ── Platform config ────────────────────────────────────────────
SERVICE_FEE_PERCENT=2.5
ADMIN_EMAIL=admin@rentflow.com

# ── Client (Next.js) ───────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.rentflow.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # same as above, exposed to browser
```

> **Note:** `STRIPE_PUBLISHABLE_KEY` is used server-side for Stripe SDK initialization and also exposed to the Next.js client as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for Stripe.js / Elements on the frontend. `STRIPE_SECRET_KEY` must **never** be exposed to the client.

### 9.3 Sample `docker-compose.yml` Structure

```yaml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - client
      - admin
      - api

  client:
    build: ./client
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
    depends_on:
      - api

  admin:
    build: ./admin
    depends_on:
      - api

  api:
    build: ./api
    env_file: .env.production
    depends_on:
      - db

  db:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 10. Security Considerations

- All API routes protected by JWT middleware; role guards on Owner, Renter, Admin routes
- Stripe webhook endpoint validates `Stripe-Signature` header before processing
- Sensitive fields (bank account details) encrypted at rest using AES-256
- Rate limiting on auth endpoints to prevent brute force (100 req / 15 min per IP)
- MongoDB connection uses TLS; credentials never stored in code
- Input validation and sanitization on all API inputs using `class-validator` (NestJS)
- CORS restricted to known frontend origins
- HTTPS enforced via Nginx; HTTP redirects to HTTPS
- Admin panel served on a separate subdomain with IP allowlist option
- `STRIPE_SECRET_KEY` is **never** sent to the browser or logged

---

## 11. Key User Flows

### 11.1 Owner: Add & Activate a Flat

1. Owner registers/logs in and switches to Owner mode
2. Clicks **"Add New Flat"** and completes the registration form
3. Flat created with `PENDING` status; owner sees *"Awaiting Approval"* badge
4. Super Admin approves flat in Admin Panel
5. Owner receives email notification of approval
6. Owner generates invite code and shares it with their tenant

### 11.2 Renter: Pay Monthly Rent

1. Renter registers/logs in and switches to Renter mode
2. Enters invite code — system links renter to the flat
3. Renter sees their flat dashboard with current month's rent due
4. Clicks **"Pay Now"** — redirected to Stripe Checkout
5. Completes payment — redirected back to platform with success screen
6. Payment record saved; receipt emailed; owner wallet credited

### 11.3 Admin: Approve a Flat

1. Admin logs in to the Admin Panel at `admin.rentflow.com`
2. Navigates to **Flats → Pending** tab
3. Reviews flat details submitted by owner
4. Clicks **Approve** *(or Reject with reason)*
5. Owner notified via email; flat status updated

---

## 12. Delivery Milestones

| Phase | Timeline | Deliverables |
|---|---|---|
| P0 | Week 1–2 | Project scaffolding, Docker setup, MongoDB schema, auth module |
| P1 | Week 3–5 | Owner module: flat CRUD, invite code, Owner dashboard UI |
| P2 | Week 6–7 | Renter module: flat linking, Stripe payment, payment history |
| P3 | Week 8–9 | Virtual wallet, withdrawal flow, email notifications |
| P4 | Week 10–11 | Admin panel: flat approval, user management, reports dashboard |
| P5 | Week 12 | QA, security audit, performance testing, staging deployment |
| Launch | Week 13 | Production deployment, monitoring setup, go-live |

---

## 13. Assumptions & Risks

### 13.1 Assumptions

- Stripe is available and supports the target market's payment methods
- Owners have valid bank accounts or mobile banking for withdrawals
- A single server/VPS is sufficient for v1.0 load; horizontal scaling planned for v2.0
- Email deliverability is handled by the chosen transactional email provider

### 13.2 Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Stripe not available in all target markets | Medium | Research payment alternatives (SSLCommerz, bKash) for local fallback |
| Duplicate payments due to webhook retries | Low | Idempotency keys on Payment Intent creation |
| Admin approval bottleneck slows onboarding | Medium | Add auto-approval option for verified owners in v1.1 |
| MongoDB outage causes payment failures | Low | Replica Set, daily backups, fallback queuing |
| Invite code brute-force abuse | Low | Rate-limit `/renters/link`; use sufficiently long alphanumeric codes |

---

## Appendix: Glossary

| Term | Definition |
|---|---|
| **Invite Code** | Unique alphanumeric string generated by an owner to link a specific renter to their flat |
| **Virtual Wallet** | Platform-managed ledger tracking an owner's earned rent balance pending withdrawal |
| **Service Fee** | Platform commission deducted from each payment before crediting the owner's wallet |
| **Payment Intent** | Stripe object representing the lifecycle of a single payment attempt |
| **Renter Link** | Association record connecting a renter account to a specific flat |
| **Super Admin** | Platform operator with elevated privileges over the entire system |
| **STRIPE_PUBLISHABLE_KEY** | Public-facing Stripe key used in the browser for Stripe.js / Elements |
| **STRIPE_SECRET_KEY** | Server-only Stripe key used to create Payment Intents and process payouts — never exposed to the client |

---

*RentFlow PRD v1.0 — Confidential, Internal Use Only*

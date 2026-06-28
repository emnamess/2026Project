# Tunisian Artisanal E-Commerce - Architecture Document (V1)

Date: 2026-06-11
Project goal: Build a high-performance website to showcase and sell Tunisian artisanal products.

## 0) Confirmed Launch Scope

- Single-vendor store: all products belong to one seller.
- Launch payments: card and cash on delivery (processor to be decided).
- Launch languages: French (primary), Arabic, English.
- Platform: responsive web only at launch.
- Catalog size target: around 10,000 products or slightly less.
- Expected daily order volume at launch: low, but infrastructure is scalable.

## 1) Architecture Goals

- Very fast user experience on mobile and desktop.
- SEO-first product pages (important for discovery and sales).
- Scalable checkout and order management.
- Secure payments and user data handling.
- Easy to deploy, monitor, and evolve.

## 2) Recommended Tech Stack

## Frontend + Backend Framework

Recommended: **Next.js 15 (App Router) + TypeScript**

Why:
- Server-Side Rendering (SSR) and static generation for strong SEO and speed.
- React Server Components reduce client-side JavaScript for better performance.
- Built-in image optimization, caching, and routing.
- Can run frontend and API logic together cleanly (or split later if needed).

UI stack:
- Tailwind CSS for fast, consistent UI development.
- Optional component system: shadcn/ui (customizable, no heavy runtime overhead).

## Database

Recommended: **PostgreSQL (managed service)**

Why:
- Reliable relational model for products, variants, categories, orders, customers, and inventory.
- Strong indexing and query performance.
- Works very well with analytics and reporting.

Suggested additions:
- **Redis** for caching (sessions, cart snapshots, hot product data).
- **Object storage + CDN** for product images (e.g., Cloudflare R2/S3 + CDN).

## ORM / Data Layer

Recommended: **Prisma ORM**

Why:
- Type-safe queries with TypeScript.
- Good developer productivity and migration workflow.
- Easy integration with PostgreSQL.

## Payments

Recommended: **Stripe** or another card processor for card payments, plus a cash-on-delivery order flow.

Why:
- Mature APIs, webhooks, subscriptions, and fraud tooling.
- Reliable checkout workflow and documentation.

Note:
- Cash on delivery is not a payment gateway; it should be modeled as an order payment method with a pending/confirmed workflow.
- If local payment providers are mandatory for Tunisian customers, add a provider adapter layer so the checkout flow can support multiple gateways.

## Search

Phase 1: PostgreSQL full-text search for simplicity.
Phase 2 (if catalog grows): Meilisearch or Elasticsearch/OpenSearch for advanced filtering and typo tolerance.

## 3) High-Level System Architecture

- Client (browser/mobile) requests website pages.
- Next.js serves pre-rendered or server-rendered pages.
- API routes / server actions handle cart, checkout, profile, and admin operations.
- PostgreSQL stores transactional business data.
- Redis accelerates frequent reads and cart/session workflows.
- Object storage + CDN serve optimized media globally.
- Payment provider handles secure transactions via hosted/embedded checkout.
- Background jobs process emails, webhook events, stock sync, and analytics events.

## 4) Deployment Strategy (Production)

## Preferred deployment

- Host app on **Vercel** (best fit for Next.js performance and DX).
- Host PostgreSQL on **Neon/Supabase/AWS RDS** (managed DB).
- Host Redis on **Upstash/Redis Cloud**.
- Host media on **Cloudflare R2 or S3 + CloudFront/Cloudflare CDN**.

## Environment separation

- `dev`, `staging`, `production` environments.
- Separate databases and secrets per environment.
- CI/CD with pull-request previews for testing before merge.

## CI/CD pipeline

- On PR: lint + typecheck + tests + preview deploy.
- On main branch merge: production deployment with migration checks.
- Rollback strategy: keep previous deploy healthy and reversible in 1 click.

## 5) Performance-First Strategy

## Frontend performance

- Use static generation where possible (home, categories, product pages with revalidation).
- Keep JavaScript bundles small; prefer server components.
- Lazy-load non-critical UI and third-party scripts.
- Serve modern image formats (WebP/AVIF), responsive sizes, and aggressive CDN caching.
- Use font optimization and subset fonts.

## Backend performance

- Add database indexes on high-read paths:
  - product slug
  - category slug
  - product status
  - created_at for sorting
- Cache product list and category responses with short TTL and tag-based revalidation.
- Use queue workers for slow operations (email, webhooks, invoices, notifications).

## Observability

- App performance monitoring (Sentry + OpenTelemetry or Datadog/New Relic).
- Collect Core Web Vitals: LCP, INP, CLS.
- Log API latency percentiles and DB slow queries.

Performance targets:
- LCP < 2.0s on key landing/product pages (4G mobile target).
- INP < 200ms.
- API p95 latency < 300ms for critical read endpoints.

## 6) Security & Compliance Baseline

- JWT/session security with HTTP-only secure cookies.
- Rate limiting on auth, cart, and checkout endpoints.
- CSRF protection on mutating operations.
- Input validation with Zod at API boundaries.
- Secrets managed via platform secret manager.
- Daily automated backups for PostgreSQL with point-in-time recovery.

## 7) Suggested Project Structure

```
/apps
  /web                 # Next.js storefront + API routes
/packages
  /ui                  # Shared UI components
  /config              # Shared lint/ts config
  /types               # Shared domain types
/infrastructure
  docker-compose.yml   # Local dependencies (db, redis)
/docs
  ARCHITECTURE.md
```

For a smaller start, you can use a single app repository first and split into packages later.

## 8) Build Plan (Architecture Phases)

Phase 1 (MVP):
- Next.js + PostgreSQL + Prisma
- Catalog, product detail, cart, checkout
- Basic admin for products/orders
- CDN image optimization
- French/Arabic/English localization from day one
- Card payment + cash on delivery checkout flow

Phase 2:
- Redis caching
- Search improvements
- Recommendation modules
- Better analytics dashboards

Phase 3:
- Multi-currency + localized checkout
- Marketplace/vendor model (if needed)

## 9) Final Recommendation (Short Version)

If the priority is **very high performance + SEO + speed to market**, choose:

- Next.js 15 + TypeScript
- PostgreSQL + Prisma
- Redis cache
- Object storage + CDN for media
- Vercel deployment + managed DB/Redis

This gives excellent performance, clean scalability, and low operational overhead.

---

## 10) Next Steps

With the scope locked in, we will now produce:
1. Detailed feature list (MVP vs phase 2).
2. Data model schema (products, variants, orders, users).
3. UI/UX direction and design system plan.

Payment processor decision: deferred until next phase.

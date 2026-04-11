# GitHub Release Notifier

A service that monitors GitHub repositories for new releases and notifies subscribed users via email

## Quick Start

**Requirements:** Node.js 22, pnpm 10, Docker

```bash
git clone https://github.com/stasayetat/sy-github-notifier.git
cd sy-github-notifier
pnpm install
cp profiles/.env.example profiles/.env.development.local
docker compose up -d postgres redis mailpit
pnpm run db:migrate
pnpm run dev
```

| Interface  | Address                       |
|------------|-------------------------------|
| REST API   | http://localhost:3000         |
| gRPC       | localhost:50051               |
| Metrics    | http://localhost:3000/metrics |
| Mailpit UI | http://localhost:8025         |
| Prometheus | http://localhost:9090         |

## API

All endpoints require `x-api-key` header except `/confirm` and `/unsubscribe`.

Full API documentation available at **http://localhost:3000/docs** (Swagger UI).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/metrics` | Prometheus metrics |
| `POST` | `/api/subscribe` | Subscribe email to repo releases |
| `GET` | `/api/confirm/:token` | Confirm subscription |
| `GET` | `/api/unsubscribe/:token` | Unsubscribe |
| `GET` | `/api/subscriptions?email=` | List confirmed subscriptions |

## gRPC

Same operations available on port `50051`. Proto file: `src/grpc/subscription.proto`.

## Tests

```bash
pnpm run vitest:unit         # unit tests (no external services)
pnpm run vitest:integration  # integration tests (requires Docker)
```

## CI/CD

Defined in `.github/workflows/ci.yml`, runs on every push.

- **lint** — installs deps, builds TypeScript, checks for stale artifacts, runs ESLint and type-check
- **tests** (after lint) — runs unit tests with V8 coverage, integration tests, publishes test results and coverage diff to PR

On every push to `master`, the subscription form in `docs/index.html` is deployed to GitHub Pages

## Try It

You can test the subscription form at **https://stasayetat.github.io/sy-github-notifier/**

The API runs on Railway’s free plan, so it might be asleep or unavailable. If the form doesn’t respond, the service may be paused.

## Email

In production, emails are sent via [Resend](https://resend.com) SMTP. In local development, emails are captured by [Mailpit](http://localhost:8025) — no real emails are sent.

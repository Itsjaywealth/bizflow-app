# BizFlow NG Production Readiness

## Uptime

Monitor:

```text
https://bizflowng.com/health.json
```

Expected response:

```json
{
  "status": "ok",
  "service": "bizflow-ng",
  "version": "1.0.0"
}
```

Recommended monitors:

- Better Stack
- UptimeRobot
- Vercel Observability

## Analytics

The app emits lightweight browser events through `trackEvent`.

Supported destinations:

- `window.dataLayer`
- `window.gtag`
- `window.plausible`
- `REACT_APP_ANALYTICS_ENDPOINT` with `navigator.sendBeacon`

Tracked events include:

- `landing_cta_click`
- `signup_submit`
- `signup_success`
- `signup_error`
- `login_submit`
- `login_success`
- `login_error`
- `client_error`

## Error Tracking

The app captures global browser errors and unhandled promise rejections. If `window.Sentry.captureException` is available, errors are forwarded to Sentry. Otherwise they are emitted as `client_error` analytics events.

To finalize Sentry, add the Sentry browser client in the app shell or install `@sentry/react`, then initialize it with a production DSN from environment variables. Do not commit DSNs or secrets.

## Manual Production Checks

- Confirm Supabase Auth email templates link to `https://bizflowng.com/login?verified=1` and `https://bizflowng.com/reset-password`.
- Confirm RLS policies from `SUPABASE_SCHEMA.sql` are applied in production.
- Confirm private storage buckets from `SUPABASE_STORAGE_PRIVATE_BUCKETS.sql` are applied.
- Confirm public invoice links are shared only intentionally because token holders can view invoice snapshots.

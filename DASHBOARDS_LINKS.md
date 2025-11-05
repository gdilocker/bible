# 📊 DASHBOARDS & MONITORING LINKS - .com.rich

**Last Updated:** November 13, 2025
**Environment:** Production

---

## 🎯 QUICK ACCESS

### Primary Dashboards
```
Production Site:        https://comrich.com
Admin Dashboard:        https://comrich.com/admin
Payment Reconciliation: https://comrich.com/admin/payment-reconciliation
Supabase Dashboard:     [Your Supabase Project URL]
```

---

## 📊 ADMIN DASHBOARDS

### 1. Payment Reconciliation Dashboard
**URL:** `/admin/payment-reconciliation`

**Metrics Displayed:**
- ✅ Latest reconciliation run timestamp
- ✅ Unresolved discrepancies count
- ✅ Auto-resolved issues (last run)
- ✅ Transactions verified (last run)
- ✅ Historical reconciliation logs
- ✅ Detailed discrepancy viewer

**Actions Available:**
- Run manual reconciliation
- View discrepancy details
- Mark discrepancies as resolved
- Export reconciliation report

**Access:** Admin only (RLS enforced)

---

### 2. Fraud Detection Dashboard (TO BE CREATED)
**URL:** `/admin/fraud-detection` (future)

**Metrics to Display:**
```sql
-- Fraud Summary Query
SELECT
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) as total_checks,
  SUM(CASE WHEN (check_trial_abuse(email_raw, phone_raw, ip_address, device_fingerprint)->>'is_abuse')::boolean THEN 1 ELSE 0 END) as flagged,
  SUM(CASE WHEN (check_trial_abuse(email_raw, phone_raw, ip_address, device_fingerprint)->>'should_block')::boolean THEN 1 ELSE 0 END) as blocked
FROM fraud_signals
WHERE created_at > now() - interval '24 hours';
```

**Features:**
- Real-time fraud score distribution
- Recent blocks list
- False positive tracker
- Email normalization tester
- Manual block/unblock interface

---

### 3. Content Limits Dashboard (TO BE CREATED)
**URL:** `/admin/content-limits` (future)

**Metrics to Display:**
```sql
-- Users approaching limits
SELECT
  u.email,
  sp.plan_type,
  pl.max_links,
  COUNT(plinks.*) as current_links,
  pl.max_products,
  COUNT(prods.*) as current_products
FROM auth.users u
JOIN customers c ON c.user_id = u.id
JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
JOIN subscription_plans sp ON sp.id = s.plan_id
JOIN plan_limits pl ON pl.plan_type = sp.plan_type
LEFT JOIN profile_links plinks ON plinks.user_id = u.id AND plinks.deleted_at IS NULL
LEFT JOIN store_products prods ON prods.user_id = u.id AND prods.deleted_at IS NULL
GROUP BY u.email, sp.plan_type, pl.max_links, pl.max_products
HAVING COUNT(plinks.*) >= pl.max_links * 0.8 OR COUNT(prods.*) >= pl.max_products * 0.8;
```

**Features:**
- Users approaching limits
- Upgrade conversion funnel
- Limit hit frequency
- Plan distribution chart

---

## 🔍 SUPABASE BUILT-IN DASHBOARDS

### Database Performance
**URL:** Supabase Dashboard → Database → Performance

**Key Metrics:**
- Active connections
- Slow queries (>100ms)
- Database size
- Table bloat
- Index usage

**Queries to Monitor:**
```sql
-- Top 10 slowest queries
SELECT
  substring(query, 1, 100) as query_preview,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

### API Logs
**URL:** Supabase Dashboard → API → Logs

**Monitor:**
- Request rate
- Response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Top endpoints

---

### Edge Functions
**URL:** Supabase Dashboard → Edge Functions

**Monitor:**
- `payment-reconciliation` invocations
- Execution time
- Error rate
- Memory usage

**View Logs:**
```bash
supabase functions logs payment-reconciliation --tail 100
```

---

## 🚨 SENTRY (ERROR TRACKING)

### Setup Instructions

**Frontend Integration:**
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Edge Function Integration:**
```typescript
// supabase/functions/payment-reconciliation/index.ts
import * as Sentry from 'npm:@sentry/deno@8';

Sentry.init({
  dsn: Deno.env.get('SENTRY_DSN'),
  environment: 'production',
});
```

### Sentry Dashboards
**URL:** https://sentry.io/organizations/[YOUR_ORG]/

**Key Views:**
- Issues (errors grouped)
- Performance (response times)
- Releases (deploy tracking)
- Alerts (configured thresholds)

**Alerts to Configure:**
- New error first seen
- Error spike (>10 in 5min)
- Performance degradation (p95 >1s)
- Edge function failures (>5%)

---

## 📈 CUSTOM METRICS QUERIES

### SQL Queries for Manual Dashboards

#### Payment Success Rate (Last 24h)
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / NULLIF(COUNT(*), 0) as success_rate,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM orders
WHERE created_at > now() - interval '24 hours';
```

#### Fraud Detection Accuracy (Last 7 days)
```sql
WITH fraud_checks AS (
  SELECT
    fs.*,
    (check_trial_abuse(fs.email_raw, fs.phone_raw, fs.ip_address, fs.device_fingerprint)->>'is_abuse')::boolean as flagged,
    (check_trial_abuse(fs.email_raw, fs.phone_raw, fs.ip_address, fs.device_fingerprint)->>'score')::int as score
  FROM fraud_signals fs
  WHERE fs.created_at > now() - interval '7 days'
)
SELECT
  COUNT(*) as total_checks,
  COUNT(*) FILTER (WHERE flagged) as flagged_count,
  COUNT(*) FILTER (WHERE flagged) * 100.0 / NULLIF(COUNT(*), 0) as flag_rate,
  AVG(score) as avg_score,
  MAX(score) as max_score
FROM fraud_checks;
```

#### Content Limit Hits (Last 24h)
```sql
-- Note: This requires logging limit hits
-- For now, check table sizes vs limits
SELECT
  u.email,
  sp.plan_type,
  pl.max_links,
  COUNT(pl_data.*) as current_links,
  CASE WHEN COUNT(pl_data.*) >= pl.max_links THEN '⚠️ AT LIMIT' ELSE '✅ OK' END as status
FROM auth.users u
JOIN customers c ON c.user_id = u.id
JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
JOIN subscription_plans sp ON sp.id = s.plan_id
JOIN plan_limits pl ON pl.plan_type = sp.plan_type
LEFT JOIN profile_links pl_data ON pl_data.user_id = u.id AND pl_data.deleted_at IS NULL
GROUP BY u.email, sp.plan_type, pl.max_links
HAVING COUNT(pl_data.*) >= pl.max_links
ORDER BY current_links DESC;
```

#### System Health (Real-time)
```sql
-- Active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC
LIMIT 10;

-- Recent errors (from logs if captured)
SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 20;
```

---

## 📊 RECOMMENDED EXTERNAL TOOLS

### 1. **Grafana** (Advanced Metrics)
**Setup:** Connect to Supabase postgres
**Dashboards to Create:**
- Payment success rate (line chart)
- Fraud detection (bar chart)
- Response times (heatmap)
- User growth (area chart)

---

### 2. **Metabase** (Business Analytics)
**Use Cases:**
- User cohort analysis
- Revenue tracking
- Conversion funnels
- Support ticket trends

---

### 3. **PostHog** (Product Analytics)
**Features:**
- User behavior tracking
- Feature flags
- A/B testing
- Session recording

---

### 4. **Better Stack** (Uptime Monitoring)
**Monitors:**
- https://comrich.com (every 30s)
- https://comrich.com/api/health
- Edge function endpoints
- Database connectivity

**Alerts:**
- Downtime >1min
- Response time >2s
- SSL certificate expiry

---

## 🔔 ALERT CONFIGURATION

### Critical Alerts (Immediate)

**Payment System:**
```yaml
Alert: payment_success_rate_low
Condition: success_rate < 99% for 15 minutes
Query: [SQL from above]
Channels: Slack (#production-alerts), Email, SMS
```

**Fraud Detection:**
```yaml
Alert: fraud_false_positive_spike
Condition: false_positive_rate > 10%
Query: [Custom SQL]
Channels: Slack (#fraud-alerts), Email
```

**Performance:**
```yaml
Alert: high_response_time
Condition: p95 > 600ms for 10 minutes
Query: [From Supabase metrics]
Channels: Slack (#performance), Email
```

**Security:**
```yaml
Alert: unauthorized_transfer
Condition: transfer_attempts with invalid auth_code > 0
Query: [Custom SQL]
Channels: Slack (#security), Email, SMS
```

---

## 📞 DASHBOARD ACCESS

### Who Has Access?

**Super Admin:**
- All dashboards
- Supabase full access
- Sentry admin
- Database direct access

**Admin:**
- All /admin/* pages
- Supabase read-only
- Sentry viewer
- No database direct access

**Support:**
- /admin/orders (read-only)
- /admin/users (search only)
- Sentry viewer
- No database access

**Developer:**
- All technical dashboards
- Supabase full access
- Sentry full access
- Database read-write

---

## 🧪 TESTING DASHBOARDS

### Staging Environment
```
Staging Site:    https://staging.comrich.com (if applicable)
Admin:           https://staging.comrich.com/admin
Supabase:        [Staging project URL]
```

### Local Development
```
Local Site:      http://localhost:5173
Local Admin:     http://localhost:5173/admin
Supabase Local:  http://localhost:54323
```

---

## 📝 CREATING CUSTOM DASHBOARDS

### Option 1: React Admin Dashboard

```typescript
// src/pages/AdminMetrics.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    async function fetchMetrics() {
      // Payment success rate
      const { data: payments } = await supabase.rpc('get_payment_metrics');

      // Fraud stats
      const { data: fraud } = await supabase.rpc('get_fraud_metrics');

      setMetrics({ payments, fraud });
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-metrics">
      <h1>Real-Time Metrics</h1>
      {/* Render charts */}
    </div>
  );
}
```

### Option 2: SQL View for BI Tools

```sql
CREATE OR REPLACE VIEW admin_metrics_summary AS
SELECT
  -- Payment metrics
  (SELECT COUNT(*) FROM orders WHERE created_at > now() - interval '24 hours') as orders_24h,
  (SELECT COUNT(*) FILTER (WHERE status = 'completed') FROM orders WHERE created_at > now() - interval '24 hours') as successful_payments_24h,

  -- Fraud metrics
  (SELECT COUNT(*) FROM fraud_signals WHERE created_at > now() - interval '24 hours') as fraud_checks_24h,
  (SELECT COUNT(*) FROM blocked_trials WHERE blocked_at > now() - interval '24 hours') as blocks_24h,

  -- User metrics
  (SELECT COUNT(*) FROM auth.users WHERE created_at > now() - interval '24 hours') as new_users_24h,
  (SELECT COUNT(DISTINCT user_id) FROM sessions WHERE created_at > now() - interval '24 hours') as active_users_24h,

  -- System health
  pg_database_size(current_database()) as db_size,
  (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections;
```

---

## 🎯 DASHBOARD PRIORITIES

### Week 1 (MVP):
- [x] Payment Reconciliation Dashboard (✅ Done)
- [ ] Basic metrics in Supabase
- [ ] Sentry error tracking

### Week 2 (Essential):
- [ ] Fraud Detection Dashboard
- [ ] Content Limits Dashboard
- [ ] Custom alerts in Slack

### Week 3 (Nice to Have):
- [ ] Grafana integration
- [ ] Cohort analysis
- [ ] Automated reports

---

**Dashboards Documentation Maintained By:** Technical Team
**Last Review:** November 13, 2025
**Next Update:** After beta launch

**Monitor actively! 📊**

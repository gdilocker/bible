# 🚨 INCIDENT RUNBOOK - .com.rich

**Last Updated:** November 13, 2025
**Version:** 1.0

---

## 🎯 QUICK REFERENCE

### Emergency Contacts
```
Technical Lead:     [Phone]  [Email]
DevOps:             [Phone]  [Email]
Database Admin:     [Phone]  [Email]
Support Lead:       [Phone]  [Email]
```

### Critical URLs
```
Production:         https://comrich.com
Admin Dashboard:    https://comrich.com/admin
Supabase Dashboard: [URL]
Monitoring:         [Sentry/DataDog URL]
Status Page:        [URL if applicable]
```

---

## 🔥 INCIDENT TYPES & PROCEDURES

### P0: CRITICAL - Payment System Down

**Symptoms:**
- Payment success rate <90%
- Multiple webhook failures
- Users cannot complete checkout

**Immediate Actions (< 5min):**
```bash
# 1. Check edge function logs
supabase functions logs payment-reconciliation --tail

# 2. Check PayPal status
curl https://api.paypal.com/v1/notifications/webhooks

# 3. Manual reconciliation
curl -X POST https://[PROJECT].supabase.co/functions/v1/payment-reconciliation \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

**Resolution Steps:**
1. If edge function error: Redeploy function
2. If PayPal down: Enable manual payment processing
3. If database issue: Check connection poolGestor
4. Run reconciliation to catch up missed payments
5. Contact affected users

**Rollback Trigger:**
- Payment success rate <80% for >15min

---

### P0: CRITICAL - Database Corruption/Loss

**Symptoms:**
- Data inconsistencies
- Foreign key violations
- Query errors

**Immediate Actions (< 2min):**
```bash
# 1. STOP WRITES IMMEDIATELY
# Set application to read-only mode

# 2. Assess damage
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orders WHERE created_at > now() - interval '1 hour';"

# 3. If critical data loss detected:
```

**Recovery Steps:**
```bash
# OPTION 1: Point-in-time recovery (Supabase)
# Via Supabase Dashboard > Database > Backups > Restore

# OPTION 2: Manual backup restore
psql $DATABASE_URL < backup_pre_golive_20251113.sql

# 3. Verify restoration
psql $DATABASE_URL -f verify_integrity.sql

# 4. Resume writes
# Remove read-only mode

# 5. Run reconciliation
# Check for data consistency
```

**Prevention:**
- Automated backups every 6h
- Point-in-time recovery enabled
- Backup retention: 30 days

---

### P0: CRITICAL - Security Breach

**Symptoms:**
- Unauthorized access detected
- Suspicious database activity
- Mass domain transfers

**Immediate Actions (< 1min):**
```bash
# 1. ISOLATE SYSTEM
# Disable public access via Supabase dashboard

# 2. Block suspicious IPs
# Via Cloudflare or WAF

# 3. Revoke compromised credentials
psql $DATABASE_URL -c "UPDATE auth.users SET email_confirmed_at = null WHERE suspicious = true;"

# 4. Enable 2FA requirement
# Force all users to re-authenticate
```

**Investigation Steps:**
1. Check audit logs
2. Review recent domain transfers
3. Analyze fraud_signals table
4. Check for SQL injection attempts
5. Review RLS policy effectiveness

**Communication:**
- Immediately notify all users
- Prepare incident report
- Contact authorities if needed

---

### P1: HIGH - Fraud Detection False Positives

**Symptoms:**
- Legitimate users blocked
- Support tickets about access

**Immediate Actions:**
```sql
-- 1. Check recent blocks
SELECT * FROM blocked_trials
WHERE blocked_at > now() - interval '1 hour';

-- 2. Review fraud signals
SELECT
  email_normalized,
  (check_trial_abuse(email_raw, null, ip_address, device_fingerprint)->>'score')::int as score,
  check_trial_abuse(email_raw, null, ip_address, device_fingerprint)->>'reasons' as reasons
FROM fraud_signals
WHERE created_at > now() - interval '1 hour'
  AND (check_trial_abuse(email_raw, null, ip_address, device_fingerprint)->>'score')::int > 50;

-- 3. Unblock legitimate users
DELETE FROM blocked_trials WHERE id = '[ID]';
```

**Resolution:**
- Adjust fraud detection thresholds
- Review scoring algorithm
- Implement whitelist for known good users

---

### P1: HIGH - Content Limits Not Enforcing

**Symptoms:**
- Users exceeding plan limits
- Triggers not firing

**Immediate Actions:**
```sql
-- 1. Verify triggers active
SELECT tgname, tgenabled FROM pg_trigger
WHERE tgname IN ('enforce_link_limit', 'enforce_product_limit');

-- 2. Check plan limits
SELECT * FROM plan_limits;

-- 3. Manually enforce
-- Find violations
SELECT user_id, COUNT(*) as link_count
FROM profile_links
WHERE deleted_at IS NULL
GROUP BY user_id
HAVING COUNT(*) > (
  SELECT pl.max_links
  FROM subscriptions s
  JOIN subscription_plans sp ON sp.id = s.plan_id
  JOIN plan_limits pl ON pl.plan_type = sp.plan_type
  WHERE s.user_id = profile_links.user_id AND s.status = 'active'
  LIMIT 1
);
```

**Resolution:**
- Re-enable triggers if disabled
- Manual data cleanup if needed
- Notify affected users

---

### P2: MEDIUM - Performance Degradation

**Symptoms:**
- Response times >2s
- Timeouts increasing
- High database CPU

**Diagnostic Commands:**
```sql
-- 1. Check slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 2. Check active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';

-- 3. Check table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

**Resolution:**
- Analyze and optimize slow queries
- Add missing indexes
- Consider read replicas
- Review and adjust connection pooling

---

### P2: MEDIUM - Edge Function Errors

**Symptoms:**
- Edge function returning 500
- Reconciliation not running
- High error rate

**Diagnostic:**
```bash
# Check logs
supabase functions logs payment-reconciliation --tail 50

# Test manually
curl -v -X POST https://[PROJECT].supabase.co/functions/v1/payment-reconciliation \
  -H "Authorization: Bearer [ANON_KEY]"
```

**Resolution:**
```bash
# 1. Identify error from logs
# 2. Fix code locally
# 3. Test locally
supabase functions serve payment-reconciliation

# 4. Deploy fix
supabase functions deploy payment-reconciliation

# 5. Verify
curl -X POST [URL] -H "Authorization: Bearer [KEY]"
```

---

## 🔄 ROLLBACK PROCEDURES

### Full System Rollback

**Decision Criteria:**
- Multiple P0 incidents simultaneously
- Data corruption detected
- Security breach confirmed
- Payment success rate <50%

**Rollback Steps (15 minutes):**

```bash
# 1. Announce maintenance
# Post to status page

# 2. Stop application
# Set DNS to maintenance page OR
# Disable routing at CDN level

# 3. Restore database
psql $DATABASE_URL < backup_pre_golive_20251113.sql

# 4. Verify restoration
psql $DATABASE_URL -f verify_restore.sql

# 5. Remove new migrations
psql $DATABASE_URL << 'EOF'
DROP TABLE IF EXISTS payment_reconciliation_log CASCADE;
DROP TABLE IF EXISTS payment_discrepancies CASCADE;
DROP TABLE IF EXISTS fraud_signals CASCADE;
DROP TABLE IF EXISTS blocked_trials CASCADE;
DROP FUNCTION IF EXISTS check_trial_abuse CASCADE;
-- etc
EOF

# 6. Disable cron
psql $DATABASE_URL -c "SELECT cron.unschedule('payment-reconciliation-prod');"

# 7. Rollback frontend
netlify rollback
# OR restore previous build

# 8. Verify system functional
curl -I https://comrich.com
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 9. Resume service
# Update DNS / Re-enable routing

# 10. Post-mortem
# Schedule incident review
```

---

## 📊 MONITORING & ALERTS

### Critical Alerts (Immediate Response)

**Payment System:**
```
Alert: payment_success_rate < 99% for 15min
Action: Run manual reconciliation
Escalate: If <95% for 30min
```

**Fraud Detection:**
```
Alert: false_positive_rate > 10%
Action: Review recent blocks
Escalate: If >20%
```

**Performance:**
```
Alert: p95_response_time > 1s for 10min
Action: Check slow queries
Escalate: If >2s for 20min
```

**Security:**
```
Alert: unauthorized_transfer_attempt
Action: Immediate investigation
Escalate: Always
```

### Alert Channels
- Email: alerts@comrich.com
- Slack: #production-alerts
- PagerDuty: [ID if configured]
- SMS: [For P0 only]

---

## 🧪 HEALTH CHECKS

### Manual Health Check (5 minutes)

```bash
# 1. Database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# 2. Edge functions
curl https://[PROJECT].supabase.co/functions/v1/payment-reconciliation \
  -H "Authorization: Bearer [KEY]"

# 3. Frontend
curl -I https://comrich.com

# 4. Critical queries
psql $DATABASE_URL << 'EOF'
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders WHERE created_at > now() - interval '1 hour';
SELECT COUNT(*) FROM domains WHERE status = 'active';
SELECT * FROM payment_reconciliation_log ORDER BY started_at DESC LIMIT 1;
EOF

# 5. RLS verification
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;"
# Should return 0 rows (all tables have RLS)
```

### Automated Health Checks

**Every 1 minute:**
- HTTP endpoint: `/health`
- Expected: 200 OK

**Every 5 minutes:**
- Database connection: `SELECT 1`
- Edge function: Ping endpoint

**Every 30 minutes:**
- Full smoke test suite
- Critical flow validation

---

## 📝 POST-INCIDENT

### Incident Report Template

```markdown
# Incident Report: [Title]

**Date:** [Date]
**Duration:** [Start] - [End]
**Severity:** P0/P1/P2
**Impact:** [Description]

## Timeline
- [Time] - Incident detected
- [Time] - Team notified
- [Time] - Investigation started
- [Time] - Root cause identified
- [Time] - Fix deployed
- [Time] - Incident resolved
- [Time] - Monitoring resumed

## Root Cause
[Detailed explanation]

## Impact Analysis
- Users affected: [X]
- Downtime: [X] minutes
- Revenue impact: $[X]
- Data loss: [Yes/No, details]

## Resolution
[What was done]

## Prevention
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

## Lessons Learned
[Key takeaways]
```

---

## 🎓 TRAINING & DRILLS

### Quarterly Drills
- [ ] Full rollback drill (Q1)
- [ ] Payment failure simulation (Q2)
- [ ] Security breach response (Q3)
- [ ] Database corruption recovery (Q4)

### Team Training
- All engineers trained on runbook: ✅
- On-call rotation documented: ✅
- Escalation path known: ✅
- Access credentials verified: ✅

---

**Runbook Maintained By:** Technical Team
**Last Drill:** [Date]
**Next Review:** [Date]

**Keep this document updated after each incident! 🚨**

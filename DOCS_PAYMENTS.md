# Payment System Documentation

## Overview

Sistema de pagamentos Pix.Global usando **PayPal** como provedor principal.

**Conversão:** 1 PIX = 1 USD

## Table of Contents

- [Environment Variables](#environment-variables)
- [PayPal Setup](#paypal-setup)
- [Architecture](#architecture)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Environment Variables

Adicione ao arquivo `.env`:

```bash
# Payment Provider
PAYMENT_PROVIDER=paypal

# PayPal Configuration
PAYPAL_ENV=sandbox              # "sandbox" or "live"
PAYPAL_CLIENT_ID=YOUR_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_CLIENT_SECRET
PAYPAL_WEBHOOK_ID=YOUR_WEBHOOK_ID

# Public URLs
PUBLIC_BASE_URL=https://pix.global
PUBLIC_API_URL=https://your-project.supabase.co

# (Optional - Future Support)
COINBASE_COMMERCE_API_KEY=
COINBASE_COMMERCE_WEBHOOK_SECRET=
```

## PayPal Setup

### 1. Create PayPal Developer Account

1. Go to: https://developer.paypal.com/
2. Sign up or login
3. Navigate to: **Dashboard** → **My Apps & Credentials**

### 2. Create Sandbox App

1. Under **Sandbox**, click **Create App**
2. App Name: `Pix.Global Sandbox`
3. Copy:
   - **Client ID** → `PAYPAL_CLIENT_ID`
   - **Secret** → `PAYPAL_CLIENT_SECRET`

### 3. Configure Webhook

1. Go to: **Dashboard** → **My Apps & Credentials** → Your App
2. Scroll to **Webhooks** section
3. Click **Add Webhook**
4. Configure:
   - **Webhook URL**: `https://your-project.supabase.co/functions/v1/payment-webhook`
   - **Event types**: Select:
     - ✅ `PAYMENT.CAPTURE.COMPLETED` (required)
     - ✅ `PAYMENT.CAPTURE.DENIED` (optional)
     - ✅ `CHECKOUT.ORDER.APPROVED` (optional)
5. Save and copy **Webhook ID** → `PAYPAL_WEBHOOK_ID`

### 4. Sandbox Testing Accounts

PayPal provides test accounts automatically:

#### Personal Account (Buyer)
- Email: `sb-xxxxx@personal.example.com`
- Password: (shown in dashboard)
- Balance: $9,999.99 USD

#### Business Account (Seller)
- Email: `sb-xxxxx@business.example.com`
- Password: (shown in dashboard)

View/create accounts at: **Dashboard** → **Sandbox** → **Accounts**

### 5. Going Live

When ready for production:

1. Create a **Live** app (separate from sandbox)
2. Get new **Client ID** and **Secret**
3. Update webhook URL to production
4. Change `.env`:
   ```bash
   PAYPAL_ENV=live
   PAYPAL_CLIENT_ID=<live-client-id>
   PAYPAL_CLIENT_SECRET=<live-secret>
   PAYPAL_WEBHOOK_ID=<live-webhook-id>
   ```
5. Submit app for review (required for live)

## Architecture

### Flow Overview

```
User → Frontend → create-order → PayPal → User Approves
                                     ↓
                              Webhook ← PayPal
                                     ↓
                              Update Order → Create Domain
```

### 1. Create Order Flow

**Endpoint:** `POST /functions/v1/create-order`

**Request:**
```json
{
  "label": "maria",
  "type": "personal"
}
```

**Steps:**
1. ✅ Validate user authentication
2. ✅ Check domain availability
3. ✅ Calculate price (pricing.ts)
4. ✅ Create order record (status: pending)
5. ✅ Create PayPal order
6. ✅ Store provider_order_id
7. ✅ Return checkout URL

**Response:**
```json
{
  "orderId": "uuid",
  "checkout_url": "https://www.sandbox.paypal.com/checkoutnow?token=xxx",
  "amount": 25.00,
  "currency": "USD",
  "fqdn": "maria.pix.global"
}
```

### 2. Payment Webhook Flow

**Endpoint:** `POST /functions/v1/payment-webhook`

**Steps:**
1. ✅ Receive PayPal notification
2. ✅ Verify webhook signature (security)
3. ✅ Extract order ID from custom_id
4. ✅ Find order in database
5. ✅ Check idempotency (already paid?)
6. ✅ Update order status to 'paid'
7. ✅ Create domain (status: active)
8. ✅ Create audit logs

**Event Types:**
- `PAYMENT.CAPTURE.COMPLETED` → Mark as paid
- `PAYMENT.CAPTURE.DENIED` → Log denial
- Others → Ignore

### 3. Database Schema

**orders table:**
```sql
id                  uuid PRIMARY KEY
fqdn                text NOT NULL
user_id             uuid REFERENCES auth.users
price_brl           numeric NOT NULL
payment_provider    text DEFAULT 'paypal'
provider_order_id   text              -- PayPal Order ID
provider_payment_id text              -- PayPal Capture ID
status              text              -- pending, paid, failed
paid_at             timestamptz
metadata            jsonb
created_at          timestamptz
updated_at          timestamptz
```

**domains table:**
```sql
id         uuid PRIMARY KEY
fqdn       text UNIQUE NOT NULL
type       text NOT NULL           -- personal, numeric
owner_id   uuid REFERENCES auth.users
status     text DEFAULT 'active'
metadata   jsonb
created_at timestamptz
updated_at timestamptz
```

**audits table:**
```sql
id          uuid PRIMARY KEY
table_name  text NOT NULL
record_id   text NOT NULL
action      text NOT NULL          -- INSERT, UPDATE, DELETE
user_id     uuid
metadata    jsonb
created_at  timestamptz
```

## Testing

### 1. Deploy Edge Functions

```bash
# Deploy create-order
supabase functions deploy create-order

# Deploy payment-webhook
supabase functions deploy payment-webhook
```

### 2. Set Environment Variables

In Supabase Dashboard:
1. Go to **Settings** → **Edge Functions**
2. Add all required variables
3. Restart functions

### 3. Test Order Creation

```bash
# Get user token
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'

# Create order
curl -X POST 'https://your-project.supabase.co/functions/v1/create-order' \
  -H 'Authorization: Bearer USER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"label":"maria","type":"personal"}'
```

### 4. Test Payment Flow

1. Open `checkout_url` from response
2. Login with sandbox **personal** account
3. Approve payment
4. PayPal redirects to success page
5. Webhook is triggered automatically

### 5. Verify Results

```sql
-- Check order status
SELECT id, fqdn, status, paid_at
FROM orders
WHERE fqdn = 'maria.pix.global';

-- Check domain created
SELECT fqdn, owner_id, status, created_at
FROM domains
WHERE fqdn = 'maria.pix.global';

-- Check audit logs
SELECT table_name, action, metadata, created_at
FROM audits
WHERE record_id LIKE '%maria%'
ORDER BY created_at DESC;
```

## Troubleshooting

### Webhook Not Receiving Events

**Problem:** PayPal webhook not triggering

**Solutions:**
1. Check webhook URL is public and accessible
2. Verify webhook ID matches in PayPal dashboard
3. Check PayPal webhook history in dashboard
4. Test webhook manually using PayPal simulator
5. Check Edge Function logs in Supabase

### Signature Verification Failed

**Problem:** Webhook signature invalid

**Solutions:**
1. Verify `PAYPAL_WEBHOOK_ID` is correct
2. Check all webhook headers are being forwarded
3. Ensure raw body is used (not parsed JSON)
4. Check CORS headers not interfering
5. Verify PayPal credentials match environment

### Order Not Found

**Problem:** Webhook can't find order

**Solutions:**
1. Check `custom_id` is set in PayPal order
2. Verify order ID format (UUID)
3. Check database connection
4. Look for order in `orders` table manually
5. Check audit logs for order creation

### Payment Approved But Not Captured

**Problem:** User approved but no webhook

**Solutions:**
1. PayPal may delay capture (can take minutes)
2. Check PayPal dashboard for order status
3. Manually trigger webhook in PayPal simulator
4. Check webhook event subscriptions
5. Verify webhook URL is correct

### Idempotency Issues

**Problem:** Duplicate webhooks creating problems

**Solutions:**
1. Check order status before updating
2. Use `provider_payment_id` as dedup key
3. Log webhook event IDs
4. Return 200 OK for already processed
5. Use database transactions

## Monitoring

### Important Logs

Check these in Supabase Edge Functions logs:

```
✅ Good:
- "Webhook verified, event type: PAYMENT.CAPTURE.COMPLETED"
- "Processing payment for order: uuid"
- "Domain created successfully"

❌ Bad:
- "Webhook verification failed"
- "Order not found"
- "Error creating domain"
- "PayPal OAuth failed"
```

### Metrics to Track

1. **Order Creation Rate**: Orders created per day
2. **Payment Success Rate**: Paid orders / Total orders
3. **Webhook Failures**: Failed webhook verifications
4. **Average Payment Time**: Time from order to paid
5. **Domain Provisioning**: Domains created after payment

### Queries

```sql
-- Today's orders
SELECT COUNT(*) FROM orders
WHERE created_at >= CURRENT_DATE;

-- Success rate (last 7 days)
SELECT
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status;

-- Average payment time
SELECT AVG(paid_at - created_at) as avg_time
FROM orders
WHERE status = 'paid';

-- Webhook failures
SELECT metadata->>'eventType' as event, COUNT(*)
FROM audits
WHERE table_name = 'orders'
  AND action = 'UPDATE'
  AND metadata->>'newStatus' = 'failed'
GROUP BY event;
```

## Security Checklist

- ✅ Webhook signature verification enabled
- ✅ HTTPS only for all endpoints
- ✅ API credentials stored in env vars (not code)
- ✅ Service role key used for admin operations
- ✅ User authentication required for order creation
- ✅ Domain availability checked before payment
- ✅ Idempotency implemented for webhooks
- ✅ Audit logs for all critical operations
- ✅ Rate limiting on order creation
- ✅ Input validation on all endpoints

## Support

For issues:
1. Check Supabase Edge Functions logs
2. Check PayPal webhook history in dashboard
3. Verify all environment variables
4. Test with sandbox accounts first
5. Contact PayPal support for API issues

## Future: Coinbase Commerce

Interface prepared for crypto payments:

```typescript
interface CoinbaseProvider implements PaymentsProvider {
  createCheckout(input) {
    // Create charge
    // Return hosted_url
  }

  verifyWebhook(req, rawBody) {
    // Verify HMAC signature
    // Process charge:confirmed event
  }
}
```

Event: `charge:confirmed` → Mark order as paid

Not implemented in this version.

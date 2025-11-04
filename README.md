# .com.rich - MVP Platform

Complete platform for registering and managing .email domains with integrated email hosting, DNS management, and billing.

## Architecture Overview

This MVP implements a full-stack solution with:

- **Frontend**: React + Vite + TypeScript
- **Database**: Supabase PostgreSQL with RLS
- **Email Provider**: Titan Email (White-Label Reseller)
- **Domain Registrar**: Dynadot API integration
- **Edge Functions**: Serverless API endpoints for domains, DNS, email, and webhooks
- **Billing**: PayPal integration with automatic provisioning

## Project Structure

```
/src
├── server/
│   ├── adapters/              # External service integrations (legacy)
│   │   ├── namecheap/         # Domain registration API (legacy)
│   │   ├── cloudflare/        # DNS management API (legacy)
│   │   └── emailProvider/     # Email provisioning (legacy)
│   └── edge/                  # Serverless functions
│       ├── domains/           # Domain availability & registration
│       ├── dns/               # DNS record management
│       ├── email/             # Mailbox & alias management
│       └── webhooks/          # Payment webhooks + workflows
├── lib/
│   ├── schema/migrations/     # SQL migrations
│   └── services/
│       └── sdk.ts             # Frontend API client
├── components/                # Reusable UI components
│   ├── ProvisioningStepper.tsx
│   ├── DNSStatusCard.tsx
│   ├── MailboxTable.tsx
│   ├── AliasTable.tsx
│   └── DomainCard.tsx
└── app/(dashboard)/           # Dashboard pages
    ├── wizard/                # Domain search & purchase wizard
    ├── domains/               # Domain management
    ├── emails/                # Mailbox & alias management
    └── billing/               # Invoices & payment methods
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

```env
# Namecheap API (for domain registration)
NAMECHEAP_API_USER=your_username
NAMECHEAP_API_KEY=your_api_key
NAMECHEAP_CLIENT_IP=your_whitelisted_ip

# Cloudflare API (for DNS management)
CF_API_TOKEN=your_cloudflare_token
CF_ACCOUNT_ID=your_account_id
CF_ZONE_ID=your_zone_id

# Titan Email API (White-Label Email Provider)
TITAN_API_KEY=your_titan_api_key
TITAN_API_BASE_URL=https://bll.titan.email
TITAN_PARTNER_ID=your_partner_id

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Public URLs
PUBLIC_API_BASE=https://api.com.rich
APP_BASE_URL=https://com.rich

# Supabase (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Setup

Apply the migration to your Supabase database:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Copy SQL from src/lib/schema/migrations/001_init.sql
# and run it in Supabase SQL Editor
```

This creates all tables with Row Level Security (RLS) enabled:
- `customers` - User accounts
- `orders` - Purchase orders
- `domains` - Registered domains
- `mail_domains` - Email domain configs
- `mailboxes` - Email accounts
- `aliases` - Email forwards
- `dns_records` - DNS entries
- `invoices` - Billing records
- `audit_logs` - Activity tracking

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## MVP Workflow

### User Journey

1. **Search Domain** (`/wizard`)
   - User enters desired `.email` domain
   - Check availability via Namecheap API
   - Display suggestions if unavailable

2. **Purchase & Provision** (PayPal payment flow)
   - Click "Buy Now" with PayPal
   - Complete PayPal payment
   - Triggers fulfillment workflow:
     - Register domain with Dynadot
     - Create email domain in Titan
     - Configure DNS automatically
     - Create initial mailbox via Titan API

3. **Manage Domains** (`/domains`)
   - View all registered domains
   - Check expiration dates
   - Navigate to domain details

4. **Manage Email** (`/emails`)
   - Create/delete mailboxes
   - Set quotas
   - Configure aliases and forwards

5. **Billing** (`/billing`)
   - View invoices
   - Download receipts
   - Update payment method

## Replacing Mock Providers

### Production Namecheap Integration

Edit `src/server/adapters/namecheap/index.ts`:

```typescript
export function createNamecheap(): Namecheap {
  const apiUser = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;

  return {
    async checkAvailability(fqdn: string) {
      const response = await fetch(
        `https://api.namecheap.com/xml.response?ApiUser=${apiUser}&ApiKey=${apiKey}&Command=namecheap.domains.check&DomainList=${fqdn}`
      );
      // Parse XML response
      return { available: true };
    },
    // ... implement registerDomain
  };
}
```

### Production Cloudflare Integration

Edit `src/server/adapters/cloudflare/index.ts`:

```typescript
export function createCloudflare(): CloudflareDNS {
  const token = process.env.CF_API_TOKEN;
  const zoneId = process.env.CF_ZONE_ID;

  return {
    async applyDefaults(params) {
      await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'MX',
          name: params.fqdn,
          content: params.mxHost,
          priority: 10
        })
      });
      // ... add SPF, DKIM, DMARC records
      return { ok: true };
    }
  };
}
```

### Production Titan Email Integration

The project is already configured to use Titan Email. See `TITAN_EMAIL_SETUP.md` for detailed setup instructions.

Key features:
- White-label reseller program
- Embedded control panel via iframe
- Automatic provisioning after PayPal payment
- Partner pricing (~$0.59 - $2/mailbox/month)
- Full API for mailbox, alias, and quota management

Edge Functions:
- `titan-provision` - Automatic provisioning after payment
- `email` - API for manual mailbox/alias management

## Testing Checklist

- [ ] Fluxo mock completo no wizard
  - [ ] Search domain availability
  - [ ] Mock purchase triggers workflow
  - [ ] All provisioning steps complete successfully
- [ ] DNS checker exibindo OK (mock)
  - [ ] MX record shows correctly
  - [ ] SPF record configured
  - [ ] DKIM record present
  - [ ] DMARC policy applied
- [ ] Criação de mailbox funcionando (mock)
  - [ ] Create mailbox with custom name
  - [ ] Set quota correctly
  - [ ] Password accepted
- [ ] Código organizado por pastas conforme descrito
  - [ ] Adapters separated by service
  - [ ] Edge functions properly structured
  - [ ] UI components reusable

## Next Steps (Post-MVP)

### Phase 1: Production Readiness
- [ ] Replace all mock adapters with real API integrations
- [ ] Implement real Stripe payment flow
- [ ] Add webhook signature verification
- [ ] Set up proper authentication (Supabase Auth)
- [ ] Implement admin dashboard with user management

### Phase 2: Reliability & Security
- [ ] High availability setup (multi-node Mailcow)
- [ ] Automated backups (maildir + database)
- [ ] DMARC report processing and assisted mode
- [ ] Rate limiting and anti-spam measures
- [ ] IP reputation monitoring
- [ ] 2FA for user accounts

### Phase 3: Advanced Features
- [ ] Catch-all addresses
- [ ] Domain aliases
- [ ] BIMI (logo in inbox) for premium users
- [ ] DNS zone templates
- [ ] Marketplace templates (site + DNS + email)
- [ ] Auto-renewal with billing alerts

## Support & Documentation

For production deployment:

1. **Infrastructure Requirements**:
   - VPS for Mailcow (min 4GB RAM)
   - VPS for PowerDNS (optional, can use Cloudflare initially)
   - Redis for job queues
   - Supabase database (already provisioned)

2. **Monitoring**:
   - Set up Prometheus + Grafana for metrics
   - Configure log aggregation (Loki/ELK)
   - Monitor email delivery rates
   - Track queue health

3. **Security**:
   - Force TLS for all email connections
   - Implement MTA-STS + TLSRPT
   - Regular security audits
   - Penetration testing before launch

## Contributing

This is an MVP scaffold. To contribute:

1. Choose an adapter to implement
2. Follow the interface contracts in `/src/server/adapters/`
3. Add error handling and logging
4. Update this README with your changes

## License

Proprietary - All rights reserved

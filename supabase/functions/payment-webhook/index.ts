/**
 * Edge Function: Webhook de Pagamentos (PayPal)
 *
 * POST /payment-webhook
 * Processa notificações do PayPal e atualiza status dos pedidos
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Client-Info, Apikey, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo',
};

async function getPayPalAccessToken(clientId: string, clientSecret: string, env: string): Promise<string> {
  const baseUrl = env === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const auth = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function verifyPayPalWebhook(
  req: Request,
  rawBody: string,
  webhookId: string,
  accessToken: string,
  env: string
): Promise<{ valid: boolean; event?: any }> {
  const baseUrl = env === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const headers = {
    'paypal-transmission-id': req.headers.get('paypal-transmission-id'),
    'paypal-transmission-time': req.headers.get('paypal-transmission-time'),
    'paypal-transmission-sig': req.headers.get('paypal-transmission-sig'),
    'paypal-cert-url': req.headers.get('paypal-cert-url'),
    'paypal-auth-algo': req.headers.get('paypal-auth-algo'),
  };

  if (
    !headers['paypal-transmission-id'] ||
    !headers['paypal-transmission-time'] ||
    !headers['paypal-transmission-sig'] ||
    !headers['paypal-cert-url'] ||
    !headers['paypal-auth-algo']
  ) {
    console.error('Missing PayPal webhook headers');
    return { valid: false };
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    console.error('Failed to parse webhook body:', e);
    return { valid: false };
  }

  const verificationPayload = {
    transmission_id: headers['paypal-transmission-id'],
    transmission_time: headers['paypal-transmission-time'],
    cert_url: headers['paypal-cert-url'],
    auth_algo: headers['paypal-auth-algo'],
    transmission_sig: headers['paypal-transmission-sig'],
    webhook_id: webhookId,
    webhook_event: event,
  };

  const response = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationPayload),
    }
  );

  if (!response.ok) {
    console.error('PayPal verification request failed:', response.status);
    return { valid: false };
  }

  const result = await response.json();

  if (result.verification_status !== 'SUCCESS') {
    console.error('PayPal webhook signature invalid');
    return { valid: false };
  }

  return { valid: true, event };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalWebhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    const paypalEnv = Deno.env.get('PAYPAL_ENV') || 'sandbox';

    if (!paypalClientId || !paypalClientSecret || !paypalWebhookId) {
      console.error('PayPal not configured');
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.text();

    console.log('Webhook received, verifying signature...');

    const accessToken = await getPayPalAccessToken(paypalClientId, paypalClientSecret, paypalEnv);

    const verification = await verifyPayPalWebhook(
      req,
      rawBody,
      paypalWebhookId,
      accessToken,
      paypalEnv
    );

    if (!verification.valid) {
      console.error('Webhook verification failed');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = verification.event;
    const eventType = event.event_type;

    console.log('Webhook verified, event type:', eventType);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      let orderId = resource.custom_id;

      if (!orderId && resource.supplementary_data?.related_ids?.order_id) {
        const paypalOrderId = resource.supplementary_data.related_ids.order_id;

        const baseUrl = paypalEnv === 'sandbox'
          ? 'https://api-m.sandbox.paypal.com'
          : 'https://api-m.paypal.com';

        try {
          const orderResponse = await fetch(
            `${baseUrl}/v2/checkout/orders/${paypalOrderId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            orderId = orderData.purchase_units?.[0]?.custom_id;
          }
        } catch (e) {
          console.error('Failed to fetch PayPal order:', e);
        }
      }

      if (!orderId) {
        console.error('Order ID not found in webhook');
        return new Response(
          JSON.stringify({ error: 'Order ID not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Processing payment for order:', orderId);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError || !order) {
        console.error('Order not found:', orderId);
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (order.status === 'paid') {
        console.log('Order already paid, skipping (idempotency)');
        return new Response(
          JSON.stringify({ status: 'success', message: 'Already processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Updating order status to paid');

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          provider_payment_id: resource.id,
          paid_at: new Date().toISOString(),
          metadata: {
            ...order.metadata,
            captureId: resource.id,
            paypalOrderId: resource.supplementary_data?.related_ids?.order_id,
            amount: resource.amount.value,
            currency: resource.amount.currency_code,
            lastWebhookAt: new Date().toISOString(),
          },
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase.from('audits').insert({
        table_name: 'orders',
        record_id: orderId,
        action: 'UPDATE',
        user_id: order.user_id,
        metadata: {
          previousStatus: order.status,
          newStatus: 'paid',
          captureId: resource.id,
          eventType,
          amount: resource.amount.value,
          currency: resource.amount.currency_code,
        },
      });

      console.log('Creating domain:', order.fqdn);

      const { error: domainError } = await supabase.from('domains').insert({
        fqdn: order.fqdn,
        type: order.metadata?.type || 'personal',
        owner_id: order.user_id,
        status: 'active',
        metadata: {
          orderId: order.id,
          purchasedAt: new Date().toISOString(),
          pricePaid: order.price_brl,
          currency: 'USD',
        },
      });

      if (domainError) {
        console.error('Error creating domain:', domainError);
        await supabase.from('audits').insert({
          table_name: 'domains',
          record_id: order.fqdn,
          action: 'INSERT_FAILED',
          user_id: order.user_id,
          metadata: {
            error: domainError.message,
            orderId: order.id,
          },
        });
      } else {
        console.log('Domain created successfully');
        await supabase.from('audits').insert({
          table_name: 'domains',
          record_id: order.fqdn,
          action: 'INSERT',
          user_id: order.user_id,
          metadata: {
            orderId: order.id,
            source: 'payment_webhook',
          },
        });
      }

      return new Response(
        JSON.stringify({
          status: 'success',
          orderId,
          orderStatus: 'paid',
          captureId: resource.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      console.log('Payment denied event received');

      return new Response(
        JSON.stringify({ status: 'success', message: 'Payment denied event logged' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('Unhandled event type:', eventType);

      return new Response(
        JSON.stringify({ status: 'success', message: 'Event type ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

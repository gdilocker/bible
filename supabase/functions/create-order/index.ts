/**
 * Edge Function: Criar Pedido
 *
 * POST /create-order
 * Body: { label: string, type: 'personal' | 'numeric' }
 * Response: { orderId: string, checkout_url: string, amount: number, currency: string }
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Pricing logic (1 PIX = 1 USD)
const PERSONAL_BASE_PRICE = 25;
const NUMERIC_LENGTH_PRICES: Record<number, number> = {
  1: 1_000_000,
  2: 100_000,
  3: 10_000,
  4: 1_000,
  5: 100,
  6: 10,
  7: 5,
};

function isRepeated(num: string): boolean {
  if (num.length < 2) return false;
  return num.split('').every(char => char === num[0]);
}

function isSequential(num: string): boolean {
  if (num.length < 2) return false;
  for (let i = 1; i < num.length; i++) {
    if (parseInt(num[i]) !== parseInt(num[i - 1]) + 1) {
      const isDesc = num.split('').every((char, idx) =>
        idx === 0 || parseInt(char) === parseInt(num[idx - 1]) - 1
      );
      return isDesc;
    }
  }
  return true;
}

function isCapicua(num: string): boolean {
  if (num.length < 2) return false;
  return num === num.split('').reverse().join('');
}

function calculatePrice(label: string, type: 'personal' | 'numeric'): number {
  if (type === 'personal') return PERSONAL_BASE_PRICE;

  const length = label.length;
  let basePrice = NUMERIC_LENGTH_PRICES[length] || 1;
  let multiplier = 1;

  if (isCapicua(label)) multiplier = 4;
  else if (isRepeated(label)) multiplier = 3;
  else if (isSequential(label)) multiplier = 2;

  return basePrice * multiplier;
}

// PayPal Integration
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

async function createPayPalOrder(
  accessToken: string,
  env: string,
  orderId: string,
  label: string,
  type: string,
  amount: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ checkout_url: string; provider_ref: string }> {
  const baseUrl = env === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        custom_id: orderId,
        description: `Domain ${label}.pix.global (${type})`,
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'Pix.Global',
      landing_page: 'BILLING',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: successUrl,
      cancel_url: cancelUrl,
    },
  };

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal create order error:', error);
    throw new Error(`PayPal order creation failed: ${response.status}`);
  }

  const order = await response.json();
  const approveLink = order.links.find((link: any) => link.rel === 'approve');

  if (!approveLink) {
    throw new Error('PayPal approve link not found');
  }

  return {
    checkout_url: approveLink.href,
    provider_ref: order.id,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { label, type } = await req.json();

    if (!label || !type) {
      return new Response(
        JSON.stringify({ error: 'label e type são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type !== 'personal' && type !== 'numeric') {
      return new Response(
        JSON.stringify({ error: 'type deve ser personal ou numeric' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^[a-z0-9]{1,64}$/.test(label)) {
      return new Response(
        JSON.stringify({ error: 'Formato de label inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fqdn = `${label}.pix.global`;

    const { data: existingDomain } = await supabase
      .from('domains')
      .select('id')
      .eq('fqdn', fqdn)
      .maybeSingle();

    if (existingDomain) {
      return new Response(
        JSON.stringify({ error: 'Domínio já está registrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('fqdn', fqdn)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingOrder) {
      return new Response(
        JSON.stringify({ error: 'Você já tem um pedido pendente para este domínio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amountPix = calculatePrice(label, type);
    const amountUsd = amountPix; // 1 PIX = 1 USD

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        fqdn,
        user_id: user.id,
        price_brl: amountPix,
        payment_provider: 'paypal',
        status: 'pending',
        metadata: {
          label,
          type,
          amountUsd,
          currency: 'USD',
          calculatedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pedido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase.from('audits').insert({
      table_name: 'orders',
      record_id: order.id,
      action: 'INSERT',
      user_id: user.id,
      metadata: { fqdn, amountUsd, type, label },
    });

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnv = Deno.env.get('PAYPAL_ENV') || 'sandbox';

    if (!paypalClientId || !paypalClientSecret) {
      return new Response(
        JSON.stringify({ error: 'Sistema de pagamento não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = await getPayPalAccessToken(paypalClientId, paypalClientSecret, paypalEnv);

    const baseUrl = Deno.env.get('PUBLIC_BASE_URL') || 'http://localhost:5173';
    const successUrl = `${baseUrl}/success?order_id=${order.id}`;
    const cancelUrl = `${baseUrl}/registrar?canceled=1`;

    const paypalOrder = await createPayPalOrder(
      accessToken,
      paypalEnv,
      order.id,
      label,
      type,
      amountUsd,
      successUrl,
      cancelUrl
    );

    await supabase
      .from('orders')
      .update({ provider_order_id: paypalOrder.provider_ref })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        checkout_url: paypalOrder.checkout_url,
        amount: amountUsd,
        currency: 'USD',
        fqdn,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

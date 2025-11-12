import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CartItem {
  name: string;
  type: 'credit' | 'quick_access';
  price: number;
  pattern?: string;
}

interface CreateOrderRequest {
  items: CartItem[];
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse body
    const body: CreateOrderRequest = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Carrinho vazio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each item
    const validatedItems: Array<CartItem & { domain_type: string }> = [];
    const domainNames = items.map(item => item.name);

    // Check availability (all at once)
    const { data: existingDomains, error: checkError } = await supabase
      .from('domains')
      .select('domain_name')
      .in('domain_name', domainNames);

    if (checkError) throw checkError;

    const existingSet = new Set((existingDomains || []).map(d => d.domain_name));

    for (const item of items) {
      // Check if available
      if (existingSet.has(item.name)) {
        return new Response(
          JSON.stringify({ error: `Domínio ${item.name} não está mais disponível` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate regex
      let valid = false;
      if (item.type === 'credit') {
        valid = /^[0-9]{1,63}$/.test(item.name);
      } else if (item.type === 'quick_access') {
        valid = /^[a-hj-km-np-z2-9]{2,12}$/.test(item.name);
      }

      if (!valid) {
        return new Response(
          JSON.stringify({ error: `Domínio ${item.name} é inválido` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      validatedItems.push({
        ...item,
        domain_type: item.type
      });
    }

    // Calculate total
    const totalAmount = validatedItems.reduce((sum, item) => sum + item.price, 0);

    // Create PayPal order
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalSecret = Deno.env.get('PAYPAL_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

    if (!paypalClientId || !paypalSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create order
    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: `Registro de ${items.length} domínio(s) .pix.global`,
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2)
              }
            }
          },
          items: validatedItems.map(item => ({
            name: `${item.name}.pix.global`,
            description: item.type === 'credit' ? 'Crédito Digital' : 'Acesso Rápido',
            quantity: '1',
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toFixed(2)
            }
          }))
        }],
        application_context: {
          return_url: `${Deno.env.get('PUBLIC_URL')}/sucesso?type=cart`,
          cancel_url: `${Deno.env.get('PUBLIC_URL')}/falha?type=cart`,
          brand_name: 'Pix.Global',
          user_action: 'PAY_NOW'
        }
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal order error:', orderData);
      throw new Error('Erro ao criar pedido no PayPal');
    }

    // Save pending order
    const { error: orderError } = await supabase
      .from('pending_orders')
      .insert({
        user_id: user.id,
        paypal_order_id: orderData.id,
        total_amount: totalAmount,
        items: validatedItems,
        status: 'pending',
        order_type: 'cart'
      });

    if (orderError) {
      console.error('Error saving pending order:', orderError);
      throw orderError;
    }

    // Get approval URL
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;

    return new Response(
      JSON.stringify({
        order_id: orderData.id,
        approval_url: approvalUrl,
        total: totalAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating cart order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

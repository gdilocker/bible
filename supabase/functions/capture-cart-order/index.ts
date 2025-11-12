import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse body
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pending order
    const { data: pendingOrder, error: orderError } = await supabase
      .from('pending_orders')
      .select('*')
      .eq('paypal_order_id', order_id)
      .maybeSingle();

    if (orderError || !pendingOrder) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pendingOrder.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Pedido já foi processado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Capture PayPal order
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalSecret = Deno.env.get('PAYPAL_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

    // Get access token
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

    // Capture order
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      console.error('PayPal capture error:', captureData);
      throw new Error('Falha ao capturar pagamento');
    }

    // ATOMIC TRANSACTION: Register all domains
    const items = pendingOrder.items as Array<{
      name: string;
      type: string;
      price: number;
      pattern?: string;
    }>;

    const domainsToInsert = items.map(item => ({
      user_id: pendingOrder.user_id,
      domain_name: item.name,
      domain_type: item.type,
      purchase_price_usd: item.price,
      pattern_type: item.pattern || null,
      status: 'active',
      for_sale: false,
      transferable_from: new Date().toISOString() // Immediate transfer allowed
    }));

    // Insert all domains in one transaction
    const { data: insertedDomains, error: insertError } = await supabase
      .from('domains')
      .insert(domainsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting domains:', insertError);

      // Mark as failed
      await supabase
        .from('pending_orders')
        .update({ status: 'failed', error_message: insertError.message })
        .eq('id', pendingOrder.id);

      throw new Error('Erro ao registrar domínios: ' + insertError.message);
    }

    // Update pending order
    await supabase
      .from('pending_orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        paypal_capture_id: captureData.id
      })
      .eq('id', pendingOrder.id);

    // Create order record
    await supabase
      .from('orders')
      .insert({
        user_id: pendingOrder.user_id,
        order_type: 'cart',
        total_amount: pendingOrder.total_amount,
        payment_method: 'paypal',
        payment_status: 'completed',
        items: items,
        paypal_order_id: order_id,
        paypal_capture_id: captureData.id
      });

    // TODO: Send confirmation email
    // TODO: Register commission if affiliate

    return new Response(
      JSON.stringify({
        success: true,
        domains: insertedDomains.map(d => `${d.domain_name}.pix.global`),
        total: pendingOrder.total_amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error capturing cart order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

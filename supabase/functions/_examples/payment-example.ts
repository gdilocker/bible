/**
 * EXEMPLO: Edge Function com Pagamentos (Mercado Pago)
 *
 * Demonstra como processar pagamentos usando as variáveis de ambiente.
 */

import { serverEnv } from '../../../src/lib/env.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Verificar configuração de pagamento
    const provider = serverEnv.payment.provider();
    const apiKey = serverEnv.payment.apiKey();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const body = await req.json();
    const { amount, description } = body;

    // Exemplo com Mercado Pago
    if (provider === 'mercadopago') {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description,
          payment_method_id: 'pix',
          payer: {
            email: body.email,
          },
        }),
      });

      const data = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          payment: data,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Outros provedores podem ser adicionados aqui
    return new Response(
      JSON.stringify({ error: `Provider ${provider} not implemented` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * PayPal Payment Provider Implementation
 *
 * Documentação: https://developer.paypal.com/docs/api/orders/v2/
 * Webhooks: https://developer.paypal.com/docs/api-basics/notifications/webhooks/
 */

import type {
  PaymentsProvider,
  CreateCheckoutInput,
  CreateCheckoutOutput,
  WebhookVerificationResult,
} from './provider';

export class PayPalProvider implements PaymentsProvider {
  private clientId: string;
  private clientSecret: string;
  private webhookId: string;
  private baseUrl: string;
  private env: 'sandbox' | 'live';

  constructor(
    clientId: string,
    clientSecret: string,
    webhookId: string,
    env: 'sandbox' | 'live' = 'sandbox'
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.webhookId = webhookId;
    this.env = env;
    this.baseUrl =
      env === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
  }

  /**
   * Obtém access token via OAuth2
   */
  private async getAccessToken(): Promise<string> {
    const auth = btoa(`${this.clientId}:${this.clientSecret}`);

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal OAuth error:', error);
      throw new Error(`Failed to get PayPal access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Cria uma Order no PayPal (Checkout)
   */
  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutOutput> {
    const accessToken = await this.getAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: input.orderId,
          description: `Domain ${input.label}.pix.global (${input.type})`,
          amount: {
            currency_code: input.currency,
            value: input.amountPix.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Pix.Global',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: input.successUrl,
        cancel_url: input.cancelUrl,
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal create order error:', error);
      throw new Error(`Failed to create PayPal order: ${response.status}`);
    }

    const order = await response.json();

    // Encontrar o link de aprovação
    const approveLink = order.links.find((link: any) => link.rel === 'approve');

    if (!approveLink) {
      throw new Error('PayPal order created but approve link not found');
    }

    return {
      checkout_url: approveLink.href,
      provider_ref: order.id,
    };
  }

  /**
   * Verifica assinatura do webhook e processa evento
   */
  async verifyWebhook(
    req: any,
    rawBody: string | Buffer
  ): Promise<WebhookVerificationResult> {
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    // Headers necessários para verificação
    const headers = {
      'paypal-transmission-id': req.headers.get('paypal-transmission-id'),
      'paypal-transmission-time': req.headers.get('paypal-transmission-time'),
      'paypal-transmission-sig': req.headers.get('paypal-transmission-sig'),
      'paypal-cert-url': req.headers.get('paypal-cert-url'),
      'paypal-auth-algo': req.headers.get('paypal-auth-algo'),
    };

    // Validar que temos todos os headers
    if (
      !headers['paypal-transmission-id'] ||
      !headers['paypal-transmission-time'] ||
      !headers['paypal-transmission-sig'] ||
      !headers['paypal-cert-url'] ||
      !headers['paypal-auth-algo']
    ) {
      console.error('Missing PayPal webhook headers');
      return { ok: false };
    }

    // Parse do body
    let event;
    try {
      event = JSON.parse(bodyString);
    } catch (e) {
      console.error('Failed to parse webhook body:', e);
      return { ok: false };
    }

    // Verificar assinatura usando o endpoint do PayPal
    const accessToken = await this.getAccessToken();

    const verificationPayload = {
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: this.webhookId,
      webhook_event: event,
    };

    const verifyResponse = await fetch(
      `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationPayload),
      }
    );

    if (!verifyResponse.ok) {
      const error = await verifyResponse.text();
      console.error('PayPal webhook verification failed:', error);
      return { ok: false };
    }

    const verifyResult = await verifyResponse.json();

    if (verifyResult.verification_status !== 'SUCCESS') {
      console.error('PayPal webhook signature invalid');
      return { ok: false };
    }

    // Assinatura válida, processar evento
    const eventType = event.event_type;

    // Processar apenas eventos de captura de pagamento
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;

      // Extrair order_id do custom_id ou supplementary_data
      let orderId = resource.custom_id;

      // Se não tiver custom_id, tentar pegar do supplementary_data
      if (!orderId && resource.supplementary_data?.related_ids?.order_id) {
        const paypalOrderId = resource.supplementary_data.related_ids.order_id;

        // Buscar a ordem para pegar o custom_id
        try {
          const orderResponse = await fetch(
            `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            orderId = orderData.purchase_units?.[0]?.custom_id;
          }
        } catch (e) {
          console.error('Failed to fetch order details:', e);
        }
      }

      return {
        ok: true,
        provider_ref: resource.supplementary_data?.related_ids?.order_id || resource.id,
        event_type: eventType,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: 'COMPLETED',
        metadata: {
          orderId,
          captureId: resource.id,
          paypalOrderId: resource.supplementary_data?.related_ids?.order_id,
        },
      };
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      const resource = event.resource;

      return {
        ok: true,
        provider_ref: resource.supplementary_data?.related_ids?.order_id || resource.id,
        event_type: eventType,
        status: 'FAILED',
      };
    }

    // Outros eventos - apenas logar
    console.log('PayPal webhook event ignored:', eventType);
    return {
      ok: true,
      event_type: eventType,
      status: 'PENDING',
    };
  }
}

/**
 * Helper para criar instância do provider
 */
export function getPayPalProvider(): PayPalProvider {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
  const env = (Deno.env.get('PAYPAL_ENV') || 'sandbox') as 'sandbox' | 'live';

  if (!clientId || !clientSecret || !webhookId) {
    throw new Error(
      'PayPal not configured. Required: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID'
    );
  }

  return new PayPalProvider(clientId, clientSecret, webhookId, env);
}

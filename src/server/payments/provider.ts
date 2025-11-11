/**
 * Interface unificada para provedores de pagamento
 *
 * Suporte inicial: PayPal
 * Futuro: Coinbase Commerce
 */

export type CreateCheckoutInput = {
  orderId: string;         // id interno da orders
  label: string;           // ex: "erikson" | "777"
  type: 'personal' | 'numeric';
  amountPix: number;       // 1 PIX = 1 USD
  currency: 'USD';         // fixo neste MVP
  successUrl: string;      // URL de retorno
  cancelUrl: string;
};

export type CreateCheckoutOutput = {
  checkout_url: string;    // link para redirecionar o usuário
  provider_ref: string;    // id da ordem no provedor (para reconciliar)
};

export type WebhookVerificationResult = {
  ok: boolean;
  provider_ref?: string;
  event_type?: string;
  amount?: number;
  currency?: string;
  status?: 'COMPLETED' | 'FAILED' | 'PENDING';
  metadata?: Record<string, any>;
};

export interface PaymentsProvider {
  /**
   * Cria uma sessão de checkout
   */
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutOutput>;

  /**
   * Verifica e processa webhook do provedor
   *
   * @param req - Request object com headers
   * @param rawBody - Raw body (string ou Buffer) para validação de assinatura
   */
  verifyWebhook(req: any, rawBody: string | Buffer): Promise<WebhookVerificationResult>;
}

/**
 * Factory para obter o provider correto
 */
export function getPaymentProvider(providerName: string): string {
  const supported = ['paypal', 'coinbase'];

  if (!supported.includes(providerName.toLowerCase())) {
    throw new Error(
      `Payment provider '${providerName}' not supported. ` +
      `Supported: ${supported.join(', ')}`
    );
  }

  return providerName.toLowerCase();
}

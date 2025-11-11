/**
 * Environment Variables Helper
 *
 * Centraliza o acesso às variáveis de ambiente com validação e defaults seguros.
 *
 * IMPORTANTE:
 * - Variáveis client-side devem começar com VITE_
 * - Variáveis server-side usam process.env diretamente
 */

// =============================================================================
// CLIENT-SIDE (Vite)
// =============================================================================

export const clientEnv = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // URLs Públicas (client pode acessar via PUBLIC_)
  urls: {
    base: import.meta.env.VITE_PUBLIC_BASE_URL || 'https://pix.global',
    app: import.meta.env.VITE_PUBLIC_APP_URL || 'https://app.pix.global',
    api: import.meta.env.VITE_PUBLIC_API_URL || 'https://api.pix.global',
  },

  // Modo de desenvolvimento
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

// =============================================================================
// SERVER-SIDE (Node/Edge Functions)
// =============================================================================

/**
 * Acessa variável de ambiente com validação
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  // No browser, não temos acesso a process.env
  if (typeof process === 'undefined') {
    console.warn(`Tentativa de acessar variável server-side "${key}" no browser`);
    return defaultValue || '';
  }

  const value = process.env[key];

  if (!value && !defaultValue) {
    console.warn(`Variável de ambiente "${key}" não definida`);
  }

  return value || defaultValue || '';
}

/**
 * Acessa variável de ambiente obrigatória (lança erro se não existir)
 */
export function requireEnvVar(key: string): string {
  const value = getEnvVar(key);

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória "${key}" não foi definida`);
  }

  return value;
}

// =============================================================================
// SERVER ENV VARS (usar apenas em edge functions ou server-side)
// =============================================================================

export const serverEnv = {
  // Supabase
  supabase: {
    url: () => getEnvVar('VITE_SUPABASE_URL', ''),
    serviceRoleKey: () => getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
  },

  // Cloudflare
  cloudflare: {
    apiToken: () => getEnvVar('CLOUDFLARE_API_TOKEN', ''),
    zoneId: () => getEnvVar('CLOUDFLARE_ZONE_ID', ''),
    apiBase: () => getEnvVar('CLOUDFLARE_API_BASE', 'https://api.cloudflare.com/client/v4'),
  },

  // Blockchain / NFT
  blockchain: {
    rpcUrl: () => getEnvVar('RPC_URL', ''),
    contractAddress: () => getEnvVar('NFT_CONTRACT_ADDRESS', ''),
    contractAbi: () => {
      const abi = getEnvVar('NFT_CONTRACT_ABI_JSON', '[]');
      try {
        return JSON.parse(abi);
      } catch {
        return [];
      }
    },
    ownerWallet: () => getEnvVar('OWNER_WALLET', ''),
  },

  // IPFS
  ipfs: {
    apiKey: () => getEnvVar('IPFS_API_KEY', ''),
    secret: () => getEnvVar('IPFS_SECRET', ''),
    gatewayUrl: () => getEnvVar('IPFS_GATEWAY_URL', ''),
  },

  // Pagamentos
  payment: {
    provider: () => getEnvVar('PAYMENT_PROVIDER', 'mercadopago'),
    apiKey: () => getEnvVar('PAYMENT_API_KEY', ''),
    webhookSecret: () => getEnvVar('PAYMENT_WEBHOOK_SECRET', ''),
  },

  // URLs
  urls: {
    base: () => getEnvVar('PUBLIC_BASE_URL', 'https://pix.global'),
    app: () => getEnvVar('PUBLIC_APP_URL', 'https://app.pix.global'),
    api: () => getEnvVar('PUBLIC_API_URL', 'https://api.pix.global'),
  },
} as const;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Verifica se todas as variáveis obrigatórias estão definidas
 */
export function validateRequiredEnvVars(vars: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const varName of vars) {
    const value = getEnvVar(varName);
    if (!value) {
      missing.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Retorna informações sobre o ambiente atual
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
    isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
    isTest: getEnvVar('NODE_ENV', 'development') === 'test',
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  client: clientEnv,
  server: serverEnv,
  getEnvVar,
  requireEnvVar,
  validateRequiredEnvVars,
  getEnvironmentInfo,
};

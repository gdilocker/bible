/**
 * Lista de nomes bloqueados
 *
 * Inclui:
 * - Marcas registradas protegidas
 * - Termos ofensivos
 * - Palavras reservadas do sistema
 * - Nomes de sistemas/protocolos
 */

export const BLOCKED_NAMES = new Set([
  // Sistema Pix.Global
  'pix',
  'pixglobal',
  'global',
  'admin',
  'root',
  'system',
  'api',
  'www',
  'app',
  'dashboard',
  'panel',
  'suporte',
  'support',
  'help',
  'ajuda',

  // Marcas conhecidas - Tech
  'google',
  'facebook',
  'amazon',
  'microsoft',
  'apple',
  'meta',
  'instagram',
  'whatsapp',
  'twitter',
  'x',
  'youtube',
  'netflix',
  'spotify',
  'tiktok',
  'linkedin',
  'github',
  'gitlab',
  'bitbucket',

  // Marcas - Pagamentos/Fintech
  'visa',
  'mastercard',
  'paypal',
  'stripe',
  'nubank',
  'itau',
  'bradesco',
  'santander',
  'bb',
  'caixa',
  'picpay',
  'mercadopago',
  'pagseguro',

  // Marcas - Crypto
  'bitcoin',
  'ethereum',
  'binance',
  'coinbase',
  'metamask',

  // Instituições
  'governo',
  'government',
  'federal',
  'receita',
  'policia',
  'police',
  'fbi',
  'cia',

  // Termos ofensivos (apenas alguns exemplos - expandir conforme necessário)
  'admin',
  'moderator',
  'oficial',
  'official',
  'verified',
  'verificado',

  // Protocolos/Técnicos
  'http',
  'https',
  'ftp',
  'ssh',
  'dns',
  'smtp',
  'imap',
  'pop3',

  // Números reservados
  '0',
  '1',
  '00',
  '11',
  '000',
  '111',
  '123',
  '1234',
  '12345',
  '123456',

  // Palavras genéricas muito comuns
  'test',
  'teste',
  'example',
  'exemplo',
  'demo',
  'temp',
  'tmp',
  'null',
  'undefined',
]);

/**
 * Verifica se um nome está bloqueado
 */
export function isNameBlocked(name: string): boolean {
  const normalized = name.toLowerCase().trim();
  return BLOCKED_NAMES.has(normalized);
}

/**
 * Valida o formato do nome (regex)
 */
export function validateNameFormat(name: string): {
  valid: boolean;
  error?: string;
} {
  // Regex: apenas letras minúsculas e números, 1-64 caracteres
  const regex = /^[a-z0-9]{1,64}$/;

  if (!name || name.length === 0) {
    return {
      valid: false,
      error: 'Nome é obrigatório',
    };
  }

  if (name.length > 64) {
    return {
      valid: false,
      error: 'Nome deve ter no máximo 64 caracteres',
    };
  }

  if (!regex.test(name)) {
    return {
      valid: false,
      error: 'Apenas letras minúsculas e números são permitidos',
    };
  }

  return { valid: true };
}

/**
 * Detecta o tipo baseado no conteúdo
 */
export function detectNameType(name: string): 'personal' | 'numeric' {
  // Se contém apenas números, é numeric
  if (/^\d+$/.test(name)) {
    return 'numeric';
  }
  // Caso contrário, é personal
  return 'personal';
}

/**
 * Validação completa do nome
 */
export function validateDomainName(name: string): {
  valid: boolean;
  type: 'personal' | 'numeric';
  error?: string;
} {
  // Normalizar
  const normalized = name.toLowerCase().trim();

  // Validar formato
  const formatValidation = validateNameFormat(normalized);
  if (!formatValidation.valid) {
    return {
      valid: false,
      type: 'personal',
      error: formatValidation.error,
    };
  }

  // Verificar blocklist
  if (isNameBlocked(normalized)) {
    return {
      valid: false,
      type: detectNameType(normalized),
      error: 'Este nome está reservado ou bloqueado',
    };
  }

  // Detectar tipo
  const type = detectNameType(normalized);

  return {
    valid: true,
    type,
  };
}

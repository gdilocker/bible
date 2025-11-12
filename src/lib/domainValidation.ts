/**
 * Validação e Geração de Domínios - Pix.Global
 *
 * Três classes de domínios:
 * 1. Identity: nomes personalizados (ex: maria.pix.global)
 * 2. Credit: números puros (ex: 777.pix.global)
 * 3. Quick Access: alfanuméricos curtos (ex: a1.pix.global, x9k7q3r2.pix.global)
 */

// =====================================================
// CONSTANTES E CONFIGURAÇÕES
// =====================================================

// Caracteres válidos para quick_access (sem ambíguos: 0/o/1/l/i)
const QUICK_ACCESS_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

// Nomes bloqueados para identity
const BLOCKED_NAMES = [
  'admin', 'support', 'root', 'api', 'www', 'mail', 'ftp', 'smtp',
  'webmail', 'cpanel', 'dns', 'help', 'info', 'contact', 'sales',
  'billing', 'abuse', 'security', 'privacy', 'legal', 'terms',
  'pix', 'global', 'pixglobal', 'system', 'status', 'test'
];

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export type DomainType = 'identity' | 'credit' | 'quick_access';
export type QuickAccessPattern = 'LN' | 'LLNN' | 'code';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  type?: DomainType;
}

export interface DomainSuggestion {
  name: string;
  type: DomainType;
  pattern?: QuickAccessPattern;
  price?: number;
  available: boolean;
}

// =====================================================
// VALIDAÇÕES POR TIPO
// =====================================================

/**
 * Valida domínio tipo Identity
 * Regex: ^[a-z][a-z0-9-]{1,62}$
 * Regras:
 * - Começa com letra
 * - Apenas letras minúsculas, números e hífen
 * - Não termina com hífen
 * - Sem hífens duplos
 * - Não está na lista de bloqueados
 */
export function validateIdentity(name: string): ValidationResult {
  const normalized = name.toLowerCase().trim();

  // Regex principal
  if (!/^[a-z][a-z0-9-]{1,62}$/.test(normalized)) {
    return {
      valid: false,
      error: 'Use apenas letras, números e hífen. Comece com letra. Ex: maria'
    };
  }

  // Não pode começar/terminar com hífen
  if (normalized.startsWith('-') || normalized.endsWith('-')) {
    return {
      valid: false,
      error: 'Não pode começar ou terminar com hífen'
    };
  }

  // Sem hífens duplos
  if (normalized.includes('--')) {
    return {
      valid: false,
      error: 'Não pode conter hífens consecutivos'
    };
  }

  // Verificar lista de bloqueados
  if (BLOCKED_NAMES.includes(normalized)) {
    return {
      valid: false,
      error: 'Este nome está reservado e não pode ser registrado'
    };
  }

  return { valid: true, type: 'identity' };
}

/**
 * Valida domínio tipo Credit (número puro)
 * Regex: ^[0-9]{1,63}$
 */
export function validateCredit(number: string): ValidationResult {
  const normalized = number.trim();

  if (!/^[0-9]{1,63}$/.test(normalized)) {
    return {
      valid: false,
      error: 'Use apenas números. Ex: 777'
    };
  }

  // Opcional: bloquear números que começam com 0 (dependendo da regra de negócio)
  // if (normalized.startsWith('0') && normalized.length > 1) {
  //   return {
  //     valid: false,
  //     error: 'Números não podem começar com zero'
  //   };
  // }

  return { valid: true, type: 'credit' };
}

/**
 * Valida domínio tipo Quick Access
 * Regex: ^[a-hj-km-np-z2-9]{2,12}$
 * Exclui caracteres ambíguos: 0, o, 1, l, i
 */
export function validateQuickAccess(code: string): ValidationResult {
  const normalized = code.toLowerCase().trim();

  if (!/^[a-hj-km-np-z2-9]{2,12}$/.test(normalized)) {
    return {
      valid: false,
      error: 'Use 2-12 caracteres (letras e números, sem 0/o/1/l/i). Ex: a1, br22, x9k7q3r2'
    };
  }

  return { valid: true, type: 'quick_access' };
}

/**
 * Detecta automaticamente o tipo de domínio e valida
 */
export function validateDomain(input: string): ValidationResult {
  const normalized = input.toLowerCase().trim();

  // Tentar como número (credit)
  if (/^[0-9]+$/.test(normalized)) {
    return validateCredit(normalized);
  }

  // Tentar como quick_access (sem hífen, caracteres limitados)
  if (/^[a-hj-km-np-z2-9]{2,12}$/.test(normalized)) {
    return validateQuickAccess(normalized);
  }

  // Padrão: identity
  return validateIdentity(normalized);
}

// =====================================================
// GERADORES DE DOMÍNIOS QUICK_ACCESS
// =====================================================

/**
 * Gera código aleatório sem caracteres ambíguos
 */
function randomChar(): string {
  return QUICK_ACCESS_CHARS[Math.floor(Math.random() * QUICK_ACCESS_CHARS.length)];
}

/**
 * Gera número aleatório (2-9, sem 0 e 1)
 */
function randomDigit(): string {
  const digits = '23456789';
  return digits[Math.floor(Math.random() * digits.length)];
}

/**
 * Gera letra aleatória (sem ambíguos)
 */
function randomLetter(): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  return letters[Math.floor(Math.random() * letters.length)];
}

/**
 * Calcula checksum simples (mod 10) para códigos seguros
 */
function calculateChecksum(code: string): string {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const value = QUICK_ACCESS_CHARS.indexOf(code[i]);
    sum += value;
  }
  return QUICK_ACCESS_CHARS[sum % QUICK_ACCESS_CHARS.length];
}

/**
 * Gera padrão L+N (ex: a1, m7, z3)
 */
export function generateLN(): string {
  return randomLetter() + randomDigit();
}

/**
 * Gera padrão LL+NN (ex: br22, us45, mx88)
 */
export function generateLLNN(): string {
  return randomLetter() + randomLetter() + randomDigit() + randomDigit();
}

/**
 * Gera código seguro (6-10 chars com checksum)
 * Ex: x9k7q3r2 (7 chars + 1 checksum)
 */
export function generateSecureCode(length: number = 7): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += randomChar();
  }
  // Adicionar checksum
  code += calculateChecksum(code);
  return code;
}

/**
 * Gera lista de sugestões baseadas em padrão
 */
export function generateSuggestions(
  pattern: QuickAccessPattern,
  count: number = 10
): string[] {
  const suggestions = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 3;

  while (suggestions.size < count && attempts < maxAttempts) {
    attempts++;
    let code: string;

    switch (pattern) {
      case 'LN':
        code = generateLN();
        break;
      case 'LLNN':
        code = generateLLNN();
        break;
      case 'code':
        code = generateSecureCode(Math.floor(Math.random() * 5) + 6); // 6-10 chars
        break;
    }

    suggestions.add(code);
  }

  return Array.from(suggestions);
}

// =====================================================
// SUGESTÕES INTELIGENTES
// =====================================================

/**
 * Gera sugestões baseadas no input do usuário
 */
export function generateSmartSuggestions(
  input: string,
  type: DomainType
): string[] {
  const normalized = input.toLowerCase().trim();
  const suggestions: string[] = [];

  switch (type) {
    case 'identity':
      // Sugestões de nomes
      suggestions.push(
        normalized + '2025',
        normalized + 'official',
        normalized + 'pro',
        normalized + 'global',
        'the-' + normalized,
        normalized.substring(0, 4) + Math.floor(Math.random() * 1000),
        normalized + '-pix',
        normalized + Math.floor(Math.random() * 100)
      );
      break;

    case 'credit':
      // Sugestões de números próximos
      const num = parseInt(normalized);
      if (!isNaN(num)) {
        for (let i = 1; i <= 5; i++) {
          suggestions.push(String(num + i));
          suggestions.push(String(num - i));
        }
      }
      // Números com padrões
      suggestions.push(
        normalized + '0',
        normalized + '00',
        '1' + normalized,
        normalized + normalized.substring(0, 2)
      );
      break;

    case 'quick_access':
      // Sugestões de códigos similares
      suggestions.push(
        ...generateSuggestions('LN', 3),
        ...generateSuggestions('LLNN', 3),
        ...generateSuggestions('code', 4)
      );
      break;
  }

  // Filtrar e remover duplicatas
  return Array.from(new Set(suggestions))
    .filter(s => {
      const validation = type === 'identity'
        ? validateIdentity(s)
        : type === 'credit'
        ? validateCredit(s)
        : validateQuickAccess(s);
      return validation.valid;
    })
    .slice(0, 10);
}

// =====================================================
// CÁLCULO DE PREÇOS
// =====================================================

/**
 * Calcula preço de domínio Credit baseado em raridade
 */
export function calculateCreditPrice(number: string): number {
  const length = number.length;
  let basePrice: number;

  // Tabela de preços por comprimento
  if (length >= 8) basePrice = 1;
  else if (length === 7) basePrice = 5;
  else if (length === 6) basePrice = 10;
  else if (length === 5) basePrice = 100;
  else if (length === 4) basePrice = 1000;
  else if (length === 3) basePrice = 10000;
  else if (length === 2) basePrice = 100000;
  else if (length === 1) basePrice = 1000000;
  else basePrice = 1;

  // Aplicar multiplicadores por padrões
  let multiplier = 1;

  // Todos dígitos iguais (ex: 777, 8888)
  if (/^(\d)\1+$/.test(number)) {
    multiplier = length <= 3 ? 10 : length <= 5 ? 5 : 3;
  }
  // Sequencial (ex: 123, 456, 789)
  else if (isSequential(number)) {
    multiplier = length <= 3 ? 8 : length <= 5 ? 4 : 2;
  }
  // Capicua/Palíndromo (ex: 121, 1221)
  else if (isPalindrome(number)) {
    multiplier = length <= 3 ? 6 : length <= 5 ? 3 : 2;
  }

  return basePrice * multiplier;
}

/**
 * Verifica se número é sequencial
 */
function isSequential(num: string): boolean {
  if (num.length < 2) return false;

  let ascending = true;
  let descending = true;

  for (let i = 1; i < num.length; i++) {
    const diff = parseInt(num[i]) - parseInt(num[i - 1]);
    if (diff !== 1) ascending = false;
    if (diff !== -1) descending = false;
  }

  return ascending || descending;
}

/**
 * Verifica se número é palíndromo
 */
function isPalindrome(num: string): boolean {
  return num === num.split('').reverse().join('');
}

/**
 * Calcula preço de Quick Access baseado no padrão
 */
export function calculateQuickAccessPrice(code: string, pattern?: QuickAccessPattern): number {
  // Detectar padrão automaticamente se não fornecido
  if (!pattern) {
    if (code.length === 2) pattern = 'LN';
    else if (code.length === 4) pattern = 'LLNN';
    else pattern = 'code';
  }

  switch (pattern) {
    case 'LN': return 2;
    case 'LLNN': return 3;
    case 'code': return 5;
    default: return 5;
  }
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

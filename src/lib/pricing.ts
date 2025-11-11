/**
 * Sistema de Precificação Pix.Global
 *
 * Regras:
 * - Personal (nomes): 25 PIX fixo
 * - Numeric (números): baseado em comprimento + multiplicadores
 */

export interface PricingResult {
  basePrice: number;
  multipliers: Array<{ name: string; factor: number }>;
  finalPrice: number;
  currency: string;
  type: 'personal' | 'numeric';
  details: string;
}

// Preço base para nomes pessoais
const PERSONAL_BASE_PRICE = 25;

// Tabela de preços por comprimento para números
const NUMERIC_LENGTH_PRICES: Record<number, number> = {
  1: 1_000_000,
  2: 100_000,
  3: 10_000,
  4: 1_000,
  5: 100,
  6: 10,
  7: 5,
};

// Preço para números com 8+ dígitos
const NUMERIC_DEFAULT_PRICE = 1;

/**
 * Verifica se um número é repetido (ex: 111, 2222, 55555)
 */
function isRepeated(num: string): boolean {
  if (num.length < 2) return false;
  const firstChar = num[0];
  return num.split('').every(char => char === firstChar);
}

/**
 * Verifica se um número é sequencial (ex: 123, 4567, 9876)
 * Pode ser crescente (123) ou decrescente (987)
 */
function isSequential(num: string): boolean {
  if (num.length < 2) return false;

  // Verificar sequencial crescente
  let isCrescente = true;
  for (let i = 1; i < num.length; i++) {
    if (parseInt(num[i]) !== parseInt(num[i - 1]) + 1) {
      isCrescente = false;
      break;
    }
  }
  if (isCrescente) return true;

  // Verificar sequencial decrescente
  let isDecrescente = true;
  for (let i = 1; i < num.length; i++) {
    if (parseInt(num[i]) !== parseInt(num[i - 1]) - 1) {
      isDecrescente = false;
      break;
    }
  }
  return isDecrescente;
}

/**
 * Verifica se um número é capicua/palíndromo (ex: 121, 1221, 1331)
 */
function isCapicua(num: string): boolean {
  if (num.length < 2) return false;
  const reversed = num.split('').reverse().join('');
  return num === reversed;
}

/**
 * Calcula o preço base de um número baseado no comprimento
 */
function getNumericBasePrice(num: string): number {
  const length = num.length;
  return NUMERIC_LENGTH_PRICES[length] || NUMERIC_DEFAULT_PRICE;
}

/**
 * Detecta multiplicadores aplicáveis a um número
 */
function detectMultipliers(num: string): Array<{ name: string; factor: number }> {
  const multipliers: Array<{ name: string; factor: number }> = [];

  // Ordem de verificação: capicua > repetido > sequencial
  // (capicua tem prioridade maior)

  if (isCapicua(num)) {
    multipliers.push({ name: 'Capicua', factor: 4 });
  } else if (isRepeated(num)) {
    multipliers.push({ name: 'Repetido', factor: 3 });
  } else if (isSequential(num)) {
    multipliers.push({ name: 'Sequencial', factor: 2 });
  }

  return multipliers;
}

/**
 * Calcula o preço final aplicando multiplicadores
 */
function applyMultipliers(
  basePrice: number,
  multipliers: Array<{ name: string; factor: number }>
): number {
  let finalPrice = basePrice;

  for (const multiplier of multipliers) {
    finalPrice *= multiplier.factor;
  }

  return finalPrice;
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price: number, currency: string = 'BRL'): string {
  if (currency === 'BRL' || currency === 'PIX') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calcula o preço de um domínio
 *
 * @param label - Nome ou número do domínio (sem .pix.global)
 * @param type - Tipo: 'personal' ou 'numeric'
 * @returns Objeto com detalhes do preço
 */
export function precoPorDominio(
  label: string,
  type: 'personal' | 'numeric'
): PricingResult {
  const normalized = label.toLowerCase().trim();

  if (type === 'personal') {
    return {
      basePrice: PERSONAL_BASE_PRICE,
      multipliers: [],
      finalPrice: PERSONAL_BASE_PRICE,
      currency: 'BRL',
      type: 'personal',
      details: 'Preço fixo para identidades pessoais',
    };
  }

  // Tipo numeric
  if (!/^\d+$/.test(normalized)) {
    throw new Error('Tipo numeric requer apenas dígitos');
  }

  const basePrice = getNumericBasePrice(normalized);
  const multipliers = detectMultipliers(normalized);
  const finalPrice = applyMultipliers(basePrice, multipliers);

  // Criar descrição dos multiplicadores
  let details = `Comprimento: ${normalized.length} dígito(s)`;
  if (multipliers.length > 0) {
    const multipliersDesc = multipliers
      .map(m => `${m.name} (×${m.factor})`)
      .join(', ');
    details += ` + ${multipliersDesc}`;
  }

  return {
    basePrice,
    multipliers,
    finalPrice,
    currency: 'BRL',
    type: 'numeric',
    details,
  };
}

/**
 * Exemplos de preços para exibição
 */
export const PRICING_EXAMPLES = {
  personal: [
    { label: 'maria', description: 'Nome simples' },
    { label: 'joaosilva', description: 'Nome completo' },
    { label: 'ana2024', description: 'Nome + número' },
  ],
  numeric: {
    basic: [
      { label: '77777777', description: '8 dígitos básicos', length: 8 },
      { label: '7654321', description: '7 dígitos básicos', length: 7 },
      { label: '123456', description: '6 dígitos básicos', length: 6 },
    ],
    special: [
      { label: '777', description: '3 dígitos repetidos', length: 3 },
      { label: '123', description: '3 dígitos sequenciais', length: 3 },
      { label: '1221', description: '4 dígitos capicua', length: 4 },
    ],
    premium: [
      { label: '7', description: '1 dígito', length: 1 },
      { label: '77', description: '2 dígitos', length: 2 },
      { label: '777', description: '3 dígitos', length: 3 },
    ],
  },
};

/**
 * Obtém todos os exemplos com preços calculados
 */
export function getAllExamplesWithPrices() {
  return {
    personal: PRICING_EXAMPLES.personal.map(ex => ({
      ...ex,
      pricing: precoPorDominio(ex.label, 'personal'),
    })),
    numeric: {
      basic: PRICING_EXAMPLES.numeric.basic.map(ex => ({
        ...ex,
        pricing: precoPorDominio(ex.label, 'numeric'),
      })),
      special: PRICING_EXAMPLES.numeric.special.map(ex => ({
        ...ex,
        pricing: precoPorDominio(ex.label, 'numeric'),
      })),
      premium: PRICING_EXAMPLES.numeric.premium.map(ex => ({
        ...ex,
        pricing: precoPorDominio(ex.label, 'numeric'),
      })),
    },
  };
}

/**
 * Tabela de preços por comprimento (para exibição)
 */
export function getLengthPricingTable() {
  return [
    { length: 1, basePrice: 1_000_000, example: '7' },
    { length: 2, basePrice: 100_000, example: '77' },
    { length: 3, basePrice: 10_000, example: '777' },
    { length: 4, basePrice: 1_000, example: '7777' },
    { length: 5, basePrice: 100, example: '77777' },
    { length: 6, basePrice: 10, example: '777777' },
    { length: 7, basePrice: 5, example: '7777777' },
    { length: '8+', basePrice: 1, example: '77777777' },
  ];
}

/**
 * Multiplicadores disponíveis (para exibição)
 */
export function getMultipliersTable() {
  return [
    {
      name: 'Capicua',
      factor: 4,
      description: 'Números palíndromos (ex: 121, 1221, 1331)',
      examples: ['121', '1221', '12321'],
    },
    {
      name: 'Repetido',
      factor: 3,
      description: 'Todos os dígitos iguais (ex: 111, 2222)',
      examples: ['111', '2222', '55555'],
    },
    {
      name: 'Sequencial',
      factor: 2,
      description: 'Sequência crescente ou decrescente (ex: 123, 987)',
      examples: ['123', '4567', '9876'],
    },
  ];
}

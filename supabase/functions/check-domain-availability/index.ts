import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CheckRequest {
  name: string;
  type?: 'identity' | 'credit' | 'quick_access';
}

interface CheckResponse {
  available: boolean;
  name: string;
  type: string;
  price?: number;
  suggestions: Array<{
    name: string;
    type: string;
    price: number;
    available: boolean;
  }>;
  error?: string;
}

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

    // Parse query params
    const url = new URL(req.url);
    const name = url.searchParams.get('name')?.toLowerCase().trim();
    let type = url.searchParams.get('type') as 'identity' | 'credit' | 'quick_access' | null;

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Nome é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-detect type if not provided
    if (!type) {
      if (/^[0-9]+$/.test(name)) {
        type = 'credit';
      } else if (/^[a-hj-km-np-z2-9]{2,12}$/.test(name)) {
        type = 'quick_access';
      } else {
        type = 'identity';
      }
    }

    // Validate based on type
    let valid = false;
    let validationError = '';

    switch (type) {
      case 'identity':
        valid = /^[a-z][a-z0-9-]{1,62}$/.test(name) &&
                !name.includes('--') &&
                !name.startsWith('-') &&
                !name.endsWith('-');
        if (!valid) validationError = 'Use apenas letras, números e hífen. Comece com letra.';
        break;

      case 'credit':
        valid = /^[0-9]{1,63}$/.test(name);
        if (!valid) validationError = 'Use apenas números.';
        break;

      case 'quick_access':
        valid = /^[a-hj-km-np-z2-9]{2,12}$/.test(name);
        if (!valid) validationError = 'Use 2-12 caracteres (letras/números, sem 0/o/1/l/i).';
        break;
    }

    if (!valid) {
      return new Response(
        JSON.stringify({ available: false, error: validationError, suggestions: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check availability
    const { data: existing, error: dbError } = await supabase
      .from('domains')
      .select('domain_name')
      .eq('domain_name', name)
      .maybeSingle();

    if (dbError) throw dbError;

    const available = !existing;

    // Calculate price
    let price = 0;
    if (type === 'identity') {
      price = 25; // Basic plan
    } else if (type === 'credit') {
      price = calculateCreditPrice(name);
    } else if (type === 'quick_access') {
      price = calculateQuickAccessPrice(name);
    }

    // Generate suggestions
    const suggestions = await generateSuggestions(name, type, supabase);

    const response: CheckResponse = {
      available,
      name,
      type,
      price,
      suggestions
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking domain:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao verificar disponibilidade' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Calculate credit price
function calculateCreditPrice(number: string): number {
  const length = number.length;
  let basePrice: number;

  if (length >= 8) basePrice = 1;
  else if (length === 7) basePrice = 5;
  else if (length === 6) basePrice = 10;
  else if (length === 5) basePrice = 100;
  else if (length === 4) basePrice = 1000;
  else if (length === 3) basePrice = 10000;
  else if (length === 2) basePrice = 100000;
  else basePrice = 1000000;

  // Apply multipliers
  let multiplier = 1;
  if (/^(\d)\1+$/.test(number)) multiplier = length <= 3 ? 10 : 5;
  else if (isSequential(number)) multiplier = length <= 3 ? 8 : 4;
  else if (isPalindrome(number)) multiplier = length <= 3 ? 6 : 3;

  return basePrice * multiplier;
}

// Helper: Calculate quick access price
function calculateQuickAccessPrice(code: string): number {
  if (code.length === 2) return 2;
  if (code.length === 4) return 3;
  return 5;
}

// Helper: Check if sequential
function isSequential(num: string): boolean {
  if (num.length < 2) return false;
  let asc = true, desc = true;
  for (let i = 1; i < num.length; i++) {
    const diff = parseInt(num[i]) - parseInt(num[i - 1]);
    if (diff !== 1) asc = false;
    if (diff !== -1) desc = false;
  }
  return asc || desc;
}

// Helper: Check if palindrome
function isPalindrome(num: string): boolean {
  return num === num.split('').reverse().join('');
}

// Helper: Generate suggestions
async function generateSuggestions(
  input: string,
  type: string,
  supabase: any
): Promise<Array<{ name: string; type: string; price: number; available: boolean }>> {
  const suggestions: string[] = [];

  if (type === 'identity') {
    suggestions.push(
      input + '2025',
      input + 'official',
      input + 'pro',
      'the-' + input,
      input + Math.floor(Math.random() * 1000)
    );
  } else if (type === 'credit') {
    const num = parseInt(input);
    if (!isNaN(num)) {
      for (let i = 1; i <= 5; i++) {
        suggestions.push(String(num + i));
        suggestions.push(String(num - i));
      }
    }
  } else if (type === 'quick_access') {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    for (let i = 0; i < 10; i++) {
      let code = '';
      const len = Math.random() > 0.5 ? 2 : 4;
      for (let j = 0; j < len; j++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      suggestions.push(code);
    }
  }

  // Check availability of suggestions
  const { data: existingDomains } = await supabase
    .from('domains')
    .select('domain_name')
    .in('domain_name', suggestions);

  const existingSet = new Set((existingDomains || []).map((d: any) => d.domain_name));

  return suggestions
    .filter(s => s.length >= 2 && s.length <= 63)
    .slice(0, 10)
    .map(name => ({
      name,
      type,
      price: type === 'identity' ? 25 :
             type === 'credit' ? calculateCreditPrice(name) :
             calculateQuickAccessPrice(name),
      available: !existingSet.has(name)
    }));
}

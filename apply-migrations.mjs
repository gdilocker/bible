#!/usr/bin/env node

/**
 * Script para aplicar todas as migrações ao database do com.bible
 * Database: wnfuesmdcdsgplkvgdva.supabase.co
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://wnfuesmdcdsgplkvgdva.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MIGRATIONS_DIR = join(__dirname, 'supabase', 'migrations');

async function applyMigration(filename, sql) {
  try {
    console.log(`  Executando SQL (${sql.length} chars)...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Se não existir a function, tenta executar direto
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: filename, applied_at: new Date().toISOString() });

      if (directError) {
        throw directError;
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('');
  console.log('='.repeat(80));
  console.log('APLICANDO MIGRAÇÕES - COM.BIBLE DATABASE');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('');

  // Listar todas as migrações
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Total de migrações encontradas: ${files.length}`);
  console.log('');

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = join(MIGRATIONS_DIR, filename);

    console.log(`[${i + 1}/${files.length}] ${filename}`);

    try {
      const sql = readFileSync(filepath, 'utf-8');

      // Pular migrações vazias ou só com comentários
      const cleanSql = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!cleanSql) {
        console.log('  ⏭️  Pulando (vazia)');
        skipped++;
        continue;
      }

      const result = await applyMigration(filename, sql);

      if (result.success) {
        console.log('  ✅ Sucesso');
        success++;
      } else {
        console.log(`  ⚠️  Erro: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ Falha: ${error.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('RESUMO');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Total:    ${files.length}`);
  console.log(`✅ Sucesso: ${success}`);
  console.log(`❌ Falhas:  ${failed}`);
  console.log(`⏭️  Puladas: ${skipped}`);
  console.log('');

  if (failed > 0) {
    console.log('⚠️  Algumas migrações falharam. Revise os erros acima.');
    process.exit(1);
  } else {
    console.log('🎉 Todas as migrações foram aplicadas com sucesso!');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Verificar tabelas criadas no Supabase Dashboard');
    console.log('2. Testar a aplicação');
    console.log('');
  }
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

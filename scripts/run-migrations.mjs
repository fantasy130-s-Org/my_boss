#!/usr/bin/env node
/**
 * Migration Runner for Supabase
 *
 * This script reads SQL migration files and executes them directly via Supabase REST API.
 * It bypasses the need for MCP servers or CLI tools.
 *
 * Usage: node scripts/run-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Execute raw SQL via Supabase REST API
 */
async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // If exec_sql doesn't exist, we'll need to use a different approach
      throw error;
    }

    return { data, error: null };
  } catch (err) {
    // Fallback: Try to parse and execute individual statements
    return { data: null, error: err };
  }
}

/**
 * Split SQL file into individual statements
 */
function parseSqlStatements(sql) {
  // Remove comments
  const withoutComments = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  // Split by semicolon, but be careful with string literals and functions
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let dollarQuoteTag = null;

  for (let i = 0; i < withoutComments.length; i++) {
    const char = withoutComments[i];
    const nextChar = withoutComments[i + 1];

    // Handle dollar-quoted strings (PostgreSQL)
    if (char === '$' && !inString) {
      const match = withoutComments.slice(i).match(/^\$([a-zA-Z_]*)\$/);
      if (match) {
        if (dollarQuoteTag === null) {
          dollarQuoteTag = match[0];
        } else if (dollarQuoteTag === match[0]) {
          dollarQuoteTag = null;
        }
        current += match[0];
        i += match[0].length - 1;
        continue;
      }
    }

    // Handle regular string literals
    if ((char === "'" || char === '"') && !dollarQuoteTag) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        // Check if escaped
        if (nextChar === stringChar) {
          current += char + nextChar;
          i++;
          continue;
        }
        inString = false;
        stringChar = '';
      }
    }

    current += char;

    // Split on semicolon if not in string
    if (char === ';' && !inString && !dollarQuoteTag) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Add remaining statement if any
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

/**
 * Run a single migration file
 */
async function runMigrationFile(filename, description) {
  console.log(`\n📄 Running migration: ${filename}`);
  console.log(`   ${description}`);
  console.log('─'.repeat(60));

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', filename);

  let sql;
  try {
    sql = readFileSync(migrationPath, 'utf-8');
  } catch (err) {
    console.error(`❌ Error reading file: ${err.message}`);
    return false;
  }

  const statements = parseSqlStatements(sql);
  console.log(`   Found ${statements.length} SQL statements\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\s+/g, ' ');

    process.stdout.write(`   [${i + 1}/${statements.length}] ${preview}...`);

    try {
      const { error } = await supabase.rpc('query', { sql: statement });

      if (error) {
        // Try direct table operations if RPC fails
        const result = await executeStatementDirect(statement);
        if (result.error) {
          console.log(' ❌');
          console.error(`       Error: ${result.error.message}`);
          errorCount++;
        } else {
          console.log(' ✅');
          successCount++;
        }
      } else {
        console.log(' ✅');
        successCount++;
      }
    } catch (err) {
      console.log(' ❌');
      console.error(`       Error: ${err.message}`);
      errorCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Success: ${successCount} | ❌ Errors: ${errorCount}`);

  return errorCount === 0;
}

/**
 * Execute statement using direct Supabase client methods
 */
async function executeStatementDirect(statement) {
  const upperStatement = statement.toUpperCase().trim();

  // For CREATE, ALTER, DROP statements, we need admin access
  // Regular anon key won't work - need service role key
  if (upperStatement.startsWith('CREATE') ||
      upperStatement.startsWith('ALTER') ||
      upperStatement.startsWith('DROP')) {
    return { error: { message: 'DDL operations require service role key' } };
  }

  // For INSERT statements, try to parse and execute
  if (upperStatement.startsWith('INSERT INTO')) {
    // This would require parsing the INSERT statement
    // For now, return error suggesting manual execution
    return { error: { message: 'INSERT operations require service role key or manual execution' } };
  }

  return { error: { message: 'Statement type not supported by direct execution' } };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Supabase Migration Runner');
  console.log('━'.repeat(60));
  console.log(`📍 Project: ${supabaseUrl}`);
  console.log(`🔑 Auth: ${supabaseKey.substring(0, 20)}...`);

  const migrations = [
    { file: '001_initial_schema.sql', desc: 'Initial database schema' },
    { file: '002_seed_questions.sql', desc: 'Seed 50 questions' },
  ];

  let allSuccess = true;

  for (const migration of migrations) {
    const success = await runMigrationFile(migration.file, migration.desc);
    if (!success) {
      allSuccess = false;
      console.log('\n⚠️  Migration had errors. Continue? (Ctrl+C to abort)');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '━'.repeat(60));
  if (allSuccess) {
    console.log('✅ All migrations completed successfully!');
  } else {
    console.log('⚠️  Migrations completed with some errors.');
    console.log('💡 Tip: You may need to run migrations manually via Supabase dashboard');
    console.log('   or use a service role key instead of the anon key.');
  }
  console.log('━'.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});

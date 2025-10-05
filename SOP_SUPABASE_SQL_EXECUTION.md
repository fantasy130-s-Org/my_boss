# SOP: Supabase SQL Execution for Projects

## Standard Operating Procedure for executing SQL migrations in Supabase projects

---

## Overview

This SOP documents the recommended methods for executing SQL migrations in Supabase, based on real-world testing with the MyBoss project.

## Method Comparison

| Method | Pros | Cons | Recommended |
|--------|------|------|-------------|
| **Supabase Dashboard** | ✅ Always works<br>✅ No setup required<br>✅ Visual feedback | ❌ Manual process | ✅ **PRIMARY** |
| **Migration Script** | ✅ Automated<br>✅ Repeatable | ❌ Requires service role key<br>❌ Anon key insufficient | ⚠️ Secondary |
| **Supabase MCP Server** | ✅ Integrated with Claude | ❌ Requires auth setup<br>❌ May not persist config | ❌ Not reliable |
| **Supabase CLI** | ✅ Professional workflow | ❌ Requires installation<br>❌ Project linking needed | ⚠️ Advanced users |

---

## PRIMARY METHOD: Supabase Dashboard (Manual)

### When to Use
- ✅ First-time project setup
- ✅ Development environment
- ✅ When you don't have service role key
- ✅ When automation is not critical

### Step-by-Step Process

#### 1. Access SQL Editor
```
1. Navigate to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New query" button
```

#### 2. Execute Migration Files
```
For each .sql file in supabase/migrations/ (in order):
  1. Open the .sql file in your code editor
  2. Copy entire contents (Cmd/Ctrl + A, Cmd/Ctrl + C)
  3. Paste into Supabase SQL Editor
  4. Click "Run" or press Cmd/Ctrl + Enter
  5. Wait for success message
  6. Verify: "Success. X rows affected" or "Success. No rows returned"
```

#### 3. Verify Execution
```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check row counts
SELECT
  (SELECT COUNT(*) FROM questions) as questions,
  (SELECT COUNT(*) FROM evaluations) as evaluations,
  (SELECT COUNT(*) FROM evaluation_answers) as answers;
```

### Expected Results
- Migration 001 (schema): "Success. No rows returned"
- Migration 002 (seed): "Success. 50 rows affected"

### Troubleshooting
- **Error: "permission denied"**: You're logged in as wrong user
- **Error: "relation already exists"**: Table already created, safe to skip
- **Error: "syntax error"**: Check if you copied full SQL statement

---

## SECONDARY METHOD: Automated Script

### When to Use
- ✅ Repeated migrations across environments
- ✅ CI/CD pipelines
- ✅ When you have service role key
- ❌ DO NOT use with anon key (will fail)

### Setup Requirements

#### 1. Get Service Role Key
```
1. Go to Project Settings > API
2. Copy "service_role" key (NOT anon key)
3. Add to .env.local:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **CRITICAL**: Service role key has admin access. Never commit to git!

#### 2. Verify Environment
```bash
# Check .env.local exists and has keys
cat .env.local | grep SUPABASE

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (optional, for migrations)
```

### Execution

#### Method A: Using Migration Script (if service role key available)
```bash
# Install dependencies
npm install dotenv @supabase/supabase-js

# Run migration script
node scripts/run-migrations.mjs
```

#### Method B: Test Results from MyBoss Project
```
🚀 Tested: node scripts/run-migrations.mjs

With ANON KEY:
✅ Connects successfully
✅ Reads SQL files
✅ Parses statements
❌ FAILS on DDL operations (CREATE, ALTER, DROP)
❌ FAILS on INSERT operations
Result: "DDL operations require service role key"

With SERVICE ROLE KEY (expected):
✅ Should execute all DDL statements
✅ Should execute all INSERT statements
✅ Should complete successfully
```

### Script Template

Save as `scripts/run-migrations.mjs`:

```javascript
#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // NOT anon key!
);

// Execute SQL via REST API
async function executeSql(sql) {
  const { error } = await supabase.rpc('query', { sql });
  if (error) throw error;
}

// Run your migrations...
```

---

## TERTIARY METHOD: Supabase CLI

### When to Use
- ✅ Professional team workflows
- ✅ Multiple environments (dev/staging/prod)
- ✅ Migration version control

### Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Project Structure
```
project/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_questions.sql
│   └── config.toml
```

---

## NOT RECOMMENDED: Supabase MCP Server

### Issues Found
- ❌ Configuration doesn't persist reliably
- ❌ Requires complex authentication setup
- ❌ `claude mcp add` commands may not save
- ❌ Shows "No MCP servers configured" even after adding

### Test Results
```bash
# Commands executed:
claude mcp add --transport http supabase "https://mcp.supabase.com/..."

# Result:
claude mcp list
> No MCP servers configured.

# Verification:
cat ~/.claude.json | grep mcpServers
> "mcpServers": {}
```

**Conclusion**: MCP server integration is not reliable for SQL execution as of testing date.

---

## RECOMMENDED WORKFLOW

### For New Projects
```
1. Write SQL migrations in supabase/migrations/
2. Test locally using Supabase Dashboard (PRIMARY METHOD)
3. Commit .sql files to git
4. Deploy to production using Supabase Dashboard or CLI
5. (Optional) Automate with CI/CD using service role key
```

### File Naming Convention
```
supabase/migrations/
├── 001_initial_schema.sql       # Tables, types, functions
├── 002_seed_data.sql            # Initial data
├── 003_add_feature_x.sql        # Feature additions
└── README.md                    # Migration instructions
```

### Git Safety
```gitignore
# .gitignore - ALWAYS exclude these:
.env.local
.env
*_SERVICE_ROLE_KEY*
```

---

## CHECKLIST

Before executing migrations:

- [ ] SQL files are in `supabase/migrations/` directory
- [ ] Files are numbered sequentially (001, 002, etc.)
- [ ] You have access to Supabase dashboard
- [ ] Project URL is correct
- [ ] You're logged into the correct Supabase account

After executing migrations:

- [ ] Run verification queries
- [ ] Check table row counts
- [ ] Test application connectivity
- [ ] Document any manual steps taken
- [ ] Update .env.example if needed

---

## SECURITY NOTES

### Service Role Key
- 🔐 Has FULL admin access to database
- 🔐 Bypasses Row Level Security (RLS)
- 🔐 Can create/drop tables and databases
- 🔐 Never commit to version control
- 🔐 Never share publicly
- 🔐 Rotate if exposed

### Anon Key
- ✅ Safe to commit (it's public-facing)
- ✅ Used in client-side code
- ✅ Respects RLS policies
- ❌ Cannot execute DDL operations
- ❌ Cannot bypass RLS

---

## CONCLUSION

**RECOMMENDED APPROACH**: Use Supabase Dashboard (PRIMARY METHOD) for reliability and simplicity.

**For automation**: Implement migration script with service role key, but only after manual verification.

**Last Updated**: 2025-01-04
**Project**: MyBoss (my_boss)
**Tested By**: Claude Code

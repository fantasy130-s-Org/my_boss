# Database Migration Guide

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT_REF

2. Navigate to **SQL Editor** in the left sidebar

3. Click **New query**

4. **Execute Migration 1 - Schema Setup**:
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL editor
   - Click **Run** or press `Cmd/Ctrl + Enter`
   - Wait for confirmation: "Success. No rows returned"

5. **Execute Migration 2 - Seed Questions**:
   - Click **New query** again
   - Copy the entire contents of `supabase/migrations/002_seed_questions.sql`
   - Paste into the SQL editor
   - Click **Run**
   - Should see: "Success. 50 rows affected"

6. **Verify the setup**:
   ```sql
   -- Check questions count by dimension
   SELECT dimension, COUNT(*) as count
   FROM questions
   GROUP BY dimension
   ORDER BY dimension;

   -- Should return 5 rows, each with count = 10
   ```

## Option 2: Using Supabase MCP Server

If you have the Supabase MCP server properly authenticated:

1. **Configure MCP server with authentication**:
   ```bash
   # First, ensure you have your Supabase anon key
   claude mcp add --transport http supabase \
     "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF" \
     --header "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
   ```

2. **Verify MCP server is healthy**:
   ```bash
   claude mcp list
   # Should show: supabase: ... - ✓ Healthy
   ```

3. The MCP tools should then be available to execute SQL directly

## Option 3: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Or manually:
supabase db execute --file supabase/migrations/001_initial_schema.sql
supabase db execute --file supabase/migrations/002_seed_questions.sql
```

## Verification Queries

After running migrations, verify with these queries:

```sql
-- 1. Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('questions', 'evaluations', 'evaluation_answers');

-- 2. Check question distribution
SELECT dimension, COUNT(*) as count
FROM questions
GROUP BY dimension;

-- 3. Test random question function
SELECT * FROM get_random_questions();

-- 4. Test percentile function (will return 50.0 with no data)
SELECT get_boss_percentile(75);
```

## Troubleshooting

### Error: "permission denied for schema public"
- Check Row Level Security policies are created
- Verify you're using the correct Supabase project

### Error: "type boss_dimension does not exist"
- Run migration 001 first before migration 002
- Ensure no previous failed migrations left partial state

### Questions table is empty after seed
- Check for errors in migration 002
- Manually verify INSERT statements executed

### RLS policies blocking access
- Policies are set to allow public access
- If issues persist, temporarily disable RLS:
  ```sql
  ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;
  ALTER TABLE evaluation_answers DISABLE ROW LEVEL SECURITY;
  ```

## Next Steps

After successful migration:

1. Update `.env.local` with your Supabase credentials
2. Run `npm run dev` to start the application
3. Visit http://localhost:3000 to test the questionnaire

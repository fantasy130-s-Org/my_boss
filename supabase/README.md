# Supabase Database Setup

## Migration Instructions

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_REF

2. Navigate to the SQL Editor

3. Copy and paste the contents of `migrations/001_initial_schema.sql`

4. Click "Run" to execute the migration

5. After the migration completes, run `migrations/002_seed_questions.sql` to populate the question bank

## Database Schema Overview

### Tables

- **questions**: 50 questions categorized by 5 dimensions
- **evaluations**: Boss evaluation results
- **evaluation_answers**: Individual question responses for each evaluation

### Functions

- `get_boss_percentile(score)`: Calculate percentile ranking
- `get_random_questions()`: Get 5 random questions (1 per dimension)

### Enums

- `boss_dimension`: business | leadership | communication | accountability | care
- `answer_type`: yes | no | unsure

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MyBoss (我的老板)** - A humorous boss evaluation platform where employees can anonymously rate their bosses across 5 dimensions through a 5-question questionnaire. Built with Next.js App Router, Supabase, TypeScript, React 19, and Tailwind CSS.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### Framework & Routing
- **Next.js App Router**: Uses the app directory structure with file-based routing
- **Server Components by default**: Pages are Server Components unless marked with 'use client'
- **TypeScript paths**: Configured with `@/*` alias pointing to project root

### Supabase Integration
The project has two Supabase client configurations:

1. **Server-side** (`utils/supabase/server.ts`):
   - Uses `createServerClient` from `@supabase/ssr`
   - Handles cookies via Next.js `cookies()` from `next/headers`
   - Used in Server Components and Server Actions
   - Required environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

2. **Client-side** (`utils/supabase/browser.ts`):
   - Uses `createBrowserClient` from `@supabase/ssr`
   - Used in Client Components
   - Shares same environment variables

### UI Components
- **shadcn/ui**: Configured with "new-york" style
- **Component aliases** (from components.json):
  - `@/components` - Components directory
  - `@/components/ui` - UI components
  - `@/utils` - Utilities
  - `@/lib` - Library code
  - `@/hooks` - Custom hooks
- **Icons**: Uses lucide-react
- **Styling**: Tailwind CSS with CSS variables, neutral base color

### Current Structure
```
app/
  instruments/page.tsx  - Example page fetching from Supabase "instruments" table
  layout.tsx           - Root layout (lang: zh-CN)
  globals.css          - Global styles
utils/
  supabase/
    server.ts          - Server-side Supabase client
    browser.ts         - Client-side Supabase client
```

## Key Patterns

### Data Fetching in Server Components
```typescript
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("table_name").select();
  // ...
}
```

### Using Supabase in Client Components
```typescript
import { supabase } from '@/utils/supabase/browser';
// Use supabase client in client component
```

## Environment Setup
Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
OPENAI_API_KEY=your_openai_api_key
```

## Application Features

### Core Functionality
1. **5-Question Questionnaire**: Users answer 5 randomly selected questions (1 per dimension)
2. **Dynamic Scoring**:
   - "Yes" = 0 points
   - "No" = 15-20 points (random)
   - "Unsure" = 5-10 points (random)
3. **AI Evaluation**: GPT-4o-mini generates humorous boss evaluations
4. **Percentile Ranking**: Compares boss to all evaluations in database
5. **Boss Search**: Search for boss evaluations by identifier
6. **Social Sharing**: Download results as image

### Five Dimensions (五维度模型)
- **业务水平** (Business Capability)
- **指挥水平** (Leadership)
- **沟通水平** (Communication)
- **背锅水平** (Accountability)
- **关怀水平** (Care/Concern)

### Key Pages
- `/` - Home page with evaluation count and search
- `/questionnaire/[step]` - Multi-step questionnaire (steps 1-5)
- `/results` - Results page with score, AI evaluation, radar chart
- `/search` - Boss search results page

### Database Schema
See `supabase/migrations/` for complete schema. Key tables:
- `questions` - 50 questions (10 per dimension)
- `evaluations` - Boss evaluation results
- `evaluation_answers` - Individual question responses

### Important Functions
- `get_random_questions()` - Returns 5 questions (1 per dimension)
- `get_boss_percentile(score)` - Calculates percentile ranking
- `calculateAnswerScore()` - Generates random score based on answer
- `generateBossEvaluation()` - AI evaluation via OpenAI API

## Setup Instructions

1. **Install dependencies**: `npm install`

2. **Set up Supabase**:
   - Go to Supabase dashboard SQL editor
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_seed_questions.sql`

3. **Configure environment**: Copy `.env.example` to `.env.local` and add your keys

4. **Run development server**: `npm run dev`

## Libraries Used
- **recharts** - Radar chart visualization
- **html-to-image** - Generate shareable result images
- **openai** - GPT-4o-mini integration for AI evaluations
- Use supabase mcp server to connect to supabase and exectue SQL if necessary
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application (using App Router) with Supabase integration, built with TypeScript, React 19, and Tailwind CSS. The project uses shadcn/ui components for the UI layer.

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
```
- Use supabase mcp server to connect to supabase and exectue SQL if necessary
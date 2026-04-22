# DATABASE

> Supabase (PostgreSQL) schema and configuration for CODEAURA.

## Provider

- **Platform**: [Supabase](https://supabase.com)
- **Database**: PostgreSQL 15
- **Auth**: Supabase Auth (JWT)

## Tables

### `sessions`

Caches AI-generated execution scripts per unique code hash (SHA-256).  
Avoids redundant Gemini / DeepSeek API calls for identical code submissions.

| Column          | Type        | Description                              |
|----------------|-------------|------------------------------------------|
| `id`            | UUID (PK)   | Auto-generated unique session ID         |
| `code_hash`     | TEXT        | SHA-256 hash of the submitted source code |
| `language`      | TEXT        | Programming language (`javascript`, `python`, …) |
| `filename`      | TEXT        | Optional filename hint                   |
| `code`          | TEXT        | Raw source code                          |
| `script`        | JSONB       | AI-generated execution steps (array)     |
| `quality_score` | INTEGER     | 0–100 code quality rating                |
| `bugs_count`    | INTEGER     | Number of detected bugs                  |
| `anon_token`    | TEXT        | Anonymous user identifier (optional)     |
| `created_at`    | TIMESTAMPTZ | Record creation timestamp                |

**Cache TTL**: 7 days (enforced in `BACKEND/src/services/cache.service.ts`)

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** in your Supabase dashboard
3. Run the contents of [`schema.sql`](./schema.sql)
4. Copy your project URL and service role key into your `.env` files:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Environment Variables

| Variable                  | Required | Description                     |
|--------------------------|----------|---------------------------------|
| `SUPABASE_URL`            | ✅        | Supabase project API URL        |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅     | Full-access backend key         |
| `SUPABASE_ANON_KEY`       | Optional | Public anon key (frontend auth) |

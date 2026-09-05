# Subly — Multilingual Movie & TV Subtitle Discovery Platform

**"Find subtitles in your language."**

Subly is a fast, mobile-first web application for discovering, organizing, validating, and downloading legally distributable movie and TV subtitles in multiple languages.

---

## 🌟 Features Included

- **Fast & Accurate Search**: Partial title matching, punctuation & year normalization, media type filtering (Movies vs. TV Shows), and instant language filtering.
- **Detailed Title Pages**: Slugs, posters, synopses, genres, runtimes, external IMDb/TMDB cross-references, and full season/episode structures for TV series.
- **Rich Subtitle Metadata**: Format identification (SRT, VTT, ASS), release versions (BluRay, WEB-DL, BDRip), quality scores, uploader details, and live download counters.
- **Verified Download Journey**: Secure download engine that records audit events and delivers formatted `.srt` or `.vtt` files with correct content disposition headers.
- **In-Browser Subtitle Previewer**: Interactive cue viewer with timestamp playback and line formatting.
- **Subtitle File Validator**: Structural syntax checker that catches malformed timecodes, reversed intervals, empty captions, and wide character limits.
- **Server-Side Gemini AI Utilities**:
  - Automatic language detection from dialogue cues.
  - Comprehensive quality report (timing check, reading speed CPS rating, grammar and sync analysis).
  - Accurate multilingual translation preserving strict SRT timecodes and sequence indices.
  - Subtitle cleanup (OCR typo repair, HTML tag stripping, casing normalization).
- **Community Requests & Upvoting**: Community members can request missing subtitles for titles and languages, with real-time voting.
- **Report & Moderation Workflow**: Report desynced or copyright-infringing subtitles with admin resolution actions.
- **Administrator Dashboard**:
  - Platform statistics (movies, subtitles, languages, total downloads, pending queue).
  - Movie CRUD operations.
  - Subtitle upload with live validation and auto-approve or moderation queue.
  - AI Subtitle Studio for translation and cleanup.
  - Community report resolver.
- **Legal & Trust Pages**: Terms of Service, Privacy Policy, and DMCA Copyright Policy.

---

## 🏗️ Architecture & Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion animations, Lucide React icons.
- **Backend API**: Node.js & Express server with TypeScript.
- **AI Engine**: `@google/genai` with `gemini-3.8-flash` running strictly server-side.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies and migrations.
- **Storage**: Supabase Storage (`subtitles/{movie-id}/{language-code}/{filename}`).

---

## 🚀 Environment Variables

Copy `.env.example` to `.env`:

```env
# Gemini API Key (accessed server-side only)
GEMINI_API_KEY="your-gemini-api-key"

# Supabase Credentials (for production Supabase integration)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# App URL
APP_URL="http://localhost:3000"
```

---

## 🗄️ Database Setup (Supabase)

The migration file is located in `/supabase/migrations/20260905000000_init_subly.sql`.

To apply to your Supabase project:
1. Log in to [Supabase Console](https://app.supabase.com).
2. Navigate to the **SQL Editor**.
3. Copy and run the contents of `supabase/migrations/20260905000000_init_subly.sql`.
4. The migration will configure:
   - `languages`, `movies`, `subtitles`, `subtitle_requests`, `favorites`, `downloads`, `reports` tables.
   - Foreign keys, cascading deletes, and performance GIN indexes.
   - Row Level Security (RLS) policies for public reads, user requests, and admin rights.
   - The `subtitles` storage bucket.

---

## 💻 Running the Application

### Development:
```bash
npm run dev
```
Starts the server at `http://localhost:3000` with Vite integration.

### Production Build:
```bash
npm run build
npm run start
```

---

## 🔒 Security & Legality

- Subly is architected exclusively for legally distributable, public-domain, licensed, or open-source subtitle files.
- Never place service-role keys or AI keys in client bundles.
- Download routes are audited to prevent abusive scraping.

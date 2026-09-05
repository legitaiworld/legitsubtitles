-- SUBLY Database Migration Schema (Supabase PostgreSQL)
-- Multilingual Movie & TV Subtitle Discovery Platform
-- Version 1.0 - September 2026

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Languages Table
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    flag VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Movies & TV Shows Table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    original_title TEXT,
    slug TEXT UNIQUE NOT NULL,
    year INTEGER NOT NULL,
    description TEXT,
    poster_url TEXT,
    imdb_id VARCHAR(20),
    tmdb_id VARCHAR(20),
    type VARCHAR(20) DEFAULT 'movie' CHECK (type IN ('movie', 'tv')),
    genres TEXT[] DEFAULT '{}',
    runtime VARCHAR(50),
    seasons_count INTEGER DEFAULT 1,
    episodes_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Subtitles Table
CREATE TABLE IF NOT EXISTS public.subtitles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE RESTRICT,
    file_path TEXT NOT NULL,
    file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('srt', 'vtt', 'ass', 'ssa')),
    release_name TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    quality_score INTEGER DEFAULT 95 CHECK (quality_score BETWEEN 0 AND 100),
    downloads INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
    uploaded_by TEXT DEFAULT 'Anonymous',
    content TEXT,
    season INTEGER,
    episode INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Subtitle Requests Table
CREATE TABLE IF NOT EXISTS public.subtitle_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_title TEXT NOT NULL,
    year INTEGER NOT NULL,
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE RESTRICT,
    requested_by TEXT DEFAULT 'Community Member',
    notes TEXT,
    votes INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fulfilled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, movie_id)
);

-- 7. Downloads Audit Log Table
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    subtitle_id UUID NOT NULL REFERENCES public.subtitles(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_hash TEXT
);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subtitle_id UUID NOT NULL REFERENCES public.subtitles(id) ON DELETE CASCADE,
    user_id UUID,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('desync', 'poor_translation', 'empty_or_corrupted', 'copyright', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for optimal lookup and search performance
CREATE INDEX IF NOT EXISTS idx_movies_slug ON public.movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_title ON public.movies USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_movies_year ON public.movies(year);
CREATE INDEX IF NOT EXISTS idx_subtitles_movie_lang ON public.subtitles(movie_id, language_id);
CREATE INDEX IF NOT EXISTS idx_subtitles_status ON public.subtitles(status);
CREATE INDEX IF NOT EXISTS idx_languages_code ON public.languages(code);

-- Storage bucket setup for Subtitle files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('subtitles', 'subtitles', true)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitle_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 1) Public Read Access
CREATE POLICY "Public read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Public read movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Public read approved subtitles" ON public.subtitles FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read requests" ON public.subtitle_requests FOR SELECT USING (true);

-- 2) Community submissions & votes
CREATE POLICY "Public insert requests" ON public.subtitle_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update request votes" ON public.subtitle_requests FOR UPDATE USING (true);
CREATE POLICY "Public insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert downloads" ON public.downloads FOR INSERT WITH CHECK (true);

-- 3) Admin full access
CREATE POLICY "Admin manage movies" ON public.movies USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin manage subtitles" ON public.subtitles USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin manage languages" ON public.languages USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin manage reports" ON public.reports USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

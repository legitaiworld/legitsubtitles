import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Search,
  Globe,
  Shield,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Movie, Language, Subtitle, SubtitleRequest, PlatformStats, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MovieCard } from './components/MovieCard';
import { MovieDetailView } from './components/MovieDetailView';
import { SubtitleViewerModal } from './components/SubtitleViewerModal';
import { AIStudioModal } from './components/AIStudioModal';
import { SubtitleUploadModal } from './components/SubtitleUploadModal';
import { RequestsView } from './components/RequestsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ReportModal } from './components/ReportModal';
import { LegalModal } from './components/LegalModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'languages' | 'requests' | 'admin' | 'detail'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Defaults to admin for AI Studio preview convenience

  // Core Data
  const [movies, setMovies] = useState<Movie[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [requests, setRequests] = useState<SubtitleRequest[]>([]);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'subtitles' | 'year' | 'title'>('subtitles');

  // Modals State
  const [viewerSubtitle, setViewerSubtitle] = useState<Subtitle | null>(null);
  const [aiStudioSubtitle, setAiStudioSubtitle] = useState<Subtitle | null>(null);
  const [reportSubtitle, setReportSubtitle] = useState<Subtitle | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMoviePreselect, setUploadMoviePreselect] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'dmca' | null>(null);

  // Request prefill when triggered from empty state
  const [requestPrefill, setRequestPrefill] = useState<{ title?: string; languageId?: string }>({});

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetching
  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      const [moviesRes, langsRes, statsRes, reqsRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/languages'),
        fetch('/api/stats'),
        fetch('/api/requests'),
      ]);

      if (moviesRes.ok) setMovies(await moviesRes.json());
      if (langsRes.ok) setLanguages(await langsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (reqsRes.ok) setRequests(await reqsRes.json());
    } catch (err: any) {
      showToast('error', 'Failed to connect to backend', err.message);
    }
  };

  // Movie selection handler
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subtitle Download Trigger
  const handleDownloadSubtitle = async (subtitle: Subtitle) => {
    try {
      const res = await fetch(`/api/subtitles/${subtitle.id}/download`);
      if (!res.ok) throw new Error('Download request failed');
      const text = await res.text();

      // Initiate browser download
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${subtitle.movie?.title || 'Subly'}.${subtitle.language?.code || 'sub'}.${subtitle.file_format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        'success',
        'Subtitle Downloaded',
        `${subtitle.movie?.title} (${subtitle.language?.name}) .${subtitle.file_format}`
      );

      // Refresh stats and movies download counters
      loadPlatformData();
    } catch (err: any) {
      showToast('error', 'Download failed', err.message);
    }
  };

  // Vote for request
  const handleVoteRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}/vote`, { method: 'POST' });
      if (!res.ok) throw new Error('Vote failed');
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, votes: updated.votes } : r)));
      showToast('success', 'Vote recorded', 'Thank you for helping prioritize community subtitles!');
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  // Empty state request handler
  const handleRequestSubtitleForMovie = (movie: Movie, langCode?: string) => {
    const matchedLang = langCode ? languages.find((l) => l.code === langCode) : undefined;
    setRequestPrefill({
      title: movie.title,
      languageId: matchedLang?.id,
    });
    setCurrentView('requests');
  };

  // Filtered movies list
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesOriginal = m.original_title?.toLowerCase().includes(q);
        const matchesGenres = m.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesOriginal && !matchesGenres) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;

      // Language filter
      if (languageFilter !== 'all') {
        const hasLang = m.available_languages?.some((l) => l.code === languageFilter);
        if (!hasLang) return false;
      }

      // Genre filter
      if (genreFilter !== 'all') {
        if (!m.genres.includes(genreFilter)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'subtitles') return (b.subtitles_count || 0) - (a.subtitles_count || 0);
      if (sortBy === 'year') return b.year - a.year;
      return a.title.localeCompare(b.title);
    });
  }, [movies, searchQuery, typeFilter, languageFilter, genreFilter, sortBy]);

  // Extract all unique genres for filter dropdown
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => {
          if (v !== 'detail') setSelectedMovie(null);
          setCurrentView(v as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'browse' && currentView !== 'home') {
            setCurrentView('browse');
          }
        }}
        pendingCount={stats?.pending_subtitles_count || 0}
        requestsCount={requests.filter((r) => r.status === 'open').length}
        userRole={userRole}
        onRoleChange={setUserRole}
        onOpenLegal={setLegalModalType}
      />

      {/* Main Views */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => {
                setCurrentView('browse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              selectedType={typeFilter}
              onTypeSelect={(t) => {
                setTypeFilter(t);
                setCurrentView('browse');
              }}
              popularLanguages={languages}
              onLanguageSelect={(langCode) => {
                setLanguageFilter(langCode);
                setCurrentView('browse');
              }}
              totalSubtitlesCount={stats?.subtitles_count || 0}
            />

            {/* Featured & Trending Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
              {/* Recently Added / Popular Titles */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <span>Trending Titles & Subtitles</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Verified subtitles with high quality scores, accurate time synchronizations, and active community downloads.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView('browse');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Browse All ({movies.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.slice(0, 8).map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onSelect={handleSelectMovie} />
                  ))}
                </div>
              </div>

              {/* Subly Feature Highlights (3-Pillar Sleek Value Grid) */}
              <div className="border-t border-slate-200 pt-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Why Cinephiles & Translators Trust Subly</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Engineered for precision timing, complete transparency, and universal multilingual access.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-100 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">Strict Timeline Validation</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        Every upload is verified through our deterministic subtitle engine to eliminate overlapping cues, negative durations, and corrupted character encodings.
                      </p>
                    </div>
                    <div className="mt-4 text-[11px] text-indigo-600 font-medium">
                      &bull; Zero timing drift guarantee
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-100 shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">Gemini AI Translation & Audit</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        Inspect reading speed (characters per second), auto-repair OCR scanning artifacts, or translate cues into 50+ languages while preserving exact timestamp brackets.
                      </p>
                    </div>
                    <div className="mt-4 text-[11px] text-indigo-600 font-medium">
                      &bull; Powered by gemini-3.8-flash
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-100 shadow-xs">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">Legal & Public Domain Focus</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        Subly curates open-source, public domain, and community-licensed translations. Full DMCA compliance and active moderation protect contributors.
                      </p>
                    </div>
                    <div className="mt-4 text-[11px] text-emerald-600 font-medium">
                      &bull; Open subtitle preservation
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: BROWSE & SEARCH */}
        {currentView === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Browse Titles & Subtitles
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Showing {filteredMovies.length} matching movies & TV shows with downloadable subtitles
                </p>
              </div>

              {/* Search input in browse view */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, original name, genre..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                />
              </div>
            </div>

            {/* Filter controls row */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Media Type Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Format:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    <option value="all">All Formats</option>
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                  </select>
                </div>

                {/* Language Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Language:</span>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    <option value="all">All Languages</option>
                    {languages.map((l) => (
                      <option key={l.id} value={l.code}>
                        {l.flag} {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genre Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Genre:</span>
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    <option value="all">All Genres</option>
                    {allGenres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs"
                >
                  <option value="subtitles">Most Subtitles</option>
                  <option value="year">Release Year</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredMovies.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3 shadow-xs">
                <Film className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No titles match your active filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing the search query or selecting "All Languages" to browse available content.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setLanguageFilter('all');
                      setGenreFilter('all');
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onSelect={handleSelectMovie} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: POPULAR LANGUAGES */}
        {currentView === 'languages' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Languages Catalog
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Explore subtitles organized across 14+ supported languages. Select any language to view all titles with available synchronized subtitles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {languages.map((lang) => {
                const count = movies.filter((m) =>
                  m.available_languages?.some((l) => l.code === lang.code)
                ).length;

                return (
                  <div
                    key={lang.id}
                    onClick={() => {
                      setLanguageFilter(lang.code);
                      setCurrentView('browse');
                    }}
                    className="cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {lang.name}
                        </div>
                        <div className="text-xs text-slate-500">{lang.native_name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-700 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100">
                        {count} {count === 1 ? 'Title' : 'Titles'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: SUBTITLE REQUESTS */}
        {currentView === 'requests' && (
          <RequestsView
            requests={requests}
            languages={languages}
            movies={movies}
            onVote={handleVoteRequest}
            onRequestCreated={loadPlatformData}
            onShowToast={showToast}
            initialMovieTitle={requestPrefill.title}
            initialLanguageId={requestPrefill.languageId}
          />
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboardView
            stats={stats}
            movies={movies}
            languages={languages}
            onRefreshData={loadPlatformData}
            onOpenUploadModal={(movieId) => {
              setUploadMoviePreselect(movieId);
              setIsUploadModalOpen(true);
            }}
            onPreviewSubtitle={(sub) => setViewerSubtitle(sub)}
            onAiAnalyzeSubtitle={(sub) => setAiStudioSubtitle(sub)}
            onShowToast={showToast}
          />
        )}

        {/* VIEW: MOVIE DETAIL */}
        {currentView === 'detail' && selectedMovie && (
          <MovieDetailView
            movie={selectedMovie}
            onBack={() => setCurrentView('browse')}
            languages={languages}
            onDownload={handleDownloadSubtitle}
            onPreview={(sub) => setViewerSubtitle(sub)}
            onAiAnalyze={(sub) => setAiStudioSubtitle(sub)}
            onReport={(sub) => setReportSubtitle(sub)}
            onRequestSubtitle={handleRequestSubtitleForMovie}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Subtitle Cue Reader / Viewer Modal */}
      {viewerSubtitle && (
        <SubtitleViewerModal
          subtitle={viewerSubtitle}
          onClose={() => setViewerSubtitle(null)}
          onDownload={handleDownloadSubtitle}
        />
      )}

      {/* Gemini AI Studio Modal */}
      {aiStudioSubtitle && (
        <AIStudioModal
          subtitle={aiStudioSubtitle}
          onClose={() => setAiStudioSubtitle(null)}
          onShowToast={showToast}
        />
      )}

      {/* Subtitle Upload Modal */}
      {isUploadModalOpen && (
        <SubtitleUploadModal
          movies={movies}
          languages={languages}
          preselectedMovieId={uploadMoviePreselect}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadMoviePreselect(undefined);
          }}
          onSuccess={() => {
            loadPlatformData();
            if (selectedMovie) {
              setSelectedMovie({ ...selectedMovie });
            }
          }}
          onShowToast={showToast}
          isAdmin={userRole === 'admin'}
        />
      )}

      {/* Report Modal */}
      {reportSubtitle && (
        <ReportModal
          subtitle={reportSubtitle}
          onClose={() => setReportSubtitle(null)}
          onShowToast={showToast}
        />
      )}

      {/* Legal / Policy Modal */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                  CC
                </div>
                <span>Subly</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The open, reliable, and verified movie and TV subtitle discovery platform. Providing fast downloads, synchronized timestamps, and AI-powered translations.
              </p>
            </div>

            <div>
              <div className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
                Explore
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentView('browse')} className="hover:text-indigo-600 transition-colors">
                    Search All Subtitles
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('languages')} className="hover:text-indigo-600 transition-colors">
                    Browse 14+ Languages
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('requests')} className="hover:text-indigo-600 transition-colors">
                    Community Requests
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setUploadMoviePreselect(undefined);
                      setIsUploadModalOpen(true);
                    }}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Upload Subtitle (.srt / .vtt)
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
                Compliance & Legal
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setLegalModalType('terms')} className="hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModalType('privacy')} className="hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModalType('dmca')} className="hover:text-indigo-600 transition-colors text-indigo-700 font-medium">
                    DMCA & Copyright Takedowns
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
                Platform Architecture
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Full-stack Node.js/Express backend + React 19 SPA. All Gemini API interactions run securely server-side. Supabase-ready SQL schema with RLS and automated subtitle timing validation.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-mono text-emerald-700 font-semibold shadow-xs">
                  Backend: Online (Port 3000)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>&copy; {new Date().getFullYear()} Subly Platform. Built for cinema lovers and accessibility worldwide.</div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-600">SRT & WebVTT Verified</span>
              <span>&bull;</span>
              <span className="font-medium text-indigo-600">Gemini 3.8 Flash AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

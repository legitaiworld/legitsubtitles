import React, { useState, useEffect } from 'react';
import { ArrowLeft, Film, Tv, Clock, ExternalLink, MessageSquarePlus, Globe } from 'lucide-react';
import { Movie, Subtitle, Language } from '../types';
import { SubtitleCard } from './SubtitleCard';

interface MovieDetailViewProps {
  movie: Movie;
  onBack: () => void;
  languages: Language[];
  onDownload: (sub: Subtitle) => void;
  onPreview: (sub: Subtitle) => void;
  onAiAnalyze: (sub: Subtitle) => void;
  onReport: (sub: Subtitle) => void;
  onRequestSubtitle: (movie: Movie, languageId?: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
}

export const MovieDetailView: React.FC<MovieDetailViewProps> = ({
  movie,
  onBack,
  languages,
  onDownload,
  onPreview,
  onAiAnalyze,
  onReport,
  onRequestSubtitle,
  onShowToast,
}) => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('all');
  const [selectedSeason] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchSubtitles();
  }, [movie.id, selectedLanguageCode]);

  const fetchSubtitles = async () => {
    setLoading(true);
    try {
      let url = `/api/movies/${movie.slug}/subtitles?status=approved`;
      if (selectedLanguageCode !== 'all') {
        url += `&language=${selectedLanguageCode}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load subtitles');
      const data = await res.json();
      setSubtitles(data);
    } catch (err: any) {
      onShowToast('error', 'Error loading subtitles', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubtitles = subtitles.filter((s) => {
    if (movie.type === 'tv' && selectedSeason !== 'all' && s.season !== undefined) {
      return s.season === selectedSeason;
    }
    return true;
  });

  return (
    <div id="movie-detail-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        id="back-to-browse-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Titles</span>
      </button>

      {/* Hero Movie Banner & Metadata */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row gap-8 shadow-sm relative overflow-hidden">
        {/* Poster */}
        <div className="relative z-10 w-44 sm:w-56 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-md bg-slate-100 border border-slate-200 mx-auto md:mx-0">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Details text */}
        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 flex items-center gap-1.5">
                {movie.type === 'tv' ? <Tv className="w-3.5 h-3.5 text-indigo-600" /> : <Film className="w-3.5 h-3.5 text-indigo-600" />}
                {movie.type === 'tv' ? 'TV Series' : 'Feature Film'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                {movie.year}
              </span>
              {movie.runtime && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {movie.runtime}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {movie.title}
            </h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="text-sm text-slate-500 italic mt-1 font-serif">
                Original Title: {movie.original_title}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {movie.description}
            </p>
          </div>

          {/* External Links and TV Seasons */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              {movie.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200 transition-colors font-semibold shadow-xs"
                >
                  <span>IMDb</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {movie.tmdb_id && (
                <a
                  href={`https://www.themoviedb.org/${movie.type}/${movie.tmdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100/80 border border-sky-200 transition-colors font-semibold shadow-xs"
                >
                  <span>TMDB</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              id="request-sub-for-movie-btn"
              onClick={() => onRequestSubtitle(movie)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors font-semibold text-xs shadow-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Request Subtitle for this Title</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtitles Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Available Subtitles</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                {subtitles.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by language or select an approved release version to download.
            </p>
          </div>

          {/* Language filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedLanguageCode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLanguageCode === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              All Languages
            </button>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguageCode(lang.code)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedLanguageCode === lang.code
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subtitles List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading approved subtitles...
          </div>
        ) : filteredSubtitles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3 shadow-xs">
            <Globe className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No subtitle found for this language.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our community and administrators regularly index and sync legal subtitles. You can request a translation or version below.
            </p>
            <div className="pt-2">
              <button
                id="empty-state-request-btn"
                onClick={() => onRequestSubtitle(movie, selectedLanguageCode !== 'all' ? selectedLanguageCode : undefined)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-200 transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Request Subtitle Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubtitles.map((sub) => (
              <SubtitleCard
                key={sub.id}
                subtitle={sub}
                onDownload={onDownload}
                onPreview={onPreview}
                onAiAnalyze={onAiAnalyze}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

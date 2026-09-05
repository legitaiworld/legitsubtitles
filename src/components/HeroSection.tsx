import React from 'react';
import { Search, Film, Tv, Sparkles, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  selectedType: string;
  onTypeSelect: (type: string) => void;
  popularLanguages: Language[];
  onLanguageSelect: (langId: string) => void;
  totalSubtitlesCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedType,
  onTypeSelect,
  popularLanguages,
  onLanguageSelect,
  totalSubtitlesCount,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-18 md:pb-22 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-b border-slate-200">
      {/* Subtle ambient indigo mesh */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12)_0%,transparent_60%)]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Multilingual Subtitle Platform &bull; {totalSubtitlesCount}+ Verified Subtitles</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight md:leading-tight">
          Find subtitles in <span className="text-indigo-600">your language.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          High-quality, timing-synchronized, and legally distributable movie and TV subtitles. Search, preview cues in your browser, and download instantly.
        </p>

        {/* Search Box Container */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3 justify-center text-xs font-medium">
            <button
              id="filter-type-all"
              onClick={() => onTypeSelect('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Formats
            </button>
            <button
              id="filter-type-movies"
              onClick={() => onTypeSelect('movie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'movie'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" /> Movies
            </button>
            <button
              id="filter-type-tv"
              onClick={() => onTypeSelect('tv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'tv'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> TV Shows
            </button>
          </div>

          <div className="relative flex items-center shadow-sm rounded-xl bg-white border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all p-1.5">
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="hero-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by movie title, original title, or TV show..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none py-2"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="px-2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
            <button
              id="hero-search-submit-btn"
              onClick={onSearchSubmit}
              className="ml-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex items-center gap-1.5 shrink-0 shadow-sm shadow-indigo-200"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Popular Languages Quick Bar */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs text-slate-500 font-medium mr-1">Popular Languages:</span>
          {popularLanguages.slice(0, 7).map((lang) => (
            <button
              key={lang.id}
              id={`hero-lang-${lang.code}`}
              onClick={() => onLanguageSelect(lang.code)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 shadow-xs transition-all"
            >
              <span>{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {lang.subtitles_count !== undefined && lang.subtitles_count > 0 && (
                <span className="text-[10px] text-indigo-600 font-semibold">({lang.subtitles_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Film, Tv, Clock, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  return (
    <div
      id={`movie-card-${movie.id}`}
      onClick={() => onSelect(movie)}
      className="group cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden shadow-xs"
    >
      {/* Poster area */}
      <div className="relative aspect-[16/10] sm:aspect-[2/3] w-full overflow-hidden bg-slate-100">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Media type and year overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[11px] font-semibold text-slate-800 border border-slate-200 shadow-xs flex items-center gap-1">
            {movie.type === 'tv' ? <Tv className="w-3 h-3 text-indigo-600" /> : <Film className="w-3 h-3 text-indigo-600" />}
            {movie.type === 'tv' ? 'TV Show' : 'Movie'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-xs">
            {movie.year}
          </span>
        </div>

        {/* Subtitles count pill */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {movie.subtitles_count || 0} {(movie.subtitles_count || 0) === 1 ? 'Sub' : 'Subs'}
          </span>
        </div>
      </div>

      {/* Info content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
            {movie.title}
          </h3>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="text-xs text-slate-500 italic line-clamp-1 mt-0.5">
              Original: {movie.original_title}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            {movie.runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {movie.runtime}
              </span>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <span className="line-clamp-1 text-slate-500">
                &bull; {movie.genres.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Available languages list */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-medium text-slate-500 mb-1.5">Languages available:</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {movie.available_languages && movie.available_languages.length > 0 ? (
              movie.available_languages.map((lang) => (
                <span
                  key={lang.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium"
                  title={lang.name}
                >
                  <span>{lang.flag}</span>
                  <span className="uppercase font-semibold text-[10px] text-slate-600">{lang.code}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400 italic">No approved subtitles yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

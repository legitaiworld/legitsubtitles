import React, { useState } from 'react';
import { Download, Eye, Sparkles, AlertTriangle, ShieldCheck, User, Calendar } from 'lucide-react';
import { Subtitle } from '../types';

interface SubtitleCardProps {
  subtitle: Subtitle;
  onDownload: (subtitle: Subtitle) => void;
  onPreview: (subtitle: Subtitle) => void;
  onAiAnalyze: (subtitle: Subtitle) => void;
  onReport: (subtitle: Subtitle) => void;
}

export const SubtitleCard: React.FC<SubtitleCardProps> = ({
  subtitle,
  onDownload,
  onPreview,
  onAiAnalyze,
  onReport,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload(subtitle);
    } finally {
      setIsDownloading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 85) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div
      id={`subtitle-card-${subtitle.id}`}
      className="rounded-xl bg-white border border-slate-200 p-4 transition-all hover:border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      {/* Subtitle Left info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-xl" role="img" aria-label="Flag">
            {subtitle.language?.flag || '🌐'}
          </span>
          <span className="font-bold text-slate-900 text-base">
            {subtitle.language?.name || 'Unknown'}
          </span>
          {subtitle.language?.native_name && subtitle.language.native_name !== subtitle.language.name && (
            <span className="text-xs text-slate-500">
              ({subtitle.language.native_name})
            </span>
          )}

          {/* Format badge */}
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold uppercase border border-slate-200">
            .{subtitle.file_format}
          </span>

          {/* Quality score badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getQualityColor(
              subtitle.quality_score
            )}`}
          >
            <ShieldCheck className="w-3 h-3" />
            {subtitle.quality_score}% Quality
          </span>

          {subtitle.season && subtitle.episode && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
              S{subtitle.season.toString().padStart(2, '0')}E{subtitle.episode.toString().padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Release name */}
        <div className="text-sm font-medium text-indigo-700 font-mono break-all line-clamp-1">
          {subtitle.release_name}
        </div>

        {/* Uploader, Date and Downloads count */}
        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            {subtitle.uploaded_by || 'Verified Contributor'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(subtitle.created_at)}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Download className="w-3 h-3 text-indigo-600" />
            {subtitle.downloads.toLocaleString()} downloads
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          id={`preview-sub-${subtitle.id}`}
          onClick={() => onPreview(subtitle)}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          title="Preview subtitle cues in browser"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Preview</span>
        </button>

        <button
          id={`ai-sub-${subtitle.id}`}
          onClick={() => onAiAnalyze(subtitle)}
          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 text-xs font-medium border border-indigo-100 transition-colors flex items-center gap-1.5"
          title="AI Quality Audit & Translation tools"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Studio</span>
        </button>

        <button
          id={`download-sub-${subtitle.id}`}
          onClick={handleDownloadClick}
          disabled={isDownloading}
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
        </button>

        <button
          id={`report-sub-${subtitle.id}`}
          onClick={() => onReport(subtitle)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Report issue with this subtitle"
          aria-label="Report issue"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

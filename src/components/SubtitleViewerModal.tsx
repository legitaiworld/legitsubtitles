import React, { useState, useMemo } from 'react';
import { X, Search, Download, Copy, Check, FileText } from 'lucide-react';
import { Subtitle } from '../types';

interface SubtitleViewerModalProps {
  subtitle: Subtitle | null;
  onClose: () => void;
  onDownload: (subtitle: Subtitle) => void;
}

interface ParsedCue {
  id: number;
  time: string;
  text: string;
}

export const SubtitleViewerModal: React.FC<SubtitleViewerModalProps> = ({
  subtitle,
  onClose,
  onDownload,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Parse raw SRT / VTT content into cues
  const cues: ParsedCue[] = useMemo(() => {
    if (!subtitle?.content) return [];
    const blocks = subtitle.content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
    const result: ParsedCue[] = [];
    let autoId = 1;

    for (const b of blocks) {
      const lines = b.trim().split('\n');
      const timeIdx = lines.findIndex((l) => l.includes('-->'));
      if (timeIdx !== -1) {
        const time = lines[timeIdx].trim();
        const text = lines.slice(timeIdx + 1).join('\n').trim();
        result.push({
          id: autoId++,
          time,
          text,
        });
      }
    }
    return result;
  }, [subtitle]);

  const filteredCues = useMemo(() => {
    if (!filterQuery) return cues;
    const q = filterQuery.toLowerCase();
    return cues.filter(
      (c) => c.text.toLowerCase().includes(q) || c.time.toLowerCase().includes(q)
    );
  }, [cues, filterQuery]);

  if (!subtitle) return null;

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(subtitle.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 leading-tight">
                  {subtitle.movie?.title || 'Subtitle Preview'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-mono text-slate-700 border border-slate-200">
                  .{subtitle.file_format}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {subtitle.language?.flag} {subtitle.language?.name} &bull; {subtitle.release_name}
              </p>
            </div>
          </div>

          <button
            id="close-subtitle-viewer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar with Search and Actions */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in dialogue or time..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 mr-1 hidden sm:inline">
              {filteredCues.length} of {cues.length} cues
            </span>

            <button
              onClick={handleCopyRaw}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={() => onDownload(subtitle)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Cue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-sans bg-slate-50/40">
          {filteredCues.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No dialogue lines matching "{filterQuery}"
            </div>
          ) : (
            filteredCues.map((cue) => (
              <div
                key={cue.id}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col gap-1 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-mono text-indigo-600">
                  <span className="text-slate-400 font-semibold">#{cue.id}</span>
                  <span className="font-semibold">{cue.time}</span>
                </div>
                <div className="text-slate-800 text-sm whitespace-pre-line leading-relaxed mt-0.5">
                  {cue.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>Format: {subtitle.file_format.toUpperCase()} &bull; Quality: {subtitle.quality_score}%</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

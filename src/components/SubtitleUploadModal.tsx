import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Sparkles, X, Loader2 } from 'lucide-react';
import { Movie, Language, SubtitleValidationReport } from '../types';

interface SubtitleUploadModalProps {
  movies: Movie[];
  languages: Language[];
  preselectedMovieId?: string;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
  isAdmin: boolean;
}

export const SubtitleUploadModal: React.FC<SubtitleUploadModalProps> = ({
  movies,
  languages,
  preselectedMovieId,
  onClose,
  onSuccess,
  onShowToast,
  isAdmin,
}) => {
  const [movieId, setMovieId] = useState(preselectedMovieId || (movies[0]?.id || ''));
  const [languageId, setLanguageId] = useState(languages[0]?.id || '');
  const [releaseName, setReleaseName] = useState('1080p.BluRay.x264-SublyRelease');
  const [version, setVersion] = useState('1.0');
  const [uploaderName] = useState(isAdmin ? 'Administrator' : 'Community Contributor');
  const [rawContent, setRawContent] = useState('');
  const [fileFormat, setFileFormat] = useState<'srt' | 'vtt'>('srt');
  const [autoApprove, setAutoApprove] = useState(isAdmin);
  const [validationReport, setValidationReport] = useState<SubtitleValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLang, setIsDetectingLang] = useState(false);

  // File upload reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.srt') && !file.name.endsWith('.vtt')) {
      onShowToast('error', 'Unsupported file type', 'Only .srt and .vtt subtitle files are supported.');
      return;
    }

    const detectedFormat = file.name.endsWith('.vtt') ? 'vtt' : 'srt';
    setFileFormat(detectedFormat);
    setReleaseName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawContent(text);
      validateContent(text, detectedFormat);
    };
    reader.readAsText(file);
  };

  const validateContent = async (text: string, format: 'srt' | 'vtt') => {
    if (!text.trim()) return;
    setIsValidating(true);
    try {
      const res = await fetch('/api/subtitles/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, format }),
      });
      if (res.ok) {
        const data = await res.json();
        setValidationReport(data);
      }
    } catch {
      // ignore
    } finally {
      setIsValidating(false);
    }
  };

  const handleAiDetectLanguage = async () => {
    if (!rawContent.trim()) {
      onShowToast('info', 'No content', 'Please paste subtitle content or upload a file first.');
      return;
    }
    setIsDetectingLang(true);
    try {
      const res = await fetch('/api/ai/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawContent }),
      });
      if (!res.ok) throw new Error('Language detection failed');
      const data = await res.json();
      const matched = languages.find(l => l.code.toLowerCase() === data.code?.toLowerCase() || l.name.toLowerCase() === data.language?.toLowerCase());
      if (matched) {
        setLanguageId(matched.id);
        onShowToast('success', `Language Detected: ${matched.name}`, `Confidence: ${Math.round(data.confidence * 100)}%`);
      } else {
        onShowToast('info', `Language Detected: ${data.language}`, 'Matched code: ' + data.code);
      }
    } catch (err: any) {
      onShowToast('error', 'Detection error', err.message);
    } finally {
      setIsDetectingLang(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) {
      onShowToast('error', 'Content missing', 'Subtitle file or text is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/subtitles/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie_id: movieId,
          language_id: languageId,
          file_format: fileFormat,
          release_name: releaseName,
          version,
          content: rawContent,
          uploaded_by: uploaderName,
          auto_approve: autoApprove,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit subtitle');
      }

      onShowToast(
        'success',
        autoApprove ? 'Subtitle Approved & Published' : 'Subtitle Submitted for Review',
        `Successfully validated and stored with ${data.validation?.captionCount || 'all'} cues.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      onShowToast('error', 'Upload failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload & Validate Subtitle</h3>
              <p className="text-xs text-slate-500">Strict timestamp and structure validation engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-white">
          {/* Movie & Language Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Movie or TV Show</label>
              <select
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                required
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">Language</label>
                <button
                  type="button"
                  onClick={handleAiDetectLanguage}
                  disabled={isDetectingLang || !rawContent}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  {isDetectingLang ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>Auto-detect with AI</span>
                </button>
              </div>
              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                required
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.flag} {l.name} ({l.native_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Release Name and Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Release Version / Tag</label>
              <input
                type="text"
                value={releaseName}
                onChange={(e) => setReleaseName(e.target.value)}
                placeholder="e.g. 1080p.BluRay.x264"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">File Format</label>
              <select
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
              >
                <option value="srt">SubRip (.srt)</option>
                <option value="vtt">WebVTT (.vtt)</option>
              </select>
            </div>
          </div>

          {/* Drag and Drop File input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Upload Subtitle File (.srt or .vtt)</label>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".srt,.vtt,text/plain"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Or paste subtitle text directly into the box below</p>
            </div>
          </div>

          {/* Raw Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-semibold">Subtitle Content (SRT / WebVTT)</label>
              <button
                type="button"
                onClick={() => validateContent(rawContent, fileFormat)}
                className="text-indigo-600 hover:text-indigo-700 text-[11px] font-semibold"
              >
                Run Validation Check
              </button>
            </div>
            <textarea
              rows={6}
              value={rawContent}
              onChange={(e) => {
                setRawContent(e.target.value);
                validateContent(e.target.value, fileFormat);
              }}
              placeholder={`1\n00:00:10,000 --> 00:00:14,000\nSample dialogue line here...`}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-mono text-xs focus:bg-white focus:border-indigo-600 focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Validation Feedback Banner */}
          {isValidating && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-600 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Parsing timestamps and evaluating syntax...</span>
            </div>
          )}

          {validationReport && (
            <div
              className={`p-3.5 rounded-xl border shadow-xs ${
                validationReport.isValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {validationReport.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span>
                  {validationReport.isValid ? 'Valid Subtitle Structure' : 'Validation Errors Detected'}
                </span>
                <span className="text-[11px] font-normal opacity-80">
                  ({validationReport.captionCount} cues &bull; Duration: {validationReport.durationFormatted})
                </span>
              </div>

              {validationReport.issues.length > 0 && (
                <ul className="space-y-1 mt-2 text-[11px] list-disc pl-4 opacity-90">
                  {validationReport.issues.slice(0, 4).map((issue, i) => (
                    <li key={i}>{issue.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Admin Auto-Approve Checkbox */}
          {isAdmin && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="auto-approve-checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <label htmlFor="auto-approve-checkbox" className="text-slate-700 font-medium cursor-pointer">
                Auto-approve and make downloadable immediately (Bypass moderation queue)
              </label>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (validationReport !== null && !validationReport.isValid)}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>{autoApprove ? 'Publish Subtitle' : 'Submit for Moderation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

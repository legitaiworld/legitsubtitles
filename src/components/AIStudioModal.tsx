import React, { useState } from 'react';
import { Sparkles, Languages, CheckCircle2, Wrench, Loader2, X, Download } from 'lucide-react';
import { Subtitle, AIQualityReport } from '../types';

interface AIStudioModalProps {
  subtitle: Subtitle | null;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({
  subtitle,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'quality' | 'translate' | 'clean'>('quality');
  const [isLoading, setIsLoading] = useState(false);
  const [qualityReport, setQualityReport] = useState<AIQualityReport | null>(null);

  // Translation State
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);

  // Cleanup State
  const [cleanedResult, setCleanedResult] = useState<string | null>(null);
  const [fixesApplied, setFixesApplied] = useState<string[]>([]);

  if (!subtitle) return null;

  // Run AI Quality Audit
  const handleRunQualityAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/quality-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: subtitle.content }),
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const data: AIQualityReport = await res.json();
      setQualityReport(data);
      onShowToast('success', 'AI Quality Audit Complete', `Assessed overall quality score: ${data.qualityScore}%`);
    } catch (err: any) {
      onShowToast('error', 'Analysis failed', err.message || 'Could not complete AI audit');
    } finally {
      setIsLoading(false);
    }
  };

  // Run AI Translation
  const handleRunTranslation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: subtitle.content, targetLanguage: targetLang }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setTranslatedResult(data.translatedContent);
      onShowToast('success', `Translation to ${targetLang} Complete`, `Translated ${data.translatedCuesCount || 'all'} subtitle cues with preserved timestamps.`);
    } catch (err: any) {
      onShowToast('error', 'Translation failed', err.message || 'Could not translate subtitle');
    } finally {
      setIsLoading(false);
    }
  };

  // Run AI Subtitle Clean
  const handleRunCleanup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: subtitle.content }),
      });
      if (!res.ok) throw new Error('Cleanup failed');
      const data = await res.json();
      setCleanedResult(data.cleanedContent);
      setFixesApplied(data.fixesApplied || []);
      onShowToast('success', 'Subtitle Cleaned Successfully', 'Standardized spacing, OCR typos, and formatting.');
    } catch (err: any) {
      onShowToast('error', 'Cleanup failed', err.message || 'Could not clean subtitle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadGenerated = (content: string, suffix: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subtitle.movie?.title || 'Subly'}_${suffix}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('success', 'Downloaded generated subtitle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 leading-tight">
                  Gemini Subtitle AI Studio
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {subtitle.movie?.title} &bull; {subtitle.language?.name} ({subtitle.release_name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/40 px-4 text-xs font-medium">
          <button
            id="tab-ai-quality"
            onClick={() => setActiveTab('quality')}
            className={`py-3 px-4 border-b-2 font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'quality'
                ? 'border-indigo-600 text-indigo-700 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Quality & Timing Audit</span>
          </button>
          <button
            id="tab-ai-translate"
            onClick={() => setActiveTab('translate')}
            className={`py-3 px-4 border-b-2 font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'translate'
                ? 'border-indigo-600 text-indigo-700 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>AI Translation</span>
          </button>
          <button
            id="tab-ai-clean"
            onClick={() => setActiveTab('clean')}
            className={`py-3 px-4 border-b-2 font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'clean'
                ? 'border-indigo-600 text-indigo-700 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Formatting & OCR Cleanup</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {/* TAB 1: QUALITY AUDIT */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Subtitle Quality & Readability Evaluation</h3>
                  <p className="text-xs text-slate-500">
                    Evaluates reading speed (characters per second), timestamp consistency, line lengths, and language fluency.
                  </p>
                </div>
                <button
                  id="run-ai-quality-btn"
                  onClick={handleRunQualityAudit}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{qualityReport ? 'Re-run Evaluation' : 'Run AI Evaluation'}</span>
                </button>
              </div>

              {qualityReport ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-medium">Overall Score</div>
                      <div className="text-2xl font-black text-indigo-600 mt-0.5">{qualityReport.qualityScore}/100</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-medium">Timing Accuracy</div>
                      <div className="text-sm font-bold text-emerald-700 capitalize mt-1.5">{qualityReport.timingAccuracy.replace('_', ' ')}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-medium">Reading Speed (CPS)</div>
                      <div className="text-sm font-bold text-indigo-700 capitalize mt-1.5">{qualityReport.cpsRating}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <div className="text-[11px] text-slate-500 font-medium">Detected Language</div>
                      <div className="text-sm font-bold text-slate-800 mt-1.5">{qualityReport.languageDetected}</div>
                    </div>
                  </div>

                  {/* Dark Indigo processing insight card matching Sleek Interface archetype */}
                  <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-md">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      AI Audit Summary
                    </h4>
                    <p className="text-sm text-indigo-50 leading-relaxed mt-2">{qualityReport.summary}</p>
                  </div>

                  {qualityReport.recommendations && qualityReport.recommendations.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Auditor Recommendations</h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {qualityReport.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <Sparkles className="w-8 h-8 text-indigo-500/70 mx-auto mb-2" />
                  <p className="text-sm text-slate-700 font-medium">No evaluation has been generated yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Run AI Evaluation" to trigger server-side Gemini analysis.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSLATE */}
          {activeTab === 'translate' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Translate Subtitle Preserving Timestamps</h3>
                  <p className="text-xs text-slate-500">
                    Gemini AI translates each dialogue segment while strictly preserving SRT cue indices and timestamp ranges.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Portuguese">Portuguese (Português)</option>
                    <option value="Italian">Italian (Italiano)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Chinese">Chinese (中文)</option>
                  </select>

                  <button
                    id="run-ai-translate-btn"
                    onClick={handleRunTranslation}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                    <span>Translate</span>
                  </button>
                </div>
              </div>

              {translatedResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Translated Output Preview:</span>
                    <button
                      onClick={() => handleDownloadGenerated(translatedResult, `translated_${targetLang}`)}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .SRT</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed shadow-xs">
                    {translatedResult}
                  </pre>
                </div>
              ) : (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <Languages className="w-8 h-8 text-indigo-500/70 mx-auto mb-2" />
                  <p className="text-sm text-slate-700 font-medium">Select target language and click Translate.</p>
                  <p className="text-xs text-slate-500 mt-1">Dialogue lines will be translated seamlessly.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLEANUP */}
          {activeTab === 'clean' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Subtitle Cleanup & Repair</h3>
                  <p className="text-xs text-slate-500">
                    Fixes OCR optical character bugs, strips broken HTML tags, normalizes casing, and removes redundant blank lines.
                  </p>
                </div>

                <button
                  id="run-ai-clean-btn"
                  onClick={handleRunCleanup}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                  <span>Run Cleanup</span>
                </button>
              </div>

              {cleanedResult ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 shadow-xs">
                    <div className="font-semibold mb-1">Fixes Applied:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {fixesApplied.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Cleaned Subtitle Preview:</span>
                    <button
                      onClick={() => handleDownloadGenerated(cleanedResult, 'cleaned')}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Cleaned .SRT</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed shadow-xs">
                    {cleanedResult}
                  </pre>
                </div>
              ) : (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <Wrench className="w-8 h-8 text-indigo-500/70 mx-auto mb-2" />
                  <p className="text-sm text-slate-700 font-medium">Click "Run Cleanup" to audit and sanitize this file.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-xs"
          >
            Close AI Studio
          </button>
        </div>
      </div>
    </div>
  );
};

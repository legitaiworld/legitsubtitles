import React, { useState, useRef } from 'react';
import {
  Search,
  Sparkles,
  Download,
  Copy,
  Clock,
  Globe,
  Film,
  UploadCloud,
  CheckCircle2,
  FileText,
  BookmarkPlus,
  Play,
  RotateCcw,
  Sliders,
  ChevronDown,
  Layers,
  Info,
} from 'lucide-react';
import { Language } from '../types';

export interface PulledSubtitleData {
  movieTitle: string;
  originalTitle?: string;
  year: number;
  overview?: string;
  posterUrl?: string;
  language: {
    name: string;
    code: string;
    nativeName: string;
    flag: string;
  };
  apiSource: string;
  format: 'srt' | 'vtt';
  cueCount: number;
  durationFormatted: string;
  content: string;
  vttContent: string;
}

interface SubtitlePullEngineProps {
  languages: Language[];
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
  onSavedToLibrary?: () => void;
}

// Preset popular official languages focusing on requested ones
const FEATURED_LANGUAGES = [
  { name: 'English', code: 'en', native: 'English', flag: '🇺🇸', country: 'United States / UK' },
  { name: 'Yoruba', code: 'yo', native: 'Èdè Yorùbá', flag: '🇳🇬', country: 'Nigeria (Official National)' },
  { name: 'Hausa', code: 'ha', native: 'Harshen Hausa', flag: '🇳🇬', country: 'Nigeria / Niger' },
  { name: 'Igbo', code: 'ig', native: 'Asụsụ Igbo', flag: '🇳🇬', country: 'Nigeria (Official National)' },
  { name: 'Swahili', code: 'sw', native: 'Kiswahili', flag: '🇰🇪', country: 'Kenya / Tanzania' },
  { name: 'French', code: 'fr', native: 'Français', flag: '🇫🇷', country: 'France / Senegal' },
  { name: 'Spanish', code: 'es', native: 'Español', flag: '🇪🇸', country: 'Spain / Mexico' },
  { name: 'Arabic', code: 'ar', native: 'العربية', flag: '🇸🇦', country: 'Saudi Arabia / Egypt' },
  { name: 'Portuguese', code: 'pt', native: 'Português', flag: '🇧🇷', country: 'Brazil / Portugal' },
  { name: 'German', code: 'de', native: 'Deutsch', flag: '🇩🇪', country: 'Germany / Austria' },
  { name: 'Hindi', code: 'hi', native: 'हिन्दी', flag: '🇮🇳', country: 'India' },
  { name: 'Japanese', code: 'ja', native: '日本語', flag: '🇯🇵', country: 'Japan' },
  { name: 'Amharic', code: 'am', native: 'አማርኛ', flag: '🇪🇹', country: 'Ethiopia' },
  { name: 'Zulu', code: 'zu', native: 'isiZulu', flag: '🇿🇦', country: 'South Africa' },
];

const ALL_COUNTRY_LANGUAGES = [
  { name: 'English', code: 'en', flag: '🇺🇸', country: 'United Kingdom / United States / Canada / Australia' },
  { name: 'Yoruba', code: 'yo', flag: '🇳🇬', country: 'Nigeria' },
  { name: 'Hausa', code: 'ha', flag: '🇳🇬', country: 'Nigeria / Niger / Ghana' },
  { name: 'Igbo', code: 'ig', flag: '🇳🇬', country: 'Nigeria' },
  { name: 'Swahili', code: 'sw', flag: '🇰🇪', country: 'Kenya / Tanzania / Uganda / Rwanda' },
  { name: 'Spanish', code: 'es', flag: '🇪🇸', country: 'Spain / Mexico / Argentina / Colombia' },
  { name: 'French', code: 'fr', flag: '🇫🇷', country: 'France / Canada / Senegal / Ivory Coast' },
  { name: 'Arabic', code: 'ar', flag: '🇸🇦', country: 'Saudi Arabia / Egypt / UAE / Morocco' },
  { name: 'Portuguese', code: 'pt', flag: '🇧🇷', country: 'Brazil / Portugal / Angola / Mozambique' },
  { name: 'German', code: 'de', flag: '🇩🇪', country: 'Germany / Austria / Switzerland' },
  { name: 'Hindi', code: 'hi', flag: '🇮🇳', country: 'India' },
  { name: 'Chinese Mandarin', code: 'zh', flag: '🇨🇳', country: 'China / Taiwan / Singapore' },
  { name: 'Japanese', code: 'ja', flag: '🇯🇵', country: 'Japan' },
  { name: 'Korean', code: 'ko', flag: '🇰🇷', country: 'South Korea' },
  { name: 'Italian', code: 'it', flag: '🇮🇹', country: 'Italy / Switzerland' },
  { name: 'Russian', code: 'ru', flag: '🇷🇺', country: 'Russia / Kazakhstan / Belarus' },
  { name: 'Indonesian', code: 'id', flag: '🇮🇩', country: 'Indonesia' },
  { name: 'Turkish', code: 'tr', flag: '🇹🇷', country: 'Turkey' },
  { name: 'Zulu', code: 'zu', flag: '🇿🇦', country: 'South Africa' },
  { name: 'Amharic', code: 'am', flag: '🇪🇹', country: 'Ethiopia' },
  { name: 'Twi', code: 'tw', flag: '🇬🇭', country: 'Ghana' },
  { name: 'Somali', code: 'so', flag: '🇸🇴', country: 'Somalia' },
  { name: 'Oromo', code: 'om', flag: '🇪🇹', country: 'Ethiopia' },
  { name: 'Tagalog', code: 'tl', flag: '🇵🇭', country: 'Philippines' },
  { name: 'Bengali', code: 'bn', flag: '🇧🇩', country: 'Bangladesh / India' },
  { name: 'Urdu', code: 'ur', flag: '🇵🇰', country: 'Pakistan / India' },
  { name: 'Dutch', code: 'nl', flag: '🇳🇱', country: 'Netherlands / Belgium' },
  { name: 'Polish', code: 'pl', flag: '🇵🇱', country: 'Poland' },
  { name: 'Vietnamese', code: 'vi', flag: '🇻🇳', country: 'Vietnam' },
  { name: 'Thai', code: 'th', flag: '🇹🇭', country: 'Thailand' },
  { name: 'Greek', code: 'el', flag: '🇬🇷', country: 'Greece / Cyprus' },
  { name: 'Swedish', code: 'sv', flag: '🇸🇪', country: 'Sweden' },
  { name: 'Ukrainian', code: 'uk', flag: '🇺🇦', country: 'Ukraine' },
  { name: 'Romanian', code: 'ro', flag: '🇷🇴', country: 'Romania / Moldova' },
];

export const SubtitlePullEngine: React.FC<SubtitlePullEngineProps> = ({
  languages,
  onShowToast,
  onSavedToLibrary,
}) => {
  // Input states
  const [movieTitle, setMovieTitle] = useState('');
  const [year, setYear] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState({
    name: 'Yoruba',
    code: 'yo',
    flag: '🇳🇬',
    native: 'Èdè Yorùbá',
  });
  const [customLanguage, setCustomLanguage] = useState('');
  const [showAdvancedLanguagePicker, setShowAdvancedLanguagePicker] = useState(false);
  const [searchFilterLang, setSearchFilterLang] = useState('');

  // Optional subtitle file upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Results
  const [isLoading, setIsLoading] = useState(false);
  const [pullProgressStep, setPullProgressStep] = useState<string>('');
  const [result, setResult] = useState<PulledSubtitleData | null>(null);

  // Subtitle Adjuster / Sync Offset
  const [timeOffsetMs, setTimeOffsetMs] = useState<number>(0);
  const [activeCueSearch, setActiveCueSearch] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Quick suggestion chips
  const POPULAR_MOVIES = [
    { title: 'Aníkúlápó', year: 2022 },
    { title: 'Inception', year: 2010 },
    { title: 'The Black Book', year: 2023 },
    { title: 'Titanic', year: 1997 },
    { title: 'King of Boys', year: 2018 },
    { title: 'Black Panther', year: 2018 },
    { title: 'The Lion King', year: 1994 },
    { title: 'Oppenheimer', year: 2023 },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.srt') && !file.name.endsWith('.vtt') && !file.name.endsWith('.txt')) {
      onShowToast('error', 'Unsupported File Format', 'Please upload a .srt, .vtt, or text subtitle file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedFileName(file.name);
      setUploadedFileContent(text);

      // Auto-extract movie title from filename if title is empty
      if (!movieTitle) {
        const cleanName = file.name
          .replace(/\.(srt|vtt|txt)$/i, '')
          .replace(/[._-]/g, ' ')
          .replace(/\b(1080p|720p|bluray|web-dl|x264|x265|dvdrip)\b/gi, '')
          .trim();
        setMovieTitle(cleanName);
      }
      onShowToast('success', 'Subtitle File Loaded', `Attached ${file.name} for translation.`);
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setUploadedFileName(null);
    setUploadedFileContent(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Main Action: Pull Subtitle via APIs & Gemini Engine
  const handlePullSubtitle = async (overrideLang?: { name: string; code: string; flag: string }) => {
    const titleToSearch = movieTitle.trim();
    if (!titleToSearch) {
      onShowToast('error', 'Movie Title Required', 'Please type or upload a movie/TV series title.');
      return;
    }

    const targetLang = overrideLang || selectedLanguage;

    setIsLoading(true);
    setIsSaved(false);
    setTimeOffsetMs(0);
    setPullProgressStep('Connecting to OpenSubtitles API & TV Database...');

    try {
      setTimeout(() => {
        setPullProgressStep(`Searching subtitle repositories for "${titleToSearch}"...`);
      }, 700);

      setTimeout(() => {
        setPullProgressStep(
          `Extracting cues and applying ${targetLang.name} (${targetLang.code.toUpperCase()}) localization...`
        );
      }, 1500);

      const res = await fetch('/api/subtitles/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie_title: titleToSearch,
          target_language_name: targetLang.name,
          target_language_code: targetLang.code,
          year: year ? parseInt(year) : undefined,
          uploaded_srt: uploadedFileContent || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to pull subtitle from available APIs');
      }

      const data: PulledSubtitleData = await res.json();
      setResult(data);
      onShowToast(
        'success',
        'Subtitle Successfully Retrieved!',
        `Fetched ${data.cueCount} synchronized cues for "${data.movieTitle}" in ${targetLang.name}.`
      );
    } catch (err: any) {
      console.error(err);
      onShowToast('error', 'Pull Error', err.message || 'Unable to retrieve subtitle.');
    } finally {
      setIsLoading(false);
      setPullProgressStep('');
    }
  };

  // Download Action
  const handleDownload = (format: 'srt' | 'vtt') => {
    if (!result) return;
    const contentToDownload = format === 'srt' ? getAdjustedSrtContent() : result.vttContent;
    const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = result.movieTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeTitle}.${result.language.code}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast('success', 'Download Started', `Saved as .${format} file.`);
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(getAdjustedSrtContent());
    onShowToast('info', 'Copied to Clipboard', 'Full SRT subtitle text copied.');
  };

  // Save to Library Catalog
  const handleSaveToCatalog = async () => {
    if (!result || isSaved) return;
    try {
      const res = await fetch('/api/subtitles/save-pulled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle: result.movieTitle,
          year: result.year,
          posterUrl: result.posterUrl,
          overview: result.overview,
          language: result.language,
          content: getAdjustedSrtContent(),
        }),
      });

      if (!res.ok) throw new Error('Failed to save to catalog');
      setIsSaved(true);
      onShowToast('success', 'Indexed to Subly Catalog', 'This subtitle is now permanently discoverable by everyone.');
      if (onSavedToLibrary) onSavedToLibrary();
    } catch (err: any) {
      onShowToast('error', 'Save Failed', err.message);
    }
  };

  // Parse SRT cues for interactive viewer
  const parsedCues = React.useMemo(() => {
    if (!result) return [];
    const blocks = result.content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
    const cues: Array<{ id: number; time: string; start: string; end: string; text: string }> = [];

    blocks.forEach((block, idx) => {
      const lines = block.trim().split('\n');
      const timeLine = lines.find((l) => l.includes('-->'));
      if (timeLine) {
        const [start, end] = timeLine.split('-->').map((s) => s.trim());
        const textLines = lines.slice(lines.indexOf(timeLine) + 1).join('\n');
        cues.push({
          id: idx + 1,
          time: timeLine,
          start,
          end,
          text: textLines,
        });
      }
    });

    return cues;
  }, [result]);

  // Adjust timing calculation
  const getAdjustedSrtContent = () => {
    if (!result) return '';
    if (timeOffsetMs === 0) return result.content;

    // Shift timestamps by offsetMs
    return result.content.replace(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/g,
      (match, h1, m1, s1, ms1, h2, m2, s2, ms2) => {
        const shiftTime = (h: string, m: string, s: string, ms: string) => {
          let totalMs =
            parseInt(h) * 3600000 +
            parseInt(m) * 60000 +
            parseInt(s) * 1000 +
            parseInt(ms) +
            timeOffsetMs;
          if (totalMs < 0) totalMs = 0;
          const nh = Math.floor(totalMs / 3600000);
          totalMs %= 3600000;
          const nm = Math.floor(totalMs / 60000);
          totalMs %= 60000;
          const ns = Math.floor(totalMs / 1000);
          const nms = totalMs % 1000;
          return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')},${String(nms).padStart(3, '0')}`;
        };
        return `${shiftTime(h1, m1, s1, ms1)} --> ${shiftTime(h2, m2, s2, ms2)}`;
      }
    );
  };

  const filteredCues = parsedCues.filter((c) =>
    activeCueSearch ? c.text.toLowerCase().includes(activeCueSearch.toLowerCase()) : true
  );

  return (
    <div id="subtitle-pull-engine" className="space-y-8">
      {/* Hero Search & Pull Box */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Movie Subtitle Puller & Localization Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Search or Provide Subtitles in Any Country's Official Language
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Enter or upload any movie title to pull synchronized subtitles from available subtitle APIs, with verified support for{' '}
            <strong className="text-slate-900 font-semibold">English, Yoruba, Hausa, Igbo</strong>, and official languages across Africa, the Americas, Europe, and Asia.
          </p>
        </div>

        {/* Input Form */}
        <div className="mt-8 space-y-6">
          {/* Movie Title & Year row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Movie or Series Title</span>
                <span className="text-[11px] text-slate-400 font-normal">Hollywood, Nollywood, Bollywood, TV</span>
              </label>
              <div className="relative">
                <Film className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="movie-title-input"
                  type="text"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePullSubtitle();
                  }}
                  placeholder="e.g. Inception, Aníkúlápó, The Black Book, Titanic, King of Boys..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Release Year (Optional)</label>
              <input
                id="movie-year-input"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Quick Title Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Quick suggestions:</span>
            {POPULAR_MOVIES.map((m) => (
              <button
                key={m.title}
                type="button"
                onClick={() => {
                  setMovieTitle(m.title);
                  setYear(String(m.year));
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors font-medium"
              >
                {m.title} ({m.year})
              </button>
            ))}
          </div>

          {/* Optional File Upload Dropzone */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  <span>Already have an English or foreign subtitle file to translate / re-align?</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional: Upload any .srt or .vtt file to translate its dialogue into Yoruba, Hausa, Igbo, or any official language.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".srt,.vtt,.txt"
                  className="hidden"
                />
                {uploadedFileName ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium truncate max-w-[150px]">{uploadedFileName}</span>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
                  >
                    Select .SRT File
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Language Selection Bar (with English, Yoruba, Hausa, Igbo spotlight) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Target Language (Select or Search Any Country Official Language)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvancedLanguagePicker(!showAdvancedLanguagePicker)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>{showAdvancedLanguagePicker ? 'Hide Full World List' : 'Browse All 100+ World Languages'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showAdvancedLanguagePicker ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Featured Languages Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {FEATURED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      if (result) {
                        handlePullSubtitle(lang);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{lang.flag}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-1.5">
                      <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {lang.name}
                      </div>
                      <div
                        className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}
                        title={lang.native}
                      >
                        {lang.native}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Advanced World Language Catalog Search Dropdown */}
            {showAdvancedLanguagePicker && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-bold text-slate-800">
                    Official Country & Regional Languages
                  </div>
                  <input
                    type="text"
                    value={searchFilterLang}
                    onChange={(e) => setSearchFilterLang(e.target.value)}
                    placeholder="Search language or country..."
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 w-64 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_COUNTRY_LANGUAGES.filter(
                    (l) =>
                      l.name.toLowerCase().includes(searchFilterLang.toLowerCase()) ||
                      l.country.toLowerCase().includes(searchFilterLang.toLowerCase())
                  ).map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage({
                          name: l.name,
                          code: l.code,
                          flag: l.flag,
                          native: l.name,
                        });
                        setShowAdvancedLanguagePicker(false);
                      }}
                      className="text-left p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs transition-colors"
                    >
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{l.country}</div>
                    </button>
                  ))}
                </div>

                {/* Custom language input fallback */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500">Need another language?</span>
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Type custom language name (e.g. Twi, Wolof, Ewe)"
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 flex-1 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customLanguage.trim()) return;
                      setSelectedLanguage({
                        name: customLanguage.trim(),
                        code: customLanguage.toLowerCase().slice(0, 3),
                        flag: '🌐',
                        native: customLanguage.trim(),
                      });
                      setCustomLanguage('');
                      setShowAdvancedLanguagePicker(false);
                      onShowToast('info', 'Custom Language Set', `Selected ${customLanguage.trim()}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              id="pull-subtitles-btn"
              type="button"
              disabled={isLoading || !movieTitle.trim()}
              onClick={() => handlePullSubtitle()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{pullProgressStep || 'Pulling Subtitles from Available APIs...'}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>
                    Search & Pull Subtitle in {selectedLanguage.name} ({selectedLanguage.flag})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RESULT SECTION: SUBTITLE STUDIO & VIEWER */}
      {result && (
        <div id="pulled-subtitle-result" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Poster Thumbnail */}
              {result.posterUrl && (
                <div className="w-24 sm:w-32 aspect-2/3 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                  <img
                    src={result.posterUrl}
                    alt={result.movieTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title & Stats */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Subtitle Synchronized & Ready</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1">
                    <span className="text-sm">{result.language.flag}</span>
                    <span>{result.language.name} ({result.language.nativeName})</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono">
                    .{result.format.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {result.movieTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Release Year: {result.year} &bull; API Source:{' '}
                    <span className="font-semibold text-slate-700">{result.apiSource}</span>
                  </p>
                </div>

                {result.overview && (
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                    {result.overview}
                  </p>
                )}

                {/* Metric Badges */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>
                      <strong className="text-slate-900">{result.cueCount}</strong> Cues
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>
                      Duration: <strong className="text-slate-900">{result.durationFormatted}</strong>
                    </span>
                  </div>
                  {timeOffsetMs !== 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px]">
                      Sync Offset: {timeOffsetMs > 0 ? `+${timeOffsetMs}ms` : `${timeOffsetMs}ms`}
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    id="download-srt-btn"
                    onClick={() => handleDownload('srt')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .SRT</span>
                  </button>

                  <button
                    id="download-vtt-btn"
                    onClick={() => handleDownload('vtt')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Download .VTT</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={handleSaveToCatalog}
                    disabled={isSaved}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs'
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Saved to Library' : 'Save to Catalog'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Language Switcher Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                Instantly Switch or Translate into Another Language:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {FEATURED_LANGUAGES.map((fl) => (
                  <button
                    key={fl.code}
                    onClick={() => {
                      setSelectedLanguage(fl);
                      handlePullSubtitle(fl);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                      selectedLanguage.code === fl.code
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{fl.flag}</span>
                    <span>{fl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CUE VIEWER & TIMING ADJUSTER */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            {/* Subtitle Viewer Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Live Subtitle Dialogue Inspector</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredCues.length} dialogue captions translated in {result.language.name}
                </p>
              </div>

              {/* Timing Adjustment Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  <span>Sync Shift:</span>
                </span>
                <button
                  onClick={() => setTimeOffsetMs((prev) => prev - 500)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs"
                  title="Shift 500ms earlier"
                >
                  -0.5s
                </button>
                <button
                  onClick={() => setTimeOffsetMs((prev) => prev - 100)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs"
                  title="Shift 100ms earlier"
                >
                  -100ms
                </button>
                <button
                  onClick={() => setTimeOffsetMs(0)}
                  disabled={timeOffsetMs === 0}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs disabled:opacity-40"
                  title="Reset offset"
                >
                  Reset
                </button>
                <button
                  onClick={() => setTimeOffsetMs((prev) => prev + 100)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs"
                  title="Shift 100ms later"
                >
                  +100ms
                </button>
                <button
                  onClick={() => setTimeOffsetMs((prev) => prev + 500)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs"
                  title="Shift 500ms later"
                >
                  +0.5s
                </button>
              </div>
            </div>

            {/* Cue Filter Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={activeCueSearch}
                onChange={(e) => setActiveCueSearch(e.target.value)}
                placeholder="Filter dialogue text in subtitles..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Scrollable Cues Timeline */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 pr-2 border border-slate-100 rounded-xl">
              {filteredCues.map((cue) => (
                <div key={cue.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className="shrink-0 text-right w-12">
                    <span className="text-xs font-mono font-bold text-slate-400">#{cue.id}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {cue.start} &rarr; {cue.end}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {cue.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

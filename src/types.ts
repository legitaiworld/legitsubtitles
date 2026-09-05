export type MediaType = 'movie' | 'tv';

export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa';

export type SubtitleStatus = 'pending' | 'approved' | 'rejected' | 'removed';

export type RequestStatus = 'open' | 'in_progress' | 'fulfilled';

export type ReportReason = 'desync' | 'poor_translation' | 'empty_or_corrupted' | 'copyright' | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export type UserRole = 'guest' | 'user' | 'admin';

export interface Movie {
  id: string;
  title: string;
  original_title?: string;
  slug: string;
  year: number;
  description: string;
  poster_url: string;
  imdb_id?: string;
  tmdb_id?: string;
  type: MediaType;
  genres: string[];
  runtime?: string;
  seasons_count?: number;
  episodes_count?: number;
  created_at: string;
  updated_at: string;
  available_languages?: Language[];
  subtitles_count?: number;
}

export interface Language {
  id: string;
  name: string;
  native_name: string;
  code: string;
  flag: string;
  subtitles_count?: number;
  created_at?: string;
}

export interface Subtitle {
  id: string;
  movie_id: string;
  language_id: string;
  file_path?: string;
  file_format: SubtitleFormat;
  release_name: string;
  version: string;
  quality_score: number;
  downloads: number;
  status: SubtitleStatus;
  uploaded_by: string;
  content: string;
  season?: number;
  episode?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  language?: Language;
  movie?: Movie;
}

export interface SubtitleRequest {
  id: string;
  movie_title: string;
  year: number;
  language_id: string;
  requested_by: string;
  notes?: string;
  votes: number;
  has_voted?: boolean;
  status: RequestStatus;
  created_at: string;
  language?: Language;
}

export interface SubtitleReport {
  id: string;
  subtitle_id: string;
  user_id: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  created_at: string;
  subtitle?: Subtitle;
}

export interface PlatformStats {
  movies_count: number;
  subtitles_count: number;
  languages_count: number;
  total_downloads: number;
  pending_subtitles_count: number;
  open_requests_count: number;
  unresolved_reports_count: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  line?: number;
  captionIndex?: number;
  message: string;
}

export interface SubtitleValidationReport {
  isValid: boolean;
  format: SubtitleFormat;
  captionCount: number;
  durationFormatted: string;
  totalCharacters: number;
  issues: ValidationIssue[];
}

export interface AIQualityReport {
  languageDetected: string;
  confidence: number;
  qualityScore: number;
  timingAccuracy: 'excellent' | 'good' | 'needs_adjustment' | 'critical_desync';
  cpsRating: 'optimal' | 'too_fast' | 'acceptable';
  grammarAndSpellingRating: 'pristine' | 'minor_fixes_needed' | 'poor';
  summary: string;
  recommendations: string[];
}

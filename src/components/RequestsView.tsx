import React, { useState } from 'react';
import { MessageSquarePlus, ThumbsUp, X, Plus } from 'lucide-react';
import { SubtitleRequest, Language, Movie } from '../types';

interface RequestsViewProps {
  requests: SubtitleRequest[];
  languages: Language[];
  movies: Movie[];
  onVote: (id: string) => void;
  onRequestCreated: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
  initialMovieTitle?: string;
  initialLanguageId?: string;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  languages,
  movies,
  onVote,
  onRequestCreated,
  onShowToast,
  initialMovieTitle,
  initialLanguageId,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Request Form State
  const [movieTitle, setMovieTitle] = useState(initialMovieTitle || '');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [languageId, setLanguageId] = useState(initialLanguageId || languages[0]?.id || '');
  const [requestedBy, setRequestedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle.trim() || !languageId) {
      onShowToast('error', 'Missing fields', 'Title and target language are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie_title: movieTitle,
          year: Number(year),
          language_id: languageId,
          requested_by: requestedBy || 'Anonymous Seeker',
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to create subtitle request');
      onShowToast('success', 'Subtitle Request Created', `Looking for ${movieTitle} in the requested language.`);
      setIsModalOpen(false);
      setMovieTitle('');
      setNotes('');
      onRequestCreated();
    } catch (err: any) {
      onShowToast('error', 'Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: SubtitleRequest['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Looking for Subtitle</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">In Translation</span>;
      case 'fulfilled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Fulfilled</span>;
    }
  };

  return (
    <div id="requests-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Subtitle Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
              {requests.length} Requests
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Can't find a subtitle in your preferred language? Submit a request to our community translators or upvote existing ones to prioritize timing syncs.
          </p>
        </div>

        <button
          id="open-request-modal-btn"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-200 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request New Subtitle</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            filterStatus === 'open'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          Open ({requests.filter(r => r.status === 'open').length})
        </button>
        <button
          onClick={() => setFilterStatus('fulfilled')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            filterStatus === 'fulfilled'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          Fulfilled ({requests.filter(r => r.status === 'fulfilled').length})
        </button>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            id={`request-item-${req.id}`}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(req.status)}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <span>{req.language?.flag}</span>
                  <span>{req.language?.name}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {req.movie_title}{' '}
                <span className="text-slate-500 font-normal">({req.year})</span>
              </h3>

              {req.notes && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  "{req.notes}"
                </p>
              )}

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Requested by {req.requested_by}</span>
                <span>&bull;</span>
                <span>{new Date(req.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Upvote button */}
            <div className="flex flex-col items-center shrink-0">
              <button
                id={`vote-req-${req.id}`}
                onClick={() => onVote(req.id)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-all group shadow-xs"
                title="Upvote this request"
              >
                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-600" />
                <span className="text-xs font-bold mt-1">{req.votes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating New Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request a Subtitle</h3>
                  <p className="text-xs text-slate-500">Ask the community or team to sync missing subtitles</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 text-xs bg-white">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Movie or TV Show Title</label>
                <input
                  type="text"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="e.g. Sita Sings the Blues or Metropolis"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Release Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Language</label>
                  <select
                    value={languageId}
                    onChange={(e) => setLanguageId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                    required
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.flag} {l.name} ({l.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Name or Alias</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="e.g. CinemaLover42"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Desired Release (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify particular release version (BluRay 1080p, Web-DL) or hearing-impaired SDH preference..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Subtitle, ReportReason } from '../types';

interface ReportModalProps {
  subtitle: Subtitle | null;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  subtitle,
  onClose,
  onShowToast,
}) => {
  const [reason, setReason] = useState<ReportReason>('desync');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!subtitle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      onShowToast('error', 'Description required', 'Please explain what needs fixing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtitle_id: subtitle.id,
          reason,
          description,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit report');
      onShowToast('success', 'Report Submitted', 'Our moderation team will review and address the issue.');
      onClose();
    } catch (err: any) {
      onShowToast('error', 'Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Report Subtitle Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-white">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500">Target File:</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {subtitle.movie?.title} &bull; {subtitle.language?.name}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{subtitle.release_name}</div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Issue Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
            >
              <option value="desync">Audio Desynchronization / Lag / Rush</option>
              <option value="poor_translation">Inaccurate or Machine Translation</option>
              <option value="empty_or_corrupted">Missing Dialogue or Corrupted Characters</option>
              <option value="copyright">Unauthorized or Copyright Dispute</option>
              <option value="other">Other / General Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dialogue drifts by ~2 seconds after the opening credits..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

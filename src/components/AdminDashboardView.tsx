import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, Trash2, Eye, FileText, Database, Sparkles, AlertTriangle } from 'lucide-react';
import { Subtitle, Movie, Language, PlatformStats, SubtitleReport } from '../types';

interface AdminDashboardViewProps {
  stats: PlatformStats | null;
  movies: Movie[];
  languages: Language[];
  onRefreshData: () => void;
  onOpenUploadModal: (movieId?: string) => void;
  onPreviewSubtitle: (sub: Subtitle) => void;
  onAiAnalyzeSubtitle: (sub: Subtitle) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  movies,
  languages,
  onRefreshData,
  onOpenUploadModal,
  onPreviewSubtitle,
  onAiAnalyzeSubtitle,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'catalog' | 'reports'>('pending');
  const [pendingSubtitles, setPendingSubtitles] = useState<Subtitle[]>([]);
  const [allSubtitles, setAllSubtitles] = useState<Subtitle[]>([]);
  const [reports, setReports] = useState<SubtitleReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [pendRes, allRes, repRes] = await Promise.all([
        fetch('/api/admin/subtitles/pending'),
        fetch('/api/subtitles?status=approved'),
        fetch('/api/admin/reports'),
      ]);

      if (pendRes.ok) setPendingSubtitles(await pendRes.json());
      if (allRes.ok) setAllSubtitles(await allRes.json());
      if (repRes.ok) setReports(await repRes.json());
    } catch (err: any) {
      onShowToast('error', 'Error loading admin data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/subtitles/${id}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Approve failed');
      onShowToast('success', 'Subtitle Approved', 'The subtitle is now public and indexed in discovery.');
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Error approving', err.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/subtitles/${id}/reject`, { method: 'PUT' });
      if (!res.ok) throw new Error('Reject failed');
      onShowToast('info', 'Subtitle Rejected', 'The subtitle was removed from the review queue.');
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Error rejecting', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this subtitle?')) return;
    try {
      const res = await fetch(`/api/admin/subtitles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      onShowToast('success', 'Subtitle Deleted', 'Removed permanently from catalog.');
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Error deleting', err.message);
    }
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Resolve failed');
      onShowToast('success', 'Report Resolved', `Action applied: ${action}`);
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Error resolving report', err.message);
    }
  };

  const totalDownloads = allSubtitles.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administration & Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
              Restricted Area
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review user-submitted subtitles, verify synchronization quality, manage copyright disputes, and upload official releases.
          </p>
        </div>

        <button
          id="admin-upload-btn"
          onClick={() => onOpenUploadModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-200 transition-all shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Upload & Sync Subtitle</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {stats?.pending_subtitles_count ?? pendingSubtitles.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Submissions awaiting audit</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Approved Subtitles</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats?.subtitles_count ?? allSubtitles.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active in discovery index</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Indexed Titles</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{movies.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Movies & TV series</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Downloads</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {(stats?.total_downloads ?? totalDownloads).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Served community downloads</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Pending Submissions ({pendingSubtitles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>All Subtitles ({allSubtitles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>User Reports & DMCA ({reports.filter((r) => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING SUBMISSIONS */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingSubtitles.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Moderation Queue Clear</h3>
              <p className="text-xs text-slate-500">All submitted subtitles have been audited and resolved.</p>
            </div>
          ) : (
            pendingSubtitles.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sub.language?.flag}</span>
                    <span className="font-bold text-slate-900 text-sm">{sub.movie?.title}</span>
                    <span className="text-xs text-slate-500">({sub.language?.name})</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                      Awaiting Review
                    </span>
                  </div>
                  <div className="text-xs font-mono text-indigo-700">{sub.release_name}</div>
                  <div className="text-[11px] text-slate-500">
                    Uploaded by <span className="text-slate-700 font-medium">{sub.uploaded_by}</span> &bull; {new Date(sub.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPreviewSubtitle(sub)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onAiAnalyzeSubtitle(sub)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-xs font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Audit</span>
                  </button>

                  <button
                    onClick={() => handleApprove(sub.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleReject(sub.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL SUBTITLES */}
      {activeTab === 'catalog' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Title & Language</th>
                  <th className="p-3.5">Release Version</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Downloads</th>
                  <th className="p-3.5">Quality</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSubtitles.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900">{sub.movie?.title}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <span>{sub.language?.flag}</span>
                        <span>{sub.language?.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-700 max-w-[200px] truncate">
                      {sub.release_name}
                    </td>
                    <td className="p-3.5 uppercase font-mono text-slate-600">
                      .{sub.file_format}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {sub.downloads.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px]">
                        {sub.quality_score}%
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-5 space-x-2">
                      <button
                        onClick={() => onPreviewSubtitle(sub)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium shadow-xs"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onAiAnalyzeSubtitle(sub)}
                        className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[11px] font-medium"
                      >
                        AI
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium"
                        title="Delete subtitle"
                      >
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS & DISPUTES */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Outstanding Disputes</h3>
              <p className="text-xs text-slate-500">There are no pending quality reports or copyright notices.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                      {rep.reason.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs text-slate-500">Report #{rep.id}</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    "{rep.details}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolveReport(rep.id, 'dismiss')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep.id, 'remove_subtitle')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-xs"
                  >
                    Remove Subtitle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

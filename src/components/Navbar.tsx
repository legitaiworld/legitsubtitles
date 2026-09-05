import React from 'react';
import { Search, Shield, UserCheck, Sparkles, DownloadCloud } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingCount: number;
  requestsCount: number;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'dmca') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  pendingCount,
  requestsCount,
  userRole,
  onRoleChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <span className="text-sm tracking-tight">CC</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Subly
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Find subtitles in your language</p>
              </div>
            </button>

            {/* Main Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <button
                id="nav-pull-btn"
                onClick={() => onNavigate('pull')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'pull' || currentView === 'home'
                    ? 'text-indigo-700 bg-indigo-50 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pull Subtitles (APIs)</span>
              </button>
              <button
                id="nav-browse-btn"
                onClick={() => onNavigate('browse')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'browse'
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse & Search
              </button>
              <button
                id="nav-languages-btn"
                onClick={() => onNavigate('languages')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'languages'
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Languages
              </button>
              <button
                id="nav-requests-btn"
                onClick={() => onNavigate('requests')}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'requests'
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Requests</span>
                {requestsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700">
                    {requestsCount}
                  </span>
                )}
              </button>
              <button
                id="nav-admin-btn"
                onClick={() => onNavigate('admin')}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Search bar & Role Switcher */}
          <div className="flex items-center gap-3">
            {currentView !== 'home' && (
              <div className="relative hidden lg:block w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="navbar-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Quick search titles..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs">
              <span className="text-slate-500 px-2 py-0.5 text-[11px] hidden sm:inline-flex items-center gap-1 font-medium">
                <UserCheck className="w-3 h-3 text-indigo-600" /> Role:
              </span>
              <button
                id="role-btn-guest"
                onClick={() => onRoleChange('guest')}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium text-xs ${
                  userRole === 'guest'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guest
              </button>
              <button
                id="role-btn-user"
                onClick={() => onRoleChange('user')}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium text-xs ${
                  userRole === 'user'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Contributor
              </button>
              <button
                id="role-btn-admin"
                onClick={() => onRoleChange('admin')}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium text-xs ${
                  userRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs bg-white">
          <button
            id="mobile-nav-pull"
            onClick={() => onNavigate('pull')}
            className={`py-1 px-2 rounded-md font-medium ${
              currentView === 'pull' || currentView === 'home' ? 'text-indigo-700 bg-indigo-50 font-semibold' : 'text-slate-600'
            }`}
          >
            Pull (APIs)
          </button>
          <button
            id="mobile-nav-browse"
            onClick={() => onNavigate('browse')}
            className={`py-1 px-2 rounded-md font-medium ${
              currentView === 'browse' ? 'text-indigo-700 bg-indigo-50 font-semibold' : 'text-slate-600'
            }`}
          >
            Browse
          </button>
          <button
            id="mobile-nav-languages"
            onClick={() => onNavigate('languages')}
            className={`py-1 px-2 rounded-md font-medium ${
              currentView === 'languages' ? 'text-indigo-700 bg-indigo-50 font-semibold' : 'text-slate-600'
            }`}
          >
            Languages
          </button>
          <button
            id="mobile-nav-requests"
            onClick={() => onNavigate('requests')}
            className={`py-1 px-2 rounded-md font-medium ${
              currentView === 'requests' ? 'text-indigo-700 bg-indigo-50 font-semibold' : 'text-slate-600'
            }`}
          >
            Requests {requestsCount > 0 && `(${requestsCount})`}
          </button>
          <button
            id="mobile-nav-admin"
            onClick={() => onNavigate('admin')}
            className={`py-1 px-2 rounded-md font-medium ${
              currentView === 'admin' ? 'text-indigo-700 bg-indigo-50 font-semibold' : 'text-slate-600'
            }`}
          >
            Admin {pendingCount > 0 && `(${pendingCount})`}
          </button>
        </div>
      </div>
    </header>
  );
};

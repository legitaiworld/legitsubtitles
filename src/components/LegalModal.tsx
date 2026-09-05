import React from 'react';
import { Scale, X } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'dmca' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'terms' && 'Terms of Service'}
                {type === 'privacy' && 'Privacy Policy'}
                {type === 'dmca' && 'DMCA & Copyright Compliance Policy'}
              </h3>
              <p className="text-xs text-slate-500">Subly Legal & Compliance Framework</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-600 leading-relaxed bg-white">
          {type === 'terms' && (
            <>
              <p className="font-semibold text-slate-800">Last updated: September 2026</p>
              <h4 className="text-sm font-bold text-slate-900 mt-3">1. Acceptance of Terms</h4>
              <p>
                By accessing and using Subly ("the Platform"), you agree to abide by these Terms of Service. If you disagree with any part of these terms, you must discontinue using our services.
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-3">2. Permitted Use</h4>
              <p>
                Subly provides subtitle metadata, open transcriptions, and synchronization tools for educational, accessibility, and personal viewing purposes. Users agree not to misuse the automated APIs or distribute corrupted or malicious text payloads.
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-3">3. Subtitle Submissions & Moderation</h4>
              <p>
                Contributors submitting subtitle text certify that their contributions do not infringe third-party trademarks and adhere to formatting standards. All files undergo automated parsing and admin quality screening.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p className="font-semibold text-slate-800">Last updated: September 2026</p>
              <h4 className="text-sm font-bold text-slate-900 mt-3">1. Information We Collect</h4>
              <p>
                Subly minimizes data collection. When requesting or reporting subtitles, we may record the alias provided and user-agent information necessary to prevent abusive scraping.
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-3">2. Cookies & Local State</h4>
              <p>
                We use localized storage to store your active language filters and role testing preferences. No personal tracking or cross-site ad networks are implemented.
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-3">3. AI Processing Security</h4>
              <p>
                Subtitle text evaluated through our Gemini AI utilities is processed via secure server-side tokens without persistent storage of prompt histories on third-party servers.
              </p>
            </>
          )}

          {type === 'dmca' && (
            <>
              <p className="font-semibold text-slate-800">Copyright & DMCA Compliance</p>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                Subly respects intellectual property rights and acts promptly under the Digital Millennium Copyright Act (17 U.S.C. § 512). Subly does not host video, audio, or streaming media.
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3">Takedown Request Process</h4>
              <p>
                If you are a copyright owner or authorized representative and believe any subtitle file on Subly infringes your intellectual property, please submit an issue through our Subtitle Report dialogue or email our designated agent at <span className="font-mono text-indigo-600 font-semibold">dmca@subly.internal</span> with:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The specific subtitle URL or unique Subtitle ID on Subly.</li>
                <li>Your contact information including email and telephone number.</li>
                <li>A statement of good faith belief and statement made under penalty of perjury.</li>
              </ul>
              <p className="mt-3">
                Upon valid notice, our administrators will disable access to or remove the identified file within 24 business hours.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-200 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

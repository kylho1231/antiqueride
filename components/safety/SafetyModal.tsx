'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { EMERGENCY_CONTACTS } from '@/lib/data/antique-data';
import {
  X,
  PhoneCall,
  Share2,
  AlertTriangle,
  Check,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SafetyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeRide, submitIncidentReport } = useAppState();
  const [tab, setTab] = useState<'HOTLINES' | 'SHARE' | 'REPORT'>('HOTLINES');
  const [copied, setCopied] = useState(false);

  // Report Form state
  const [reportCategory, setReportCategory] = useState<
    'SAFETY_CONCERN' | 'OVERCHARGING' | 'LOST_ITEM' | 'DRIVER_MISBEHAVIOR' | 'PRANK_OR_NO_SHOW' | 'VEHICLE_CONDITION'
  >('SAFETY_CONCERN');
  const [reportDescription, setReportDescription] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  if (!isOpen) return null;

  const shareUrl = activeRide
    ? `https://antiqueride.ph/track/${activeRide.id}`
    : 'https://antiqueride.ph/safety';

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    submitIncidentReport(reportCategory, reportDescription, activeRide?.id);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setReportDescription('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-300">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">AntiqueRide Passenger Safety Desk</h3>
              <p className="text-[11px] sm:text-xs text-blue-200">San Jose de Buenavista Emergency & Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            aria-label="Close safety desk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1 sm:p-1.5 gap-1">
          <button
            onClick={() => setTab('HOTLINES')}
            className={`flex-1 py-2.5 min-h-[44px] text-xs font-bold rounded-xl cursor-pointer transition-all ${
              tab === 'HOTLINES' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hotlines
          </button>
          <button
            onClick={() => setTab('SHARE')}
            className={`flex-1 py-2.5 min-h-[44px] text-xs font-bold rounded-xl cursor-pointer transition-all ${
              tab === 'SHARE' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Share My Trip
          </button>
          <button
            onClick={() => setTab('REPORT')}
            className={`flex-1 py-2.5 min-h-[44px] text-xs font-bold rounded-xl cursor-pointer transition-all ${
              tab === 'REPORT' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report Incident
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {tab === 'HOTLINES' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                <span className="font-bold">Notice:</span> AntiqueRide is not a substitute for municipal emergency responders. For immediate danger or crimes, please call the PNP or 911 directly.
              </div>

              <div className="space-y-2">
                {EMERGENCY_CONTACTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-slate-50/70 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-blue-700 mt-0.5 font-mono">{item.number}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.badge}</p>
                    </div>

                    <a
                      href={`tel:${item.number.split('/')[0].trim()}`}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'SHARE' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50/80 rounded-2xl border border-blue-100">
                <Share2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-black text-sm text-blue-950">Share Active Ride Details</h4>
                <p className="text-xs text-blue-800 mt-1 max-w-sm mx-auto">
                  Send a live tracking link to your family, guardian, or friends. They can see your driver body number, plate, and pickup status.
                </p>
              </div>

              {activeRide ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-bold text-slate-800">{activeRide.driverName || 'Matching...'}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Body Number:</span>
                    <span className="font-bold text-slate-800">{activeRide.driverBodyNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-bold text-slate-800 text-right">{activeRide.pickupName} → {activeRide.destinationName}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center italic">
                  No active trip right now. You can still copy the general safety verification link below.
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-700 select-all"
                />
                <button
                  onClick={handleCopyShare}
                  className="px-4 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-blue-200" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'REPORT' && (
            <div>
              {submittedMessage ? (
                <div className="p-6 text-center bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-2">
                  <Check className="w-8 h-8 text-blue-600 mx-auto" />
                  <h4 className="font-black text-sm">Report Successfully Filed</h4>
                  <p className="text-xs text-blue-800">
                    Your report has been logged and forwarded to the San Jose de Buenavista Transport Grievance Board.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Incident Category
                    </label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 min-h-[44px]"
                    >
                      <option value="SAFETY_CONCERN">Safety Concern / Reckless Driving</option>
                      <option value="OVERCHARGING">Fare Overcharging / Ordinance Violation</option>
                      <option value="LOST_ITEM">Lost Item in Tricycle Sidecar</option>
                      <option value="DRIVER_MISBEHAVIOR">Driver Misbehavior / Discourtesy</option>
                      <option value="PRANK_OR_NO_SHOW">Prank Booking / No-Show</option>
                      <option value="VEHICLE_CONDITION">Poor Vehicle Condition / Smoke Belching</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Details of Incident
                    </label>
                    <textarea
                      rows={4}
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please specify location, tricycle body number, time, and circumstances..."
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                      required
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Complaints are reviewed by the AntiqueRide admin and verified against TODA records under Republic Act No. 10173 (Philippine Data Privacy Act).
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 min-h-[44px] bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors active:scale-[0.99]"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Submit Incident Report</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

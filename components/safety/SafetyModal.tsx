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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#102A43] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">AntiqueRide Passenger Safety Desk</h3>
              <p className="text-xs text-slate-300">San Jose de Buenavista Emergency & Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setTab('HOTLINES')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              tab === 'HOTLINES' ? 'bg-white text-[#102A43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hotlines
          </button>
          <button
            onClick={() => setTab('SHARE')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              tab === 'SHARE' ? 'bg-white text-[#102A43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Share My Trip
          </button>
          <button
            onClick={() => setTab('REPORT')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              tab === 'REPORT' ? 'bg-white text-[#102A43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report Incident
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {tab === 'HOTLINES' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                <span className="font-bold">Notice:</span> AntiqueRide is not a substitute for municipal emergency responders. For immediate danger or crimes, please call the PNP or 911 directly.
              </div>

              <div className="space-y-2">
                {EMERGENCY_CONTACTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-800 mt-0.5 font-mono">{item.number}</p>
                      <p className="text-[11px] text-slate-500">{item.badge}</p>
                    </div>

                    <a
                      href={`tel:${item.number.split('/')[0].trim()}`}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
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
              <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Share2 className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-emerald-950">Share Active Ride Details</h4>
                <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto">
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

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-700 select-all"
                />
                <button
                  onClick={handleCopyShare}
                  className="px-4 py-2.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'REPORT' && (
            <div>
              {submittedMessage ? (
                <div className="p-6 text-center bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Report Successfully Filed</h4>
                  <p className="text-xs text-emerald-800">
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
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
                      required
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Complaints are reviewed by the AntiqueRide admin and verified against TODA records under Republic Act No. 10173 (Philippine Data Privacy Act).
                  </p>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
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

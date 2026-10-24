'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { IncidentReport } from '@/lib/types';
import { AlertTriangle, CheckCircle, Clock, Shield, MessageSquare, Check } from 'lucide-react';

export default function IncidentDesk() {
  const { incidents, resolveIncident } = useAppState();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolveSubmit = (incidentId: string) => {
    if (!resolutionNotes.trim()) return;
    resolveIncident(incidentId, resolutionNotes);
    setResolvingId(null);
    setResolutionNotes('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#102A43]">
            Safety, Grievance & Lost-Item Resolution Desk
          </h3>
          <p className="text-xs text-slate-500">
            Triage passenger reports, TODA complaints, and lost belongings in San Jose de Buenavista
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-900 rounded-full border border-red-200">
          {incidents.filter((i) => i.status !== 'RESOLVED').length} Active
        </span>
      </div>

      <div className="space-y-3">
        {incidents.map((inc) => {
          const isResolved = inc.status === 'RESOLVED';

          return (
            <div
              key={inc.id}
              className={`p-4 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-slate-50/60 border-slate-200'
                  : 'bg-amber-50/40 border-amber-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {inc.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Report by: {inc.reporterName} ({inc.reporterRole})
                    </span>
                    {inc.driverBodyNumber && (
                      <span className="text-[10px] font-mono font-bold bg-[#102A43] text-white px-1.5 py-0.5 rounded">
                        Unit #{inc.driverBodyNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-2 font-medium">{inc.description}</p>
                </div>

                {!isResolved && (
                  <button
                    onClick={() => setResolvingId(inc.id)}
                    className="px-3 py-1.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs w-fit"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Report</span>
                  </button>
                )}
              </div>

              {isResolved && inc.actionTakenNotes && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-emerald-900 bg-emerald-50/60 p-2.5 rounded-xl">
                  <span className="font-bold">Resolution Recorded:</span> {inc.actionTakenNotes}
                </div>
              )}

              {/* Resolution Form Drawer */}
              {resolvingId === inc.id && (
                <div className="mt-3 pt-3 border-t border-amber-200 space-y-2 text-xs">
                  <label className="block font-bold text-slate-800">
                    Official Action Taken / Settlement Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Coordinated with TTODA President. Driver issued advisory, item restored to passenger..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 resize-none"
                    required
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setResolvingId(null)}
                      className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolveSubmit(inc.id)}
                      className="px-4 py-1.5 bg-[#087F5B] hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Submit & Mark Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

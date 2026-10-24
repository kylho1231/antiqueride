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
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Safety, Grievance & Lost-Item Resolution Desk
          </h3>
          <p className="text-xs text-slate-500">
            Triage passenger reports, TODA complaints, and lost belongings in San Jose de Buenavista
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 bg-red-100 text-red-900 rounded-full border border-red-200">
          {incidents.filter((i) => i.status !== 'RESOLVED').length} Active
        </span>
      </div>

      <div className="space-y-3">
        {incidents.map((inc) => {
          const isResolved = inc.status === 'RESOLVED';

          return (
            <div
              key={inc.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-slate-50/60 border-slate-200'
                  : 'bg-amber-50/40 border-amber-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isResolved
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {inc.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Report by: {inc.reporterName} ({inc.reporterRole})
                    </span>
                    {inc.driverBodyNumber && (
                      <span className="text-[10px] font-mono font-bold bg-blue-700 text-white px-1.5 py-0.5 rounded">
                        Unit #{inc.driverBodyNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-2 font-medium">{inc.description}</p>
                </div>

                {!isResolved && (
                  <button
                    onClick={() => setResolvingId(inc.id)}
                    className="px-3.5 py-2 min-h-[38px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs w-fit"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Report</span>
                  </button>
                )}
              </div>

              {isResolved && inc.actionTakenNotes && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-blue-950 bg-blue-50/70 p-2.5 rounded-xl">
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
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 resize-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    required
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setResolvingId(null)}
                      className="px-3.5 py-2 min-h-[38px] rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolveSubmit(inc.id)}
                      className="px-4 py-2 min-h-[38px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
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

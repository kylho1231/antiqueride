'use client';

import React from 'react';
import { useAppState } from '@/lib/store/app-state';
import { Terminal } from '@/lib/types';
import { MapPin, Users, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function TerminalManager() {
  const { terminals, updateTerminalQueueMode } = useAppState();

  const handleToggleMode = (terminal: Terminal) => {
    const nextMode = terminal.queueMode === 'PILA' ? 'ON_DEMAND' : 'PILA';
    updateTerminalQueueMode(terminal.id, nextMode);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-slate-900">
            TODA Terminals & Station Dispatch Controls
          </h3>
          <p className="text-xs text-slate-500">
            Regulate queue pila policies and dispatch rules by terminal in San Jose de Buenavista
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200 w-fit">
          {terminals.length} Registered Stations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terminals.map((t) => {
          const isPhase2 = t.status === 'FIELD_VERIFICATION_PENDING';

          return (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPhase2
                  ? 'bg-slate-50/80 border-slate-200'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 truncate">{t.name}</span>
                    {isPhase2 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Phase 2 Pending
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {t.barangay}, {t.municipality} • TODA: <span className="font-semibold text-slate-800">{t.todaName}</span>
                  </p>
                </div>

                {/* Queue Mode Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleMode(t)}
                  className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0 ${
                    t.queueMode === 'PILA'
                      ? 'bg-slate-800 text-white hover:bg-slate-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title="Toggle Queue Mode"
                >
                  <span>{t.queueMode === 'PILA' ? 'Queue (Pila)' : 'On-Demand'}</span>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Terminal Capacity</span>
                  <span className="font-bold text-slate-800">{t.currentQueueCount} / {t.capacity} Units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">GPS Coordinates</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate block">
                    {t.coordinates.lat.toFixed(4)}° N, {t.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 bg-slate-100/70 p-2 rounded-lg truncate">
                <span className="font-semibold text-slate-700">Verification Source:</span> {t.verificationSource}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, PhoneCall, MapPin, RefreshCw, ShieldAlert, ArrowLeft } from 'lucide-react';
import { EMERGENCY_CONTACTS, VERIFIED_TERMINALS } from '@/lib/data/antique-data';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Offline Status Hero */}
      <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <WifiOff className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Offline Mode Active
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">No Internet Connection</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Live GPS vehicle telemetry and new ride dispatching require an active data connection. 
            However, your cached San Jose terminal directory and emergency hotlines remain fully accessible offline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={handleReload}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Reconnecting</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </Link>
        </div>
      </div>

      {/* Cached San Jose Emergency Hotlines */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Cached San Jose Emergency Hotlines</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Offline Safe</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {EMERGENCY_CONTACTS.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
              <span className="font-bold text-slate-900 block">{item.name}</span>
              <a
                href={`tel:${item.number.split('/')[0].trim()}`}
                className="font-mono font-bold text-blue-600 hover:text-blue-800 text-xs mt-1.5 flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{item.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Cached Terminals */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>San Jose de Buenavista Terminal Outposts</span>
          </h3>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            Local Cache
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {VERIFIED_TERMINALS.filter((t) => t.status === 'ACTIVE').map((term) => (
            <div key={term.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{term.name}</span>
                <span className="text-slate-500 text-[11px]">{term.barangay} • TODA: {term.todaName}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {term.queueMode === 'PILA' ? 'Queue Pila' : 'On-Demand'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

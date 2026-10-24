'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, PhoneCall, MapPin, RefreshCw } from 'lucide-react';
import { EMERGENCY_CONTACTS, VERIFIED_TERMINALS } from '@/lib/data/antique-data';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#102A43]">You are Offline</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          AntiqueRide requires an active mobile data connection for live GPS driver dispatch. However, your offline emergency contacts and terminal directories remain cached.
        </p>
        <button
          onClick={handleReload}
          className="px-6 py-3 bg-[#087F5B] hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 mx-auto cursor-pointer transition-colors shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Reconnecting</span>
        </button>
      </div>

      {/* Cached San Jose Emergency Hotlines */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-[#102A43]">
          Cached Emergency Hotlines (Antique, Philippines)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {EMERGENCY_CONTACTS.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block">{item.name}</span>
              <a
                href={`tel:${item.number.split('/')[0].trim()}`}
                className="font-mono font-bold text-emerald-800 text-xs mt-1 block flex items-center gap-1"
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
        <h3 className="font-extrabold text-sm text-[#102A43]">
          San Jose de Buenavista Terminal Outposts
        </h3>
        <div className="space-y-2 text-xs">
          {VERIFIED_TERMINALS.filter((t) => t.status === 'ACTIVE').map((term) => (
            <div key={term.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{term.name}</span>
                <span className="text-slate-500 text-[11px]">{term.barangay} • TODA: {term.todaName}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {term.queueMode}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

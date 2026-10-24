'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { formatCurrency } from '@/lib/utils';
import { Scale, FileText, Check, AlertCircle, Save } from 'lucide-react';

export default function FareOrdinanceManager() {
  const { farePolicy, updateFarePolicy } = useAppState();

  const [baseFareRegular, setBaseFareRegular] = useState(farePolicy.baseFareRegular);
  const [baseKmRegular, setBaseKmRegular] = useState(farePolicy.baseKmRegular);
  const [succeedingPerKmRegular, setSucceedingPerKmRegular] = useState(farePolicy.succeedingPerKmRegular);
  const [specialTripBaseFare, setSpecialTripBaseFare] = useState(farePolicy.specialTripBaseFare);
  const [sourceOrdinance, setSourceOrdinance] = useState(farePolicy.sourceOrdinance);
  const [approvalReference, setApprovalReference] = useState(farePolicy.approvalReference);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarePolicy({
      baseFareRegular: Number(baseFareRegular),
      baseKmRegular: Number(baseKmRegular),
      succeedingPerKmRegular: Number(succeedingPerKmRegular),
      specialTripBaseFare: Number(specialTripBaseFare),
      sourceOrdinance,
      approvalReference,
      verificationDate: new Date().toISOString().split('T')[0],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Municipal Fare Matrix & Ordinance Engine
          </h3>
          <p className="text-xs text-slate-500">
            Version-controlled fare rules for San Jose de Buenavista with auditable legal references
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-900 rounded-full border border-blue-200 w-fit">
          Audited & Active
        </span>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Fare matrix successfully updated and logged to platform audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Legal Ordinance Metadata */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Scale className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Official Sangguniang Bayan Legal Authority</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Source Ordinance</label>
              <input
                type="text"
                value={sourceOrdinance}
                onChange={(e) => setSourceOrdinance(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Approval Reference / Resolution</label>
              <input
                type="text"
                value={approvalReference}
                onChange={(e) => setApprovalReference(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Fare Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">Regular Base Fare</label>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400">₱</span>
              <input
                type="number"
                step="0.5"
                value={baseFareRegular}
                onChange={(e) => setBaseFareRegular(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400">Per passenger</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">Base Distance (km)</label>
            <input
              type="number"
              step="0.5"
              value={baseKmRegular}
              onChange={(e) => setBaseKmRegular(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
            <span className="text-[10px] text-slate-400">Initial bracket</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">Succeeding Rate / km</label>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400">₱</span>
              <input
                type="number"
                step="0.5"
                value={succeedingPerKmRegular}
                onChange={(e) => setBaseFareRegular(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400">Beyond base km</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">Special Trip (Pakyaw)</label>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400">₱</span>
              <input
                type="number"
                step="5"
                value={specialTripBaseFare}
                onChange={(e) => setSpecialTripBaseFare(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400">Chartered exclusive</span>
          </div>
        </div>

        {/* Mandatory Discounts Banner (Philippine Laws) */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs gap-2">
          <div>
            <span className="font-bold text-blue-950">Statutory 20% Mandatory Fare Discount</span>
            <p className="text-[11px] text-blue-800">
              Enforced for verified Students (RA 10642), Senior Citizens (RA 9994), and PWDs (RA 9442).
            </p>
          </div>
          <span className="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-lg shrink-0">
            20.0% Off
          </span>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save & Enforce Fare Changes</span>
        </button>
      </form>
    </div>
  );
}

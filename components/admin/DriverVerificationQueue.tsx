'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { Check, X, Shield, FileText, AlertCircle, Eye } from 'lucide-react';

export default function DriverVerificationQueue() {
  const { drivers, approveDriverVerification, rejectDriverVerification } = useAppState();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Expired MTOP franchise permit');
  const [selectedDriverForDoc, setSelectedDriverForDoc] = useState<any | null>(null);

  const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'PENDING');
  const verifiedDrivers = drivers.filter((d) => d.verificationStatus === 'VERIFIED');

  const handleConfirmReject = (driverId: string) => {
    rejectDriverVerification(driverId, rejectReason);
    setRejectingId(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#102A43]">
            Driver & Franchise Verification Desk
          </h3>
          <p className="text-xs text-slate-500">
            San Jose de Buenavista Tricycle Franchising & Regulatory Board (MTOP / LGU TMPSO)
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
          {pendingDrivers.length} Pending Approval
        </span>
      </div>

      {pendingDrivers.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
          No pending driver applications. All active drivers are authenticated and verified.
        </div>
      ) : (
        <div className="space-y-3">
          {pendingDrivers.map((driver) => (
            <div
              key={driver.id}
              className="p-4 bg-slate-50 border border-amber-200 rounded-2xl space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{driver.fullName}</h4>
                    <span className="text-[10px] font-extrabold bg-[#102A43] text-white px-2 py-0.5 rounded-md">
                      Unit #{driver.bodyNumber}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                      Pending Inspection
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Phone: {driver.phone} • Email: {driver.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDriverForDoc(driver)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Docs</span>
                  </button>

                  <button
                    onClick={() => approveDriverVerification(driver.id)}
                    className="px-3 py-1.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => setRejectingId(driver.id)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Compliance Checklist Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Driver License</span>
                  <span className="font-mono font-bold text-slate-800">{driver.licenseNumber}</span>
                  <span className="text-[10px] text-slate-500 block">Exp: {driver.licenseExpiry}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">LTO Plate Number</span>
                  <span className="font-mono font-bold text-slate-800">{driver.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">MTOP Franchise</span>
                  <span className="font-mono font-bold text-slate-800">{driver.franchiseMtopNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">TODA Membership</span>
                  <span className="font-bold text-slate-800">{driver.todaName}</span>
                </div>
              </div>

              {/* Reject reason drawer */}
              {rejectingId === driver.id && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-red-900 block">Provide Rejection Reason:</span>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-white border border-red-300 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Expired MTOP franchise permit">Expired MTOP franchise permit</option>
                    <option value="Unregistered vehicle plate on LTO database">Unregistered vehicle plate on LTO database</option>
                    <option value="Non-professional license without tricycle endorsement">Non-professional license without tricycle endorsement</option>
                    <option value="Unverified TODA membership credentials">Unverified TODA membership credentials</option>
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmReject(driver.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Verified Drivers Accordion / List */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Currently Authorized & Active Drivers ({verifiedDrivers.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {verifiedDrivers.map((vd) => (
            <div
              key={vd.id}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{vd.fullName}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    #{vd.bodyNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{vd.todaName}</p>
                <p className="text-[10px] text-slate-400">Plate: {vd.vehiclePlate} • {vd.totalTrips} trips</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active"></span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Review Modal */}
      {selectedDriverForDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-[#102A43]">
                Credentials: {selectedDriverForDoc.fullName}
              </h4>
              <button
                onClick={() => setSelectedDriverForDoc(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">LTO Driver License:</span>
                <span className="font-mono text-slate-900">{selectedDriverForDoc.licenseNumber} ({selectedDriverForDoc.licenseClassification})</span>
                <p className="text-slate-500 mt-1">Expiry Date: {selectedDriverForDoc.licenseExpiry}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Municipal Franchise (MTOP):</span>
                <span className="font-mono text-slate-900">{selectedDriverForDoc.franchiseMtopNumber}</span>
                <p className="text-slate-500 mt-1">LGU San Jose de Buenavista Valid until: {selectedDriverForDoc.mtopExpiry}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Tricycle Body & Plate:</span>
                <p className="text-slate-900 font-bold">Body #{selectedDriverForDoc.bodyNumber} • Plate: {selectedDriverForDoc.vehiclePlate}</p>
                <p className="text-slate-500">TODA: {selectedDriverForDoc.todaName}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDriverForDoc(null)}
              className="w-full py-2.5 bg-[#102A43] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close Document Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

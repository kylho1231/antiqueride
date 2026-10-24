'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { formatCurrency } from '@/lib/utils';
import {
  ShieldCheck,
  PhoneCall,
  Clock,
  MapPin,
  Navigation,
  KeyRound,
  XCircle,
  AlertCircle,
  CheckCircle,
  Car,
  User,
} from 'lucide-react';
import RatingModal from '@/components/commuter/RatingModal';

export default function ActiveRideCard() {
  const { activeRide, cancelRide, simulateDriverAcceptance } = useAppState();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found other ride');
  const [showRatingModal, setShowRatingModal] = useState(false);

  if (!activeRide) return null;

  const handleCancelSubmit = () => {
    cancelRide(activeRide.id, cancelReason, 'COMMUTER');
    setShowCancelModal(false);
  };

  const getStatusBadge = () => {
    switch (activeRide.status) {
      case 'REQUESTED':
        return { label: 'Finding Tricycle...', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'ACCEPTED':
        return { label: 'Driver Accepted', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'HEADING_TO_PICKUP':
        return { label: 'Tricycle En Route', bg: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
      case 'ARRIVED':
        return { label: 'Driver Arrived at Pickup', bg: 'bg-emerald-50 text-emerald-900 border-emerald-300' };
      case 'PASSENGER_VERIFIED':
      case 'TRIP_STARTED':
        return { label: 'Trip in Progress', bg: 'bg-blue-600 text-white border-blue-700' };
      case 'TRIP_COMPLETED':
        return { label: 'Trip Completed', bg: 'bg-slate-900 text-white border-slate-900' };
      default:
        return { label: activeRide.status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden space-y-4 p-5 animate-in fade-in">
        {/* Status Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {activeRide.rideType === 'SPECIAL' ? 'Special Pakyaw' : 'Regular Shared'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cash Payment: <span className="font-bold text-slate-900 font-mono">{formatCurrency(activeRide.fareAmount)}</span>
            </p>
          </div>

          {activeRide.status !== 'TRIP_COMPLETED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* 4-Digit Pickup Security PIN (Key Anti-Prank & Passenger Safety Feature) */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Pickup Security PIN</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Show this 4-digit PIN to your driver before boarding.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-2xs border border-blue-300 font-mono font-black text-2xl tracking-widest text-blue-900">
            {activeRide.pinCode}
          </div>
        </div>

        {/* Driver Details (When Accepted) */}
        {activeRide.driverName ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-2xs overflow-hidden border border-white">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{activeRide.driverName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-mono">
                    Body: {activeRide.driverBodyNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {activeRide.todaName || 'San Jose TODA'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Plate: {activeRide.driverPlate}
                </div>
              </div>
            </div>

            {activeRide.driverPhone && (
              <a
                href={`tel:${activeRide.driverPhone}`}
                className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                title="Call Driver"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 mx-auto animate-pulse">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950">
                Broadcasting to Online Drivers in San Jose de Buenavista...
              </p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Dispatch offer broadcasted live across authorized drivers (e.g. <strong>Jose "Nong Joe" Mendoza #SJB-042</strong>).
              </p>
            </div>

            {/* Pilot Testing Helper: Simulate Driver Accept or Switch Window */}
            <div className="pt-2 border-t border-blue-200/60 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={simulateDriverAcceptance}
                className="w-full sm:w-auto py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
              >
                <span>⚡ Simulate Driver Accept (Nong Joe)</span>
              </button>
            </div>
          </div>
        )}

        {/* Route Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup</span>
              <p className="font-bold text-slate-800">{activeRide.pickupName}</p>
            </div>
          </div>
          <div className="ml-1 w-0.5 h-4 bg-slate-200"></div>
          <div className="flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
              <p className="font-bold text-slate-800">{activeRide.destinationName}</p>
            </div>
          </div>
        </div>

        {/* Completion Prompt */}
        {activeRide.status === 'TRIP_COMPLETED' && (
          <div className="pt-2">
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Rate Your Driver</span>
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <h4 className="font-extrabold text-sm text-slate-900">Cancel Ride Request?</h4>
            <p className="text-xs text-slate-500">
              Please choose a reason for cancelling. Frequent repeated cancellations may be subject to review under Antique transport anti-abuse rules.
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="Found other ride">Found other ride on street</option>
              <option value="Wait time too long">Wait time too long</option>
              <option value="Wrong pickup location">Wrong pickup location entered</option>
              <option value="Change of plans">Change of plans</option>
            </select>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
              >
                Keep Ride
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          rideId={activeRide.id}
          driverName={activeRide.driverName || 'Driver'}
        />
      )}
    </>
  );
}

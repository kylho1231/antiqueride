'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import RatingModal from '@/components/commuter/RatingModal';

export default function ActiveRideCard() {
  const { activeRide, cancelRide, simulateDriverAcceptance } = useAppState();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found other ride');
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Trigger celebration confetti on Trip Completion (Section 6 Spec)
  useEffect(() => {
    if (activeRide && activeRide.status === 'TRIP_COMPLETED') {
      try {
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default || confettiModule;
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#087F5B', '#102A43', '#F5B301', '#FFFFFF'],
          });
        });
      } catch (e) {}
    }
  }, [activeRide?.status]);

  if (!activeRide) return null;

  const handleCancelSubmit = () => {
    cancelRide(activeRide.id, cancelReason, 'COMMUTER');
    setShowCancelModal(false);
  };

  const getStatusBadge = () => {
    switch (activeRide.status) {
      case 'REQUESTED':
        return { label: 'Broadcasting to Drivers...', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' };
      case 'ACCEPTED':
        return { label: 'Driver Assigned', bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300' };
      case 'HEADING_TO_PICKUP':
        return { label: 'Tricycle En Route', bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border-indigo-200' };
      case 'ARRIVED':
        return { label: 'Driver Arrived at Pickup', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300' };
      case 'PASSENGER_VERIFIED':
      case 'TRIP_STARTED':
        return { label: 'Trip in Progress', bg: 'bg-emerald-600 text-white border-emerald-700' };
      case 'TRIP_COMPLETED':
        return { label: 'Trip Completed 🎉', bg: 'bg-[#102A43] text-white border-slate-900' };
      default:
        return { label: activeRide.status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden space-y-4 p-4 sm:p-5 animate-in fade-in">
        {/* Status Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
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
              className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer px-3 py-2 min-h-[40px] rounded-xl hover:bg-red-50 transition-colors shrink-0"
            >
              Cancel
            </button>
          )}
        </div>

        {/* 4-Digit Pickup Security PIN (Key Anti-Prank & Passenger Safety Feature) */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Pickup Security PIN</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Show this 4-digit PIN to your driver before boarding.
            </p>
          </div>
          <div className="bg-white px-3.5 sm:px-4 py-2 rounded-xl shadow-2xs border border-blue-300 font-mono font-black text-xl sm:text-2xl tracking-widest text-blue-900 shrink-0">
            {activeRide.pinCode}
          </div>
        </div>

        {/* Driver Details (When Accepted) */}
        {activeRide.driverName ? (
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-2xs overflow-hidden border border-white shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-slate-900 truncate">{activeRide.driverName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-mono">
                    Body: {activeRide.driverBodyNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
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
                className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors shrink-0"
                title="Call Driver"
                aria-label="Call Driver"
              >
                <PhoneCall className="w-5 h-5" />
              </a>
            )}
          </div>
        ) : (
          <div className="p-5 bg-gradient-to-b from-emerald-50/80 to-slate-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl text-center space-y-3">
            {/* Cinematic Radar Expanding Location Rings (Section 6 Spec) */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center my-1">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-radar-pulse" />
              <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="relative w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30">
                <Car className="w-6 h-6" />
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-[#102A43] dark:text-white">
                Searching for Available Tricycles...
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-0.5 max-w-sm mx-auto">
                Broadcasting dispatch offer across authorized TODA drivers in San Jose de Buenavista.
              </p>
            </div>

            {/* Pilot Testing Helper: Simulate Driver Accept or Switch Window */}
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={simulateDriverAcceptance}
                className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
              >
                <span>⚡ Simulate Driver Accept (Pilot Test)</span>
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

        {/* Completion Prompt & Trip Summary (Section 6 Spec) */}
        {activeRide.status === 'TRIP_COMPLETED' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-1">
              <span className="text-xl">🎉</span>
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                You have arrived safely at your destination!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Fare: <strong className="font-mono">{formatCurrency(activeRide.fareAmount)}</strong> • Cash payment completed to driver {activeRide.driverName}.
              </p>
            </div>
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Rate Your Driver & Finish</span>
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <h4 className="font-black text-sm text-slate-900">Cancel Ride Request?</h4>
            <p className="text-xs text-slate-500">
              Please choose a reason for cancelling. Frequent repeated cancellations may be subject to review under Antique transport anti-abuse rules.
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                className="py-3 px-3 min-h-[44px] rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors active:scale-95"
              >
                Keep Ride
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                className="py-3 px-3 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors active:scale-95 shadow-sm"
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

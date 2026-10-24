'use client';

import React, { useState, useEffect } from 'react';
import { useAppState, playDispatchChime } from '@/lib/store/app-state';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Navigation, Clock, Check, X, ShieldAlert, Sparkles, Users, Volume2 } from 'lucide-react';

export default function IncomingRideModal() {
  const { activeRide, activeDriver, acceptRide, cancelRide } = useAppState();
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Show only if there is a requested ride waiting for acceptance and driver is online
  const isIncomingForDriver =
    activeRide &&
    activeRide.status === 'REQUESTED' &&
    activeDriver.isOnline &&
    activeDriver.verificationStatus === 'VERIFIED';

  useEffect(() => {
    if (!isIncomingForDriver) {
      setSecondsRemaining(30);
      return;
    }

    // Play initial attention-grabbing chime
    playDispatchChime('OFFER');
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300]);
      } catch (e) {}
    }

    // Periodic reminder chime every 7 seconds
    const chimeInterval = setInterval(() => {
      playDispatchChime('OFFER');
    }, 7000);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          clearInterval(chimeInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(chimeInterval);
    };
  }, [isIncomingForDriver]);

  if (!isIncomingForDriver) return null;

  const handleAccept = () => {
    acceptRide(activeRide.id);
  };

  const handleDecline = () => {
    cancelRide(activeRide.id, 'Driver declined request', 'DRIVER');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in slide-in-from-bottom">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
        {/* Header with Countdown Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
            <h4 className="font-extrabold text-sm text-slate-900">New Ride Request!</h4>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{secondsRemaining}s</span>
          </div>
        </div>

        {/* Fare & Service Type Card (Deep Navy & Gold) */}
        <div className="p-4 bg-gradient-to-br from-[#102A43] via-[#0B1E30] to-[#07151E] text-white rounded-2xl flex items-center justify-between border border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
              {activeRide.rideType === 'SPECIAL' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Special Trip (Pakyaw)</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5" />
                  <span>Regular Shared Trip</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">Passenger: <span className="font-bold text-white">{activeRide.commuterName}</span></p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Agreed Fare</span>
            <div className="text-2xl font-black text-amber-300">
              {formatCurrency(activeRide.fareAmount)}
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Pickup</span>
              <p className="font-bold text-slate-800">{activeRide.pickupName}</p>
            </div>
          </div>
          <div className="ml-1 w-0.5 h-3 bg-slate-200"></div>
          <div className="flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Destination</span>
              <p className="font-bold text-slate-800">{activeRide.destinationName}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Estimated Distance: {activeRide.estimatedDistanceKm} km</span>
            <span>Cash Collection</span>
          </div>
        </div>

        {/* Action Buttons: 44px+ touch targets */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleDecline}
            className="py-3.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
            <span>Decline</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/30 transition-all btn-spring"
          >
            <Check className="w-4 h-4" />
            <span>Accept Ride</span>
          </button>
        </div>
      </div>
    </div>
  );
}

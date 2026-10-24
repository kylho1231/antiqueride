'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { formatCurrency } from '@/lib/utils';
import {
  Navigation,
  MapPin,
  PhoneCall,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Car,
} from 'lucide-react';

export default function ActiveTripCard() {
  const {
    activeRide,
    activeDriver,
    driverStartHeading,
    driverMarkArrived,
    verifyPinAndStartTrip,
    completeTrip,
  } = useAppState();

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Show only if active ride is assigned to current driver
  if (
    !activeRide ||
    (activeRide.driverId !== activeDriver.id && activeRide.status !== 'REQUESTED') ||
    activeRide.status === 'REQUESTED'
  ) {
    return null;
  }

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const res = verifyPinAndStartTrip(activeRide.id, enteredPin);
    if (!res.success) {
      setPinError(res.error || 'Invalid PIN code.');
    } else {
      setEnteredPin('');
    }
  };

  const navUrl =
    activeRide.status === 'HEADING_TO_PICKUP' || activeRide.status === 'ACCEPTED'
      ? `https://www.google.com/maps/dir/?api=1&destination=${activeRide.pickupCoordinates.lat},${activeRide.pickupCoordinates.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${activeRide.destinationCoordinates.lat},${activeRide.destinationCoordinates.lng}`;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden space-y-4 p-5 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Active Assignment • Unit #{activeDriver.bodyNumber}
          </span>
          <h4 className="font-extrabold text-sm text-[#102A43] mt-1">
            Trip to {activeRide.destinationName}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400">Total Fare</span>
          <div className="text-base font-black text-emerald-800">
            {formatCurrency(activeRide.fareAmount)}
          </div>
        </div>
      </div>

      {/* Passenger Info & Quick Dial */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Passenger</span>
          <p className="font-bold text-xs text-slate-900">{activeRide.commuterName}</p>
          <p className="text-[11px] text-slate-500">{activeRide.commuterPhone}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Map Nav</span>
          </a>
          <a
            href={`tel:${activeRide.commuterPhone}`}
            className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Step-by-Step Dispatch Progress Controls */}
      {activeRide.status === 'ACCEPTED' && (
        <button
          type="button"
          onClick={() => driverStartHeading(activeRide.id)}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
        >
          <Car className="w-4 h-4" />
          <span>Start Heading to Pickup Point</span>
        </button>
      )}

      {activeRide.status === 'HEADING_TO_PICKUP' && (
        <button
          type="button"
          onClick={() => driverMarkArrived(activeRide.id)}
          className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
        >
          <MapPin className="w-4 h-4" />
          <span>I Have Arrived at Pickup Location</span>
        </button>
      )}

      {activeRide.status === 'ARRIVED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Verify Passenger Pickup PIN</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Ask passenger for the 4-digit code shown on their AntiqueRide app to verify passenger match.
          </p>

          <form onSubmit={handleVerifyPin} className="flex gap-2">
            <input
              type="text"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="e.g. 4821"
              className="w-32 text-center text-lg font-mono font-bold tracking-widest bg-white border border-emerald-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600"
            />
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Verify & Start Trip
            </button>
          </form>

          {pinError && (
            <p className="text-[11px] font-bold text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{pinError}</span>
            </p>
          )}
        </div>
      )}

      {(activeRide.status === 'PASSENGER_VERIFIED' || activeRide.status === 'TRIP_STARTED') && (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Passenger Verified. Driving to {activeRide.destinationName}...</span>
          </div>

          <button
            type="button"
            onClick={() => completeTrip(activeRide.id)}
            className="w-full py-4 bg-[#102A43] hover:bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F5B301]" />
            <span>Complete Trip & Collect Cash ({formatCurrency(activeRide.fareAmount)})</span>
          </button>
        </div>
      )}
    </div>
  );
}

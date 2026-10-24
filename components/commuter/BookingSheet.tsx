'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { POPULAR_DESTINATIONS, DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';
import { calculateDistanceKm, calculateFare, formatCurrency } from '@/lib/utils';
import { Coordinates, RideType } from '@/lib/types';
import {
  MapPin,
  Navigation,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight,
  Info,
  Car,
} from 'lucide-react';

interface BookingSheetProps {
  onPickupSelect: (coords: Coordinates, name: string) => void;
  onDestinationSelect: (coords: Coordinates, name: string) => void;
  selectedPickup: { coords: Coordinates; name: string };
  selectedDestination: { coords: Coordinates; name: string } | null;
}

export default function BookingSheet({
  onPickupSelect,
  onDestinationSelect,
  selectedPickup,
  selectedDestination,
}: BookingSheetProps) {
  const { commuter, farePolicy, requestRide, activeRide } = useAppState();

  const [rideType, setRideType] = useState<RideType>('REGULAR');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate distance & fare preview
  const distanceKm = selectedDestination
    ? calculateDistanceKm(selectedPickup.coords, selectedDestination.coords)
    : 1.5;

  const fareSnapshot = calculateFare(
    distanceKm,
    rideType,
    commuter.discountCategory,
    farePolicy
  );

  const handleQuickDestination = (dest: (typeof POPULAR_DESTINATIONS)[0]) => {
    onDestinationSelect(dest.coordinates, dest.name);
  };

  const handleRequest = () => {
    if (!selectedDestination) {
      setErrorMessage('Please choose a destination in Antique.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const result = requestRide({
      pickupName: selectedPickup.name,
      pickupCoords: selectedPickup.coords,
      destinationName: selectedDestination.name,
      destinationCoords: selectedDestination.coords,
      rideType,
      passengerCount,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  if (activeRide && activeRide.status !== 'CANCELLED' && activeRide.status !== 'TRIP_COMPLETED') {
    return null; // Active ride card handles the screen
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 space-y-4">
      {/* Pickup & Destination Form */}
      <div className="space-y-3">
        {/* Pickup */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pickup Point</span>
            <div className="text-xs font-bold text-slate-800 truncate">{selectedPickup.name}</div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</span>
            <div className="text-xs font-bold text-slate-800 truncate">
              {selectedDestination ? selectedDestination.name : 'Select destination below or on map'}
            </div>
          </div>
        </div>
      </div>

      {/* Popular San Jose Destinations Chips */}
      {!selectedDestination && (
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Frequent Spots in San Jose de Buenavista
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <button
                key={i}
                onClick={() => handleQuickDestination(dest)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>{dest.name}</span>
                <span className="text-[10px] text-slate-400">({dest.barangay})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ride Type Selection (Regular Shared vs Special / Pakyaw) */}
      <div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Service Option
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Regular */}
          <button
            type="button"
            onClick={() => setRideType('REGULAR')}
            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              rideType === 'REGULAR'
                ? 'border-[#087F5B] bg-emerald-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">Regular / Shared</span>
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Official passenger fare matrix</p>
            <div className="mt-2 text-sm font-black text-emerald-800">
              {formatCurrency(
                calculateFare(distanceKm, 'REGULAR', commuter.discountCategory, farePolicy).totalFare
              )}
            </div>
          </button>

          {/* Special (Pakyaw) */}
          <button
            type="button"
            onClick={() => setRideType('SPECIAL')}
            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              rideType === 'SPECIAL'
                ? 'border-[#102A43] bg-slate-100 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">Special (Pakyaw)</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Exclusive private tricycle</p>
            <div className="mt-2 text-sm font-black text-[#102A43]">
              {formatCurrency(
                calculateFare(distanceKm, 'SPECIAL', commuter.discountCategory, farePolicy).totalFare
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Fare Breakdown & Discount Transparency */}
      {selectedDestination && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="text-slate-500 flex items-center gap-1">
              Estimated Distance:
            </span>
            <span className="font-bold text-slate-800">{distanceKm} km</span>
          </div>

          <div className="flex items-center justify-between font-medium">
            <span className="text-slate-500">Base Fare ({farePolicy.baseKmRegular} km):</span>
            <span className="font-semibold text-slate-800">{formatCurrency(fareSnapshot.baseFare)}</span>
          </div>

          {fareSnapshot.distanceCharge > 0 && (
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-500">Succeeding Distance Charge:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(fareSnapshot.distanceCharge)}</span>
            </div>
          )}

          {commuter.discountCategory !== 'NONE' && (
            <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-100/60 p-1.5 rounded-lg">
              <span>{commuter.discountCategory} 20% Discount (RA 10642):</span>
              <span>-{formatCurrency(fareSnapshot.discountAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-sm text-[#102A43]">Total Fare:</span>
              <span className="block text-[10px] text-slate-500">Cash payment upon arrival</span>
            </div>
            <div className="text-base font-black text-emerald-800">
              {formatCurrency(fareSnapshot.totalFare)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Audited under {farePolicy.sourceOrdinance}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Request CTA */}
      <button
        type="button"
        onClick={handleRequest}
        disabled={isSubmitting || !selectedDestination}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
          !selectedDestination
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-[#087F5B] hover:bg-emerald-700 text-white active:scale-[0.99]'
        }`}
      >
        <Car className="w-4 h-4" />
        <span>{isSubmitting ? 'Contacting Nearby Tricycles...' : 'Find a Tricycle'}</span>
      </button>
    </div>
  );
}

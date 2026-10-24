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
      setErrorMessage('Please select a destination in Antique.');
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

  const isStudent = commuter.discountCategory === 'STUDENT';
  const hasStatutoryDiscount = commuter.discountCategory !== 'NONE';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-5 space-y-4">
      {/* Student Discount Highlight Banner */}
      {isStudent && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-100" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-[11px] block leading-tight text-blue-950">
                Verified Student Account
              </span>
              <span className="text-[10px] text-blue-700 font-medium">
                20% discount applied under RA 10642
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
            20% OFF
          </span>
        </div>
      )}

      {/* Pickup & Destination Form */}
      <div className="space-y-2.5">
        {/* Pickup */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Pickup Point
            </span>
            <div className="text-xs font-bold text-slate-900 truncate">
              {selectedPickup.name}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Destination
            </span>
            <div className="text-xs font-bold text-slate-900 truncate">
              {selectedDestination ? selectedDestination.name : 'Select destination below or on map'}
            </div>
          </div>
        </div>
      </div>

      {/* Popular San Jose Destinations Chips */}
      {!selectedDestination && (
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Popular Spots in San Jose de Buenavista
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickDestination(dest)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>{dest.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({dest.barangay})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ride Type Selection (Regular Shared vs Special / Pakyaw) */}
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Choose Service Option
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Regular */}
          <button
            type="button"
            onClick={() => setRideType('REGULAR')}
            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
              rideType === 'REGULAR'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">Regular / Shared</span>
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Municipal standard fare</p>
            <div className="mt-1.5 text-sm font-black text-blue-700 font-mono">
              {formatCurrency(
                calculateFare(distanceKm, 'REGULAR', commuter.discountCategory, farePolicy).totalFare
              )}
            </div>
          </button>

          {/* Special (Pakyaw) */}
          <button
            type="button"
            onClick={() => setRideType('SPECIAL')}
            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
              rideType === 'SPECIAL'
                ? 'border-blue-800 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-extrabold text-xs ${
                  rideType === 'SPECIAL' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Special (Pakyaw)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p
              className={`text-[10px] mt-0.5 ${
                rideType === 'SPECIAL' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Exclusive private trip
            </p>
            <div
              className={`mt-1.5 text-sm font-black font-mono ${
                rideType === 'SPECIAL' ? 'text-blue-300' : 'text-slate-900'
              }`}
            >
              {formatCurrency(
                calculateFare(distanceKm, 'SPECIAL', commuter.discountCategory, farePolicy).totalFare
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Fare Breakdown & Discount Transparency */}
      {selectedDestination && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Estimated Distance:</span>
            <span className="font-bold text-slate-900">{distanceKm} km</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Base Fare ({farePolicy.baseKmRegular} km):</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(fareSnapshot.baseFare)}
            </span>
          </div>

          {fareSnapshot.distanceCharge > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span>Succeeding Distance Charge:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(fareSnapshot.distanceCharge)}
              </span>
            </div>
          )}

          {/* Highlighted Student / Senior / PWD Discount Pill */}
          {hasStatutoryDiscount && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-900">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-bold truncate">
                  {commuter.discountCategory === 'STUDENT'
                    ? 'Student 20% Discount (RA 10642)'
                    : commuter.discountCategory === 'SENIOR'
                    ? 'Senior 20% Discount (RA 9994)'
                    : 'PWD 20% Discount (RA 9442)'}
                </span>
              </div>
              <span className="font-black text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded-md shrink-0">
                -{formatCurrency(fareSnapshot.discountAmount)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Total Passenger Fare:</span>
              <span className="text-[10px] text-slate-400">Pay cash upon boarding</span>
            </div>
            <div className="text-lg font-black text-blue-700 font-mono">
              {formatCurrency(fareSnapshot.totalFare)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Audited under {farePolicy.sourceOrdinance} (San Jose de Buenavista)</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Main Request CTA (Blue and White) */}
      <button
        type="button"
        onClick={handleRequest}
        disabled={isSubmitting || !selectedDestination}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99] ${
          !selectedDestination
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Car className="w-4 h-4" />
        <span>{isSubmitting ? 'Contacting Nearby Tricycles...' : 'Find a Tricycle'}</span>
      </button>
    </div>
  );
}

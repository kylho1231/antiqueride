'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppState } from '@/lib/store/app-state';
import { Coordinates, Terminal } from '@/lib/types';
import { DEFAULT_MAP_CENTER, POPULAR_DESTINATIONS } from '@/lib/data/antique-data';
import BookingSheet from '@/components/commuter/BookingSheet';
import ActiveRideCard from '@/components/commuter/ActiveRideCard';
import VerificationModal from '@/components/commuter/VerificationModal';
import {
  MapPin,
  ShieldCheck,
  Navigation,
  Car,
  Clock,
  Sparkles,
  Users,
  Compass,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

// Dynamic import for Leaflet map to ensure 100% client-side SSR safety
const AntiqueMap = dynamic(() => import('@/components/map/AntiqueMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse border border-slate-200">
      Loading OpenStreetMap for San Jose de Buenavista...
    </div>
  ),
});

export default function CommuterPage() {
  const { commuter, terminals, drivers, activeRide } = useAppState();

  const [selectedPickup, setSelectedPickup] = useState<{ coords: Coordinates; name: string }>({
    coords: DEFAULT_MAP_CENTER,
    name: 'San Jose Municipal Plaza (Current Location)',
  });

  const [selectedDestination, setSelectedDestination] = useState<{
    coords: Coordinates;
    name: string;
  } | null>(null);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'MAP' | 'TERMINALS' | 'HISTORY'>('MAP');

  const handleSelectTerminal = (term: Terminal) => {
    setSelectedDestination({
      coords: term.coordinates,
      name: `${term.name} (${term.barangay})`,
    });
  };

  const onlineDriversCount = drivers.filter((d) => d.isOnline).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Greeting & Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-xl text-[#102A43]">
              Maayong adlaw, {commuter.fullName}!
            </h1>
            {commuter.verificationStatus === 'VERIFIED' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Verified Commuter ({commuter.discountCategory} 20% Discount)</span>
              </span>
            ) : (
              <button
                onClick={() => setShowVerificationModal(true)}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 cursor-pointer"
              >
                <span>Verify ID for 20% Discount</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating Zone: <span className="font-semibold text-slate-800">San Jose de Buenavista, Antique</span>
          </p>
        </div>

        {/* Live Availability Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{onlineDriversCount} Tricycles Available</span>
          </div>

          <button
            onClick={() => setShowVerificationModal(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Commuter Verification Settings"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">ID Status</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Booking / Active Ride Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Terminals (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#087F5B]" />
                <span className="font-extrabold text-sm text-[#102A43]">
                  San Jose de Buenavista Live Transit Map
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">OpenStreetMap Data</span>
            </div>

            <AntiqueMap
              center={DEFAULT_MAP_CENTER}
              terminals={terminals}
              drivers={drivers}
              pickupCoords={selectedPickup.coords}
              destinationCoords={selectedDestination ? selectedDestination.coords : null}
              driverCoords={activeRide?.driverCoordinates || null}
              onSelectTerminal={handleSelectTerminal}
              className="h-[460px] w-full rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            />

            {/* Map Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                <span>Active TODA Station</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B]"></span>
                <span>Available Tricycle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Tricycle On Trip</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Phase 2 (Pending)</span>
              </div>
            </div>
          </div>

          {/* Official San Jose Terminal Outposts Browser */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-[#102A43] flex items-center justify-between">
              <span>Verified Tricycle Terminals & Pila Queues</span>
              <span className="text-xs font-semibold text-emerald-700">
                {terminals.filter((t) => t.status === 'ACTIVE').length} In Service
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {terminals.map((t) => {
                const isPhase2 = t.status === 'FIELD_VERIFICATION_PENDING';
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTerminal(t)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{t.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-[#102A43] text-white px-1.5 py-0.5 rounded">
                          {t.todaName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.barangay}, {t.municipality}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">Queue: {t.queueMode}</span>
                      <span className="text-emerald-700 font-bold">{t.currentQueueCount} Tricycles</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Engine & Active Ride Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeRide && activeRide.status !== 'CANCELLED' && activeRide.status !== 'TRIP_COMPLETED' ? (
            <ActiveRideCard />
          ) : (
            <BookingSheet
              selectedPickup={selectedPickup}
              selectedDestination={selectedDestination}
              onPickupSelect={(coords, name) => setSelectedPickup({ coords, name })}
              onDestinationSelect={(coords, name) => setSelectedDestination({ coords, name })}
            />
          )}

          {/* Quick FAQ / Passenger Rights Under Antique Ordinances */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Antique Commuter Protection Notice</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              Every driver on AntiqueRide carries an approved Municipal Tricycle Operator's Permit (MTOP). 
              Never pay beyond the approved municipal fare matrix without mutual special agreement. In case of disputes, 
              use the Safety Desk to report the tricycle body number.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );
}

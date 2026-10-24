'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppState } from '@/lib/store/app-state';
import { Coordinates, Terminal } from '@/lib/types';
import { DEFAULT_MAP_CENTER, POPULAR_DESTINATIONS } from '@/lib/data/antique-data';
import BookingSheet from '@/components/commuter/BookingSheet';
import ActiveRideCard from '@/components/commuter/ActiveRideCard';
import VerificationModal from '@/components/commuter/VerificationModal';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import AuthGuard from '@/components/auth/AuthGuard';
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
  Settings,
  User,
  Camera,
} from 'lucide-react';

// Dynamic import for Leaflet map to ensure 100% client-side SSR safety
const AntiqueMap = dynamic(() => import('@/components/map/AntiqueMap'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[360px] sm:h-[480px] w-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse border border-slate-200"
    >
      Loading OpenStreetMap GIS for San Jose de Buenavista...
    </div>
  ),
});

export default function CommuterPage() {
  const { commuter, currentUser, terminals, drivers, activeRide } = useAppState();

  const [selectedPickup, setSelectedPickup] = useState<{ coords: Coordinates; name: string }>({
    coords: DEFAULT_MAP_CENTER,
    name: 'San Jose Municipal Plaza (Current Location)',
  });

  const [selectedDestination, setSelectedDestination] = useState<{
    coords: Coordinates;
    name: string;
  } | null>(null);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'MAP' | 'TERMINALS' | 'HISTORY'>('MAP');

  const handleSelectTerminal = (term: Terminal) => {
    setSelectedDestination({
      coords: term.coordinates,
      name: `${term.name} (${term.barangay})`,
    });
  };

  const onlineDriversCount = drivers.filter((d) => d.isOnline).length;
  const isStudent = commuter.discountCategory === 'STUDENT';

  return (
    <AuthGuard allowedRoles={['COMMUTER']}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Top Greeting & Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            {/* User Photo Avatar with clickable settings */}
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Click to update your photo and details"
              aria-label="Update profile photo and settings"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl overflow-hidden border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                {commuter.avatarUrl || currentUser?.avatarUrl ? (
                  <img
                    src={commuter.avatarUrl || currentUser?.avatarUrl}
                    alt={commuter.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-md bg-blue-600 text-white shadow-xs">
                <Camera className="w-3 h-3" />
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                  Maayong adlaw, {commuter.fullName}!
                </h1>

                {/* Highlighted Student Discount Pill */}
                {isStudent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Verified Student (20% Discount)</span>
                  </span>
                ) : commuter.discountCategory === 'SENIOR' || commuter.discountCategory === 'PWD' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Verified {commuter.discountCategory} (20% Discount)</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors shrink-0"
                  >
                    <span>Upload Student/Gov ID for 20% Discount</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Operating Zone: <span className="font-semibold text-slate-800">San Jose de Buenavista, Antique</span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>{onlineDriversCount} Tricycles Available</span>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[38px]"
              title="Account Settings & Photo"
              aria-label="Account Settings"
            >
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Interactive Map + Booking / Active Ride Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Interactive Map & Terminals (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 min-w-0">
                  <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-extrabold text-sm text-slate-900 truncate">
                    San Jose de Buenavista Live Transit Map
                  </span>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                  <button
                    onClick={() => setActiveTab('MAP')}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg cursor-pointer transition-all ${
                      activeTab === 'MAP' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    GIS Map
                  </button>
                  <button
                    onClick={() => setActiveTab('TERMINALS')}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg cursor-pointer transition-all ${
                      activeTab === 'TERMINALS' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    Terminals
                  </button>
                </div>
              </div>

              {/* Leaflet Map with Responsive Container Height */}
              <div className="w-full h-[360px] sm:h-[480px]">
                <AntiqueMap
                  center={DEFAULT_MAP_CENTER}
                  terminals={terminals}
                  drivers={drivers}
                  pickupCoords={selectedPickup.coords}
                  destinationCoords={selectedDestination?.coords || null}
                  className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-full w-full"
                />
              </div>

              {/* Map Footer Helper */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Click any terminal pin on the map to set destination.</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    <span>TODA Station</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span>Active Tricycle</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Terminals Grid */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                <span>Verified TODA Tricycle Stations in San Jose</span>
                <span className="text-xs text-blue-700 font-semibold">Authorized Terminals</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {terminals.map((t) => {
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTerminal(t)}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left cursor-pointer transition-all flex flex-col justify-between min-h-[44px]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{t.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-1.5 py-0.5 rounded">
                            {t.todaName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{t.barangay}, {t.municipality}</p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">Pila Queue: {t.queueMode}</span>
                        <span className="text-blue-700 font-bold">{t.currentQueueCount} Tricycles</span>
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
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Antique Commuter Protection Notice</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                Every tricycle driver on AntiqueRide carries an approved Municipal Tricycle Operator's Permit (MTOP). 
                Always inspect the driver's body number and verify the 4-digit security PIN before boarding under Municipal Ordinance No. 2023-014.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Modal */}
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
        />

        {/* Profile & Photo Settings Modal */}
        <ProfileSettingsModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </div>
    </AuthGuard>
  );
}

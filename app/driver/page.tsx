'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppState } from '@/lib/store/app-state';
import { DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';
import DriverTelemetry from '@/components/driver/DriverTelemetry';
import IncomingRideModal from '@/components/driver/IncomingRideModal';
import ActiveTripCard from '@/components/driver/ActiveTripCard';
import AuthGuard from '@/components/auth/AuthGuard';
import {
  Car,
  ShieldCheck,
  Star,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Dynamic import for Leaflet map to guarantee SSR safety
const AntiqueMap = dynamic(() => import('@/components/map/AntiqueMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: '480px', minHeight: '480px', width: '100%' }}
      className="rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse border border-slate-200"
    >
      Loading Driver Operational Patrol GIS Map...
    </div>
  ),
});

export default function DriverPage() {
  const { activeDriver, terminals, drivers, activeRide, farePolicy } = useAppState();

  const isAssignedActiveRide =
    activeRide &&
    (activeRide.driverId === activeDriver.id || activeRide.status === 'REQUESTED');

  return (
    <AuthGuard allowedRoles={['DRIVER']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Driver Header Profile Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-black text-2xl shadow-sm border-2 border-emerald-500">
            🛺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900">{activeDriver.fullName}</h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#102A43] text-[#F5B301]">
                Unit #{activeDriver.bodyNumber}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>LGU Verified</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              TODA: <span className="font-semibold text-slate-800">{activeDriver.todaName}</span> • Plate: {activeDriver.vehiclePlate}
            </p>
          </div>
        </div>

        {/* Quick Shift Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Driver Rating</span>
            <div className="flex items-center gap-1 text-sm font-extrabold text-slate-800 justify-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{activeDriver.rating}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Trips</span>
            <span className="text-sm font-extrabold text-[#087F5B] block">
              {activeDriver.totalTrips}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Dispatch Alert Banner (When ride requested and driver is offline) */}
      {activeRide && activeRide.status === 'REQUESTED' && !activeDriver.isOnline && (
        <div className="p-4 bg-amber-500 text-slate-950 rounded-3xl font-bold text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-amber-600 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-900 block">
                Incoming Ride Alert Detected in San Jose!
              </span>
              <p className="text-sm font-extrabold text-slate-950">
                {activeRide.commuterName} requested a tricycle at {activeRide.pickupName} ({formatCurrency(activeRide.fareAmount)})
              </p>
              <span className="text-[11px] text-slate-900 font-medium">
                You are currently OFFLINE. Go ONLINE to accept this passenger request.
              </span>
            </div>
          </div>
          <button
            onClick={useAppState().toggleDriverOnline}
            className="px-5 py-3 bg-[#102A43] hover:bg-slate-900 text-[#F5B301] rounded-2xl text-xs font-black cursor-pointer shadow-md transition-transform active:scale-95 shrink-0"
          >
            Go Online Now & Accept
          </button>
        </div>
      )}

      {/* Main Grid: Telemetry & Active Trips / Incoming Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Driver Controls & Shift Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <DriverTelemetry />

          {/* Active Trip Workflow (When Accepted / On Trip) */}
          <ActiveTripCard />

          {/* Daily Earnings & Payout Breakdown */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-[#102A43] flex items-center justify-between">
              <span>Today's Shift Earnings</span>
              <span className="text-xs font-semibold text-emerald-700">Cash Collected</span>
            </h3>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-semibold">Total Revenue Today</span>
                <div className="text-2xl font-black text-emerald-950 mt-0.5">
                  {formatCurrency(activeDriver.totalTrips * 25.0)}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                100% Cash Paid
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              AntiqueRide charges zero platform deduction during the San Jose de Buenavista municipal pilot. All fares paid in cash remain 100% with participating drivers.
            </p>
          </div>
        </div>

        {/* Right Column: Driver Route Navigation & Terminal Outposts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#087F5B]" />
                <span className="font-extrabold text-sm text-[#102A43]">
                  Driver Operational Patrol Map
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">San Jose de Buenavista</span>
            </div>

            <AntiqueMap
              center={activeDriver.currentCoordinates || DEFAULT_MAP_CENTER}
              terminals={terminals}
              drivers={drivers}
              pickupCoords={activeRide?.pickupCoordinates || null}
              destinationCoords={activeRide?.destinationCoordinates || null}
              driverCoords={activeDriver.currentCoordinates}
              className="h-[420px] w-full rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Station: {activeDriver.terminalName}</span>
              </span>
              <span className="font-mono text-emerald-800 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                Queue Pila #{activeDriver.queuePosition || 1}
              </span>
            </div>
          </div>

          {/* LGU San Jose Transport Board Reminders */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Municipal Traffic Advisory (TMPSO San Jose)</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              Tricycle units must strictly adhere to the passenger capacity limit of 4 passengers. 
              Always verify the commuter's 4-digit PIN code upon boarding to confirm authorized dispatch under Municipal Ordinance No. 2023-014.
            </p>
          </div>
        </div>
      </div>

      {/* Incoming Ride Alert Modal (Displays when commuter requests ride) */}
      <IncomingRideModal />
    </div>
  </AuthGuard>
);
}

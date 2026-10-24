'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppState } from '@/lib/store/app-state';
import { DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';
import DriverVerificationQueue from '@/components/admin/DriverVerificationQueue';
import TerminalManager from '@/components/admin/TerminalManager';
import FareOrdinanceManager from '@/components/admin/FareOrdinanceManager';
import IncidentDesk from '@/components/admin/IncidentDesk';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import AuthGuard from '@/components/auth/AuthGuard';
import {
  ShieldCheck,
  Users,
  Car,
  MapPin,
  Scale,
  AlertTriangle,
  History,
  Compass,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Dynamic import for Leaflet map for SSR safety
const AntiqueMap = dynamic(() => import('@/components/map/AntiqueMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: '380px', minHeight: '360px', width: '100%' }}
      className="rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse border border-slate-200"
    >
      Loading Administrative Dispatch GIS Map...
    </div>
  ),
});

export default function AdminPage() {
  const { drivers, terminals, farePolicy, incidents, activeRide, rideHistory } = useAppState();
  const [activeTab, setActiveTab] = useState<
    'DRIVERS' | 'TERMINALS' | 'FARES' | 'INCIDENTS' | 'AUDIT' | 'LIVE_MAP'
  >('DRIVERS');

  const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'PENDING').length;
  const onlineDrivers = drivers.filter((d) => d.isOnline).length;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Admin Top Header (Deep Navy & Emerald) */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#0B1E30] to-[#07151E] text-white p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Platform Operations & Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">AntiqueRide Super Admin Workspace</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            San Jose de Buenavista Municipal Tricycle Dispatch & Regulatory Monitor
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-xs backdrop-blur-md self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-mono text-white truncate">admin@antiqueride.ph</span>
        </div>
      </div>

      {/* KPI Overview Statistics (Layered Glass & Elevation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        <div className="p-4 bg-white dark:bg-[#102A43] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-3d-lift">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Verified Drivers</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {drivers.filter((d) => d.verificationStatus === 'VERIFIED').length}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate block">Authorized LGU</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#102A43] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-3d-lift">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Online Drivers</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{onlineDrivers}</span>
          <span className="text-[10px] text-slate-500 font-medium truncate block">Active on GPS</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#102A43] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-3d-lift">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Pending Review</span>
          <span className="text-xl font-black text-amber-500 mt-1 block">{pendingDrivers}</span>
          <span className="text-[10px] text-amber-600 font-medium truncate block">Applications</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#102A43] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-3d-lift">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Active Bookings</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
            {activeRide && activeRide.status !== 'CANCELLED' && activeRide.status !== 'TRIP_COMPLETED'
              ? '1'
              : '0'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium truncate block">Dispatches en route</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#102A43] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-3d-lift">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">TODA Stations</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{terminals.length}</span>
          <span className="text-[10px] text-slate-500 font-medium truncate block">San Jose + Phase 2</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#102A43] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-3d-lift">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Safety Incidents</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">{activeIncidents}</span>
          <span className="text-[10px] text-slate-500 font-medium truncate block">Grievance desk</span>
        </div>
      </div>

      {/* Workspace Tabs Navigation with Touch-Friendly Overflow */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-2 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'DRIVERS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#102A43] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Driver Applications</span>
          {pendingDrivers > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {pendingDrivers}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('LIVE_MAP')}
          className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'LIVE_MAP'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#102A43] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Live Dispatch Map</span>
        </button>

        <button
          onClick={() => setActiveTab('TERMINALS')}
          className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'TERMINALS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#102A43] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>TODA Terminals & Queues</span>
        </button>

        <button
          onClick={() => setActiveTab('FARES')}
          className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'FARES'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#102A43] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Fare Matrix Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'INCIDENTS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#102A43] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Grievance & Lost Items</span>
          {activeIncidents > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
              {activeIncidents}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'AUDIT'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#102A43] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'DRIVERS' && <DriverVerificationQueue />}

      {activeTab === 'LIVE_MAP' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Live Dispatch & Driver Telemetry Monitor
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking of authenticated tricycles across San Jose de Buenavista municipal grid
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 bg-blue-100 text-blue-900 rounded-full">
              {onlineDrivers} GPS Feeds Active
            </span>
          </div>

          <AntiqueMap
            center={DEFAULT_MAP_CENTER}
            terminals={terminals}
            drivers={drivers}
            pickupCoords={activeRide?.pickupCoordinates || null}
            destinationCoords={activeRide?.destinationCoordinates || null}
            driverCoords={activeRide?.driverCoordinates || null}
            className="h-[380px] sm:h-[520px] w-full rounded-2xl border border-slate-200 overflow-hidden"
          />
        </div>
      )}

      {activeTab === 'TERMINALS' && <TerminalManager />}

      {activeTab === 'FARES' && <FareOrdinanceManager />}

      {activeTab === 'INCIDENTS' && <IncidentDesk />}

      {activeTab === 'AUDIT' && <AuditLogViewer />}
    </div>
  </AuthGuard>
);
}

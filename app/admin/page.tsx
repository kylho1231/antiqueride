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
      style={{ height: '480px', minHeight: '480px', width: '100%' }}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-200">
              Platform Operations & Governance
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">AntiqueRide Super Admin Workspace</h1>
          <p className="text-xs text-blue-100 mt-0.5">
            San Jose de Buenavista Municipal Tricycle Dispatch & Regulatory Monitor
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/60 px-4 py-2 rounded-2xl border border-blue-700/50 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="font-mono">Super Admin: admin@antiqueride.ph</span>
        </div>
      </div>

      {/* KPI Overview Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified Drivers</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {drivers.filter((d) => d.verificationStatus === 'VERIFIED').length}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Authorized by LGU</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Online Drivers</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{onlineDrivers}</span>
          <span className="text-[10px] text-slate-500 font-medium">Active on GPS</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Review</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">{pendingDrivers}</span>
          <span className="text-[10px] text-amber-800 font-medium">Driver applications</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Bookings</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">
            {activeRide && activeRide.status !== 'CANCELLED' && activeRide.status !== 'TRIP_COMPLETED'
              ? '1'
              : '0'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Dispatches en route</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">TODA Stations</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{terminals.length}</span>
          <span className="text-[10px] text-slate-500 font-medium">San Jose + Phase 2</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Safety Incidents</span>
          <span className="text-xl font-black text-red-600 mt-1 block">{activeIncidents}</span>
          <span className="text-[10px] text-slate-500 font-medium">Grievance desk</span>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1">
        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'DRIVERS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Driver Applications</span>
          {pendingDrivers > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black flex items-center justify-center">
              {pendingDrivers}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('LIVE_MAP')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'LIVE_MAP'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-blue-400" />
          <span>Live Dispatch Map</span>
        </button>

        <button
          onClick={() => setActiveTab('TERMINALS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'TERMINALS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>TODA Terminals & Queues</span>
        </button>

        <button
          onClick={() => setActiveTab('FARES')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'FARES'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Fare Matrix Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'INCIDENTS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Grievance & Lost Items</span>
          {activeIncidents > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
              {activeIncidents}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'AUDIT'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'DRIVERS' && <DriverVerificationQueue />}

      {activeTab === 'LIVE_MAP' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Live Dispatch & Driver Telemetry Monitor
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking of authenticated tricycles across San Jose de Buenavista municipal grid
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-900 rounded-full">
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
            className="h-[520px] w-full rounded-2xl border border-slate-200 overflow-hidden"
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

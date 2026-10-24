'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/store/app-state';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  Car,
  ShieldCheck,
  MapPin,
  Scale,
  Sparkles,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  Smartphone,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const { drivers, terminals, farePolicy } = useAppState();
  const onlineCount = drivers.filter((d) => d.isOnline).length;

  return (
    <div className="space-y-10 sm:space-y-16 py-4 sm:py-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sm:p-10 lg:p-16 shadow-2xl">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="truncate">San Jose Pilot Active • {onlineCount} Drivers Online</span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Your Ride. <br />
              <span className="text-blue-300">Your Antique.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-blue-100 font-medium leading-relaxed max-w-2xl">
              The first province-wide smart transportation technology platform for Antique, Philippines. 
              Connecting daily commuters with verified local TODA tricycle drivers through real-time booking, 
              audited municipal fare matrices, and authenticated safety controls.
            </p>

            {/* Dedicated Two-Portal Entry Gateway */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2 sm:pt-4">
              <Link
                href="/commuter"
                className="group p-4 sm:p-6 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-3 shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block mb-1">
                    For Passengers & Students
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">Commuter Portal</h3>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Book authorized tricycles, check official municipal fares, validate 20% student discounts, and track rides live.
                  </p>
                </div>
                <div className="mt-4 sm:mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-300 group-hover:translate-x-1 transition-transform">
                  <span>Enter Commuter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                href="/driver"
                className="group p-4 sm:p-6 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold mb-3 shadow-md">
                    <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block mb-1">
                    For Franchised Tricycle Operators
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">TODA Driver Portal</h3>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Shift controls, TODA terminal queue management, real-time dispatch alerts, and verified trip earnings.
                  </p>
                </div>
                <div className="mt-4 sm:mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-300 group-hover:translate-x-1 transition-transform">
                  <span>Enter Driver Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Scope & Transport Expansion Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-4 lg:col-span-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
              Geographic Deployment
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Grounded in Antique's Actual Transport Realities
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tricycle franchises in the Philippines are granted under municipal authority. AntiqueRide respects 
              municipal boundaries and local TODA queue arrangements rather than assuming universal cross-boundary operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
            {/* Phase 1 Area */}
            <div className="p-6 bg-white rounded-3xl border-2 border-blue-500/40 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  Phase 1 • Active Pilot
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">10.7445° N</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">San Jose de Buenavista</h3>
              <p className="text-xs text-slate-600">
                Capital of Antique. Active dispatch coverage across Dalipe, San Pedro, Mojon, Poblacion, and Funda.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>5 Verified Terminal Outposts</span>
              </div>
            </div>

            {/* Phase 2 Area */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  Phase 2 Expansion
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Roadmap</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Sibalom & Hamtic</h3>
              <p className="text-xs text-slate-600">
                Subject to inter-municipal route coordination, Sangguniang Bayan approvals, and terminal queue integration.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Field verification and TODA dialogues underway</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
            Engineered for Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built Different from Generic Ride Apps
          </h2>
          <p className="text-sm text-slate-600">
            Real authentication, auditable fare compliance, and terminal queue harmonization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Audited Municipal Fare Matrix</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hidden surge pricing. Built directly on San Jose de Buenavista Municipal Ordinance No. 2023-014. 
              Automatically applies statutory 20% discounts for Students (RA 10642), Seniors (RA 9994), and PWDs (RA 9442).
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">TODA Terminal Queue (Pila) Mode</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Respects existing TODA queue discipline. Drivers take passenger dispatches in order of their terminal arrival 
              or participate in authorized on-demand booking without bypassing association rules.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">4-Digit Pickup PIN & Safety Desk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminates prank bookings and wrong passenger pickups. Commuters give a one-time 4-digit code to their 
              driver before boarding. Direct emergency linking to San Jose Police, PDRRMO 911, and TMPSO.
            </p>
          </div>
        </div>
      </section>

      {/* Official Fare Ordinance Snapshot */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-8 bg-blue-950 text-white rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                San Jose de Buenavista Public Tariff
              </span>
              <h3 className="text-lg sm:text-2xl font-black mt-1">
                Official Tricycle Passenger & Special Fare Table
              </h3>
              <p className="text-xs text-blue-200 mt-1">
                Ref: {farePolicy.sourceOrdinance} • {farePolicy.approvalReference}
              </p>
            </div>
            <Link
              href="/commuter"
              className="px-5 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-fit cursor-pointer transition-colors shadow-md shrink-0"
            >
              <span>Test Booking Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-blue-900 text-xs">
            <div className="p-3 sm:p-4 bg-blue-900/60 rounded-xl sm:rounded-2xl">
              <span className="text-[10px] text-blue-200 block font-bold uppercase truncate">Base Regular Fare</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {formatCurrency(farePolicy.baseFareRegular)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-blue-300 truncate block">First {farePolicy.baseKmRegular} km / passenger</span>
            </div>

            <div className="p-3 sm:p-4 bg-blue-900/60 rounded-xl sm:rounded-2xl">
              <span className="text-[10px] text-blue-200 block font-bold uppercase truncate">Succeeding Rate</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {formatCurrency(farePolicy.succeedingPerKmRegular)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-blue-300 truncate block">Per succeeding kilometer</span>
            </div>

            <div className="p-3 sm:p-4 bg-blue-900/60 rounded-xl sm:rounded-2xl">
              <span className="text-[10px] text-blue-200 block font-bold uppercase truncate">Special Trip (Pakyaw)</span>
              <span className="text-xl sm:text-2xl font-black text-blue-300 mt-1 block">
                {formatCurrency(farePolicy.specialTripBaseFare)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-blue-300 truncate block">Exclusive private charter</span>
            </div>

            <div className="p-3 sm:p-4 bg-blue-900/60 rounded-xl sm:rounded-2xl">
              <span className="text-[10px] text-blue-200 block font-bold uppercase truncate">Mandatory Discount</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 mt-1 block">20% OFF</span>
              <span className="text-[10px] sm:text-[11px] text-blue-300 truncate block">Students, Seniors, PWDs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Discreet Platform Footer & LGU Administrative Link */}
      <footer className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p className="text-center sm:text-left">© 2026 AntiqueRide. Municipal Transport Technology for Antique, Philippines.</p>
        <Link
          href="/admin/login"
          className="text-slate-400 hover:text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors p-2"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LGU Administrator Gateway</span>
        </Link>
      </footer>
    </div>
  );
}

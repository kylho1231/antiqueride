'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAppState } from '@/lib/store/app-state';
import { calculateDistanceKm, calculateFare, formatCurrency } from '@/lib/utils';
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
  Compass,
  Clock,
  Calculator,
  ChevronRight,
} from 'lucide-react';

// Lazy load the 3D Tricycle Scene so it never blocks page load or initial render
const TricycleScene = dynamic(() => import('@/components/3d/TricycleScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] sm:h-[480px] rounded-3xl bg-slate-900/10 dark:bg-slate-900/40 animate-pulse flex flex-col items-center justify-center text-slate-500">
      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg mb-2">
        🛺
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
        Loading 3D Philippine Tricycle Scene...
      </span>
    </div>
  ),
});

export default function HomePage() {
  const { drivers, terminals, farePolicy } = useAppState();
  const onlineCount = drivers.filter((d) => d.isOnline).length;

  // Interactive Live Fare Estimator widget on Landing Page
  const [calcPickup, setCalcPickup] = useState(0);
  const [calcDest, setCalcDest] = useState(2);
  const [calcRideType, setCalcRideType] = useState<'REGULAR' | 'SPECIAL'>('REGULAR');
  const [calcDiscount, setCalcDiscount] = useState<'NONE' | 'STUDENT'>('NONE');

  const SAMPLE_LOCATIONS = [
    { name: 'San Jose Municipal Plaza (Poblacion)', coords: { lat: 10.7445, lng: 121.9395 } },
    { name: 'Tradetown Dalipe Terminal', coords: { lat: 10.7492, lng: 121.9442 } },
    { name: 'EBJ Antique Provincial Capitol', coords: { lat: 10.7431, lng: 121.9382 } },
    { name: 'Robinsons Place Antique (San Angel)', coords: { lat: 10.7512, lng: 121.9425 } },
    { name: 'University of Antique (Main Campus)', coords: { lat: 10.7812, lng: 122.0154 } },
  ];

  const estimatedDistance = Math.max(
    0.8,
    calculateDistanceKm(SAMPLE_LOCATIONS[calcPickup].coords, SAMPLE_LOCATIONS[calcDest].coords)
  );
  const estimatedFare = calculateFare(estimatedDistance, calcRideType, calcDiscount, farePolicy);

  return (
    <div className="space-y-12 sm:space-y-20 py-4 sm:py-8">
      {/* 1. CINEMATIC 3D HERO SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102A43] via-[#0B1E30] to-[#07151E] text-white p-5 sm:p-8 lg:p-14 shadow-2xl border border-white/10">
          {/* Subtle radial emerald & gold ambient glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>San Jose de Buenavista Active • {onlineCount} Tricycle Units Online</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-emerald-400 block">
                  AntiqueRide
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  Your Ride. <br />
                  <span className="text-emerald-300">Your Antique.</span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                Find trusted local transport, discover nearby terminals, and travel around Antique with confidence.
              </p>

              {/* Primary Actions (Per Section 4 Specification) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/commuter"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>Find a Ride</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/driver/register"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-sm flex items-center justify-center gap-2 backdrop-blur-md border border-white/20 cursor-pointer transition-all active:scale-95"
                >
                  <Car className="w-4 h-4 text-emerald-300" />
                  <span>Become a Driver</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-emerald-300 font-black block text-sm sm:text-base">₱15.00</span>
                  <span className="text-slate-400 font-medium">Ordinance Tariff</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-amber-300 font-black block text-sm sm:text-base">20% OFF</span>
                  <span className="text-slate-400 font-medium">Student / Senior</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-blue-300 font-black block text-sm sm:text-base">4-Digit PIN</span>
                  <span className="text-slate-400 font-medium">Anti-Prank Safety</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Philippine Tricycle */}
            <div className="lg:col-span-6 w-full">
              <div className="relative">
                <TricycleScene height="460px" showControls={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED TWO-PORTAL GATEWAYS (Commuter vs Driver) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Dedicated Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] dark:text-white tracking-tight">
            Separate, Purpose-Built Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Commuters and franchised TODA drivers operate in dedicated, isolated environments tailored for their needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Commuter Portal Gateway Card */}
          <Link
            href="/commuter"
            className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#102A43] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  For Commuters & Students
                </span>
                <h3 className="font-extrabold text-xl text-[#102A43] dark:text-white">Commuter Passenger Portal</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Book authorized tricycles across San Jose de Buenavista. Check frozen municipal fares, enjoy statutory 20% student discounts, and track authorized drivers live with 4-digit pickup PIN protection.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  ✓ Instant Booking
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ Student / Senior Discount
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ Emergency Link
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Commuter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* TODA Driver Portal Gateway Card */}
          <Link
            href="/driver"
            className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#102A43] border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/30">
                <Car className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                  For Franchised TODA Operators
                </span>
                <h3 className="font-extrabold text-xl text-[#102A43] dark:text-white">TODA Driver Operator Portal</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Simple, high-visibility shift console. Switch Online with one tap, receive real-time booking dispatch chimes, view terminal queue positions, and verify passenger 4-digit PINs safely.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  ✓ High-Vis Online Toggle
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ Terminal Pila Monitor
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ Zero Commuter Overlap
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Driver Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. INTERACTIVE MUNICIPAL FARE CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#102A43] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Transparent Tariff Engine
              </span>
              <h2 className="text-2xl font-black text-[#102A43] dark:text-white mt-1">
                Official Municipal Fare Matrix Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Under San Jose de Buenavista Municipal Ordinance No. 2023-014. Zero surge pricing.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start md:self-auto">
              <Scale className="w-4 h-4" />
              <span>Statutory 20% Discount Compliant</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pickup Location:
                </label>
                <select
                  value={calcPickup}
                  onChange={(e) => setCalcPickup(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-semibold text-slate-900 dark:text-white focus:outline-emerald-600"
                >
                  {SAMPLE_LOCATIONS.map((loc, idx) => (
                    <option key={idx} value={idx}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Destination:
                </label>
                <select
                  value={calcDest}
                  onChange={(e) => setCalcDest(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-semibold text-slate-900 dark:text-white focus:outline-emerald-600"
                >
                  {SAMPLE_LOCATIONS.map((loc, idx) => (
                    <option key={idx} value={idx}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ride Type:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcRideType('REGULAR')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold cursor-pointer transition-all ${
                        calcRideType === 'REGULAR'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Regular (Pila)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcRideType('SPECIAL')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold cursor-pointer transition-all ${
                        calcRideType === 'SPECIAL'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Special (Pakyaw)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Privilege:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcDiscount('NONE')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold cursor-pointer transition-all ${
                        calcDiscount === 'NONE'
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcDiscount('STUDENT')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold cursor-pointer transition-all ${
                        calcDiscount === 'STUDENT'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Student / Senior (-20%)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="lg:col-span-5 p-6 bg-gradient-to-br from-slate-900 to-[#102A43] text-white rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Calculated Distance:</span>
                  <span className="font-mono font-bold text-white">{estimatedDistance.toFixed(2)} km</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Base Fare ({farePolicy.baseKmRegular} km):</span>
                  <span className="font-mono text-white">₱{estimatedFare.baseFare.toFixed(2)}</span>
                </div>
                {estimatedFare.distanceSurcharge > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>Distance Surcharge:</span>
                    <span className="font-mono text-white">+₱{estimatedFare.distanceSurcharge.toFixed(2)}</span>
                  </div>
                )}
                {estimatedFare.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-400 mt-1 font-bold">
                    <span>20% Statutory Discount:</span>
                    <span className="font-mono">-₱{estimatedFare.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                  Official Total Fare:
                </span>
                <span className="text-4xl font-black text-white mt-1 block tracking-tight">
                  {formatCurrency(estimatedFare.totalFare)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Cash payment to driver • Municipal fare frozen upon booking
                </span>
              </div>

              <Link
                href="/commuter"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
              >
                <span>Book This Route in Commuter Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED TERMINAL OUTPOSTS IN SAN JOSE DE BUENAVISTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Field Transport Nodes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] dark:text-white tracking-tight">
            Authorized TODA Terminals
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Discover official terminal stations in San Jose de Buenavista with integrated queue discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {terminals.map((term) => (
            <div
              key={term.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#102A43] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 card-3d-lift"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {term.queueMode === 'PILA' ? 'Queue (Pila) Mode' : 'On-Demand'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Cap: {term.capacity} units
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#102A43] dark:text-white">{term.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{term.barangay}, {term.municipality}</span>
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Current Queue:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {term.currentQueueCount} Tricycles Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FOOTER & ADMIN GATEWAY */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <p className="text-center sm:text-left">
          © 2026 AntiqueRide. Province of Antique Smart Transportation Infrastructure.
        </p>
        <Link
          href="/admin/login"
          className="text-slate-400 hover:text-emerald-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors p-2"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LGU Administrator Desk</span>
        </Link>
      </footer>
    </div>
  );
}

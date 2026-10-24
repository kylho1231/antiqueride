'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '@/lib/store/app-state';
import {
  Power,
  Battery,
  Compass,
  Radio,
  MapPin,
  Crosshair,
  Loader2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Coordinates } from '@/lib/types';
import { resolveLocationName } from '@/lib/hooks/useDeviceLocation';

export default function DriverTelemetry() {
  const { activeDriver, toggleDriverOnline, updateDriverGps } = useAppState();
  const [gpsMode, setGpsMode] = useState<'HARDWARE' | 'SIMULATOR'>('HARDWARE');
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  const [hardwareGpsLocked, setHardwareGpsLocked] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<string>('San Jose de Buenavista');

  const watchIdRef = useRef<number | null>(null);

  // 1. Hardware GPS Tracker: Watches real device GPS when online and in HARDWARE mode
  useEffect(() => {
    if (!activeDriver.isOnline || gpsMode !== 'HARDWARE') {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setHardwareGpsLocked(false);
      return;
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsError('Hardware GPS not supported on this device.');
      return;
    }

    setGpsError(null);

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const accuracy = Math.round(pos.coords.accuracy);

        setHardwareGpsLocked(true);
        setGpsError(null);
        updateDriverGps(coords, accuracy);

        // Periodically resolve location name
        try {
          const res = await resolveLocationName(coords);
          setResolvedLocation(res.name);
        } catch (e) {}
      },
      (err) => {
        setHardwareGpsLocked(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow GPS access.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('GPS signal weak or unavailable.');
        } else {
          setGpsError('Searching for GPS fix...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 2500,
      }
    );

    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [activeDriver.isOnline, gpsMode, updateDriverGps]);

  // 2. Simulated GPS movement loop for testing & live demonstration without road travel
  useEffect(() => {
    if (gpsMode !== 'SIMULATOR' || !isSimulatingMovement || !activeDriver.isOnline) return;

    const waypoints = [
      { lat: 10.7475, lng: 121.9430 }, // Tradetown
      { lat: 10.7490, lng: 121.9425 },
      { lat: 10.7510, lng: 121.9420 }, // ANS Gate
      { lat: 10.7460, lng: 121.9405 },
      { lat: 10.7445, lng: 121.9395 }, // San Jose Plaza
      { lat: 10.7410, lng: 121.9370 },
      { lat: 10.7380, lng: 121.9350 }, // San Pedro Port
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % waypoints.length;
      updateDriverGps(waypoints[index], 3.5);
    }, 4000);

    return () => clearInterval(interval);
  }, [gpsMode, isSimulatingMovement, activeDriver.isOnline, updateDriverGps]);

  return (
    <div className="bg-white dark:bg-[#102A43] rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/90 dark:border-slate-800 space-y-4">
      {/* Large High-Visibility Shift Status & Tactile Toggle (Section 7 Spec) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/60 dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            Tricycle Shift Console
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                activeDriver.isOnline
                  ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-black text-base text-[#102A43] dark:text-white">
              {activeDriver.isOnline ? 'ONLINE • Taking Rides' : 'OFFLINE • Off Shift'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            {activeDriver.isOnline
              ? 'Broadcasting live tricycle coordinates across San Jose'
              : 'Tap switch to start accepting passenger rides'}
          </span>
        </div>

        {/* Large Tactile Spring Switch */}
        <button
          type="button"
          onClick={toggleDriverOnline}
          className={`px-5 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-md btn-spring shrink-0 ${
            activeDriver.isOnline
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
          }`}
          aria-label={activeDriver.isOnline ? 'Go Offline' : 'Go Online'}
        >
          <Power className="w-4 h-4" />
          <span className="text-xs">{activeDriver.isOnline ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* Terminal & Station Queue Position (Key Antique Transport Requirement) */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Terminal Station</span>
            <p className="font-extrabold text-[#102A43] dark:text-white">{activeDriver.terminalName}</p>
            <p className="text-[11px] text-slate-500">TODA: {activeDriver.todaName} • Mode: PILA</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pila Position</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
            #{activeDriver.queuePosition || 1}
          </p>
        </div>
      </div>

      {/* Live Driver Hardware Coordinates & Location Banner */}
      {activeDriver.currentCoordinates && (
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {gpsMode === 'HARDWARE' ? 'Live Device GPS' : 'Simulated GPS'}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-extrabold">
                  ±{activeDriver.gpsAccuracyMeters || 3.8}m
                </span>
              </div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                {resolvedLocation}
              </p>
              <p className="text-[10px] font-mono text-slate-500 truncate">
                {activeDriver.currentCoordinates.lat.toFixed(5)}° N, {activeDriver.currentCoordinates.lng.toFixed(5)}° E
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>BROADCASTING</span>
            </span>
          </div>
        </div>
      )}

      {/* Telemetry Sensor Metrics (Battery, GPS, Accuracy) */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
            <Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Battery</span>
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
            {activeDriver.batteryLevel || 95}%
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
            <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Telemetry</span>
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
            {activeDriver.isOnline ? 'Transmitting' : 'Offline'}
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>GPS Lock</span>
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
            ±{activeDriver.gpsAccuracyMeters || 3.8}m
          </span>
        </div>
      </div>

      {/* GPS Mode Selector: Real Device Hardware GPS vs Simulated Patrol */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setGpsMode('HARDWARE');
              setIsSimulatingMovement(false);
            }}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
              gpsMode === 'HARDWARE'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            🛰️ Real GPS
          </button>
          <button
            type="button"
            onClick={() => setGpsMode('SIMULATOR')}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
              gpsMode === 'SIMULATOR'
                ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-2xs'
                : 'text-slate-500'
            }`}
          >
            ▶ Patrol Sim
          </button>
        </div>

        {gpsMode === 'SIMULATOR' ? (
          <button
            type="button"
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            disabled={!activeDriver.isOnline}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
              !activeDriver.isOnline
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : isSimulatingMovement
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {isSimulatingMovement ? '■ Pause Patrol' : '▶ Move Tricycle'}
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-slate-500">
            {hardwareGpsLocked ? '● Hardware Lock' : 'Searching satellites...'}
          </span>
        )}
      </div>

      {gpsError && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 rounded-xl text-[11px] border border-amber-200 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}
    </div>
  );
}

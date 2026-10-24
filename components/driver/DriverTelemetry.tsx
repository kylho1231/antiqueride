'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { Power, Battery, Compass, Radio, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';

export default function DriverTelemetry() {
  const { activeDriver, toggleDriverOnline, updateDriverGps } = useAppState();
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);

  // Simulated GPS movement loop for testing & live demonstration
  useEffect(() => {
    if (!isSimulatingMovement || !activeDriver.isOnline) return;

    // Movement offsets within San Jose de Buenavista municipal grid
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
      updateDriverGps(waypoints[index], 3.8);
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingMovement, activeDriver.isOnline]);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200/90 space-y-4">
      {/* Shift Toggle & Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shift Status</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`w-3 h-3 rounded-full ${
                activeDriver.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            ></span>
            <span className="font-extrabold text-sm text-[#102A43]">
              {activeDriver.isOnline ? 'Online • Ready for Rides' : 'Offline / Off-Duty'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDriverOnline}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
            activeDriver.isOnline
              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{activeDriver.isOnline ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* Terminal & Station Queue Position (Key Antique Transport Requirement) */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Station Assignment</span>
            <p className="font-bold text-slate-800">{activeDriver.terminalName}</p>
            <p className="text-[11px] text-slate-500">TODA: {activeDriver.todaName}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Queue / Pila</span>
          <span className="font-mono font-black text-emerald-800 text-sm bg-emerald-100/70 px-2 py-0.5 rounded-lg border border-emerald-200">
            Position #{activeDriver.queuePosition || 1}
          </span>
        </div>
      </div>

      {/* Telemetry Readouts (Battery, GPS Accuracy, Movement) */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5">
          <Battery className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Battery</span>
            <span className="font-bold text-slate-800">{activeDriver.batteryLevel || 85}% Charged</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-blue-600" />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">GPS Accuracy</span>
            <span className="font-bold text-slate-800">
              ±{activeDriver.gpsAccuracyMeters || 4.2}m (High)
            </span>
          </div>
        </div>
      </div>

      {/* GPS Movement Demo Toggle */}
      {activeDriver.isOnline && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              isSimulatingMovement
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <Compass className={`w-4 h-4 ${isSimulatingMovement ? 'animate-spin' : ''}`} />
            <span>
              {isSimulatingMovement
                ? 'Simulating Road Patrol in San Jose (Active)'
                : 'Test Live GPS Telemetry Movement'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role } from '@/lib/types';
import {
  ShieldAlert,
  Bell,
  Users,
  Compass,
  Car,
  ShieldCheck,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';
import SafetyModal from '@/components/safety/SafetyModal';

export default function Navbar() {
  const pathname = usePathname();
  const { currentRole, setCurrentRole, drivers, notifications, clearNotification } = useAppState();
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const onlineDriversCount = drivers.filter((d) => d.isOnline).length;

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#087F5B] flex items-center justify-center text-white font-black text-xl shadow-sm border border-emerald-700/20 group-hover:scale-105 transition-transform">
                  <span className="text-[#F5B301]">A</span>R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-[#102A43]">AntiqueRide</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      San Jose
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Your Ride. Your Antique.</p>
                </div>
              </Link>
            </div>

            {/* Role Switcher Pill (Quick Demonstration & Seamless Testing) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Link
                href="/commuter"
                onClick={() => handleRoleChange('COMMUTER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  pathname.startsWith('/commuter') || (pathname === '/' && currentRole === 'COMMUTER')
                    ? 'bg-[#087F5B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Commuter</span>
              </Link>

              <Link
                href="/driver"
                onClick={() => handleRoleChange('DRIVER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  pathname.startsWith('/driver')
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Driver Portal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </Link>

              <Link
                href="/admin"
                onClick={() => handleRoleChange('SUPER_ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Super Admin</span>
              </Link>
            </div>

            {/* Quick Actions (Safety hotline, Notifications, Driver indicator) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Online Drivers Indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{onlineDriversCount} Drivers Online</span>
              </div>

              {/* Safety Action Button */}
              <button
                onClick={() => setShowSafetyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#D92D20] border border-red-200 text-xs font-bold cursor-pointer transition-colors"
                title="Safety Center & Emergency Contacts"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">Safety Desk</span>
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-[#102A43]">Live Activity & Alerts</span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No recent notifications.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                            <div className="mt-0.5">
                              {n.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : n.type === 'warning' ? (
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Bell className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-slate-800">{n.title}</h5>
                                <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                            </div>
                            <button
                              onClick={() => clearNotification(n.id)}
                              className="text-slate-300 hover:text-slate-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Safety Modal Component */}
      <SafetyModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} />
    </>
  );
}

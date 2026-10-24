'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import {
  ShieldAlert,
  Bell,
  Users,
  Car,
  ShieldCheck,
  CheckCircle2,
  X,
  LogOut,
  LogIn,
  UserPlus,
  User,
} from 'lucide-react';
import SafetyModal from '@/components/safety/SafetyModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, drivers, notifications, clearNotification } = useAppState();
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const onlineDriversCount = drivers.filter((d) => d.isOnline).length;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
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

            {/* Authenticated Account Profile vs Sign In CTA (NO public role-switcher) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                /* Authenticated User Banner */
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
                    <div className="w-6 h-6 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-[10px]">
                      {currentUser.role === 'DRIVER' ? '🛺' : currentUser.role === 'SUPER_ADMIN' ? '⚡' : '👤'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800">
                        {currentUser.role === 'COMMUTER'
                          ? 'Commuter Account'
                          : currentUser.role === 'DRIVER'
                          ? `Unit #${currentUser.bodyNumber || '042'}`
                          : 'Super Admin'}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Sign Out of AntiqueRide"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                /* Unauthenticated Guest CTAs */
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/auth/register"
                    className="px-3.5 py-2 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </Link>
                </div>
              )}

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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import {
  ShieldAlert,
  Bell,
  CheckCircle2,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  Car,
  User,
  ShieldCheck,
} from 'lucide-react';
import SafetyModal from '@/components/safety/SafetyModal';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, notifications, clearNotification } = useAppState();
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isCommuterPath = pathname.startsWith('/commuter');
  const isDriverPath = pathname.startsWith('/driver');
  const isAdminPath = pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    if (isDriverPath) {
      router.push('/driver/login');
    } else if (isAdminPath) {
      router.push('/admin/login');
    } else {
      router.push('/commuter/login');
    }
  };

  // Strictly route logo click to the current portal's home
  const portalHome = currentUser
    ? currentUser.role === 'COMMUTER'
      ? '/commuter'
      : currentUser.role === 'DRIVER'
      ? '/driver'
      : '/admin'
    : isDriverPath
    ? '/driver'
    : isAdminPath
    ? '/admin'
    : isCommuterPath
    ? '/commuter'
    : '/';

  // Badge text for current portal
  const portalBadge = isDriverPath
    ? 'TODA Driver'
    : isAdminPath
    ? 'Super Admin'
    : isCommuterPath
    ? 'Commuter'
    : 'San Jose';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Tagline (Strictly routes within the active portal) */}
            <div className="flex items-center gap-3">
              <Link href={portalHome} className="flex items-center gap-2.5 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-blue-700 transition-colors">
                  <span className="text-white">A</span>
                  <span className="text-blue-200">R</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-slate-900">AntiqueRide</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {portalBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    {isDriverPath
                      ? 'TODA Tricycle Operator Console'
                      : isAdminPath
                      ? 'Regulatory Governance Monitor'
                      : 'Your Ride. Your Antique.'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Authenticated Account Profile vs Portal-Specific Guest CTAs */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser ? (
                /* Authenticated User Banner with Photo Avatar */
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-blue-50/70 rounded-2xl border border-slate-200 hover:border-blue-300 text-xs cursor-pointer transition-colors text-left"
                    title="Open Account Profile & Photo Settings"
                  >
                    {/* User Avatar Photo */}
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-white shadow-2xs">
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : currentUser.role === 'DRIVER' ? (
                        <Car className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="hidden sm:block">
                      <span className="font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700">
                        {currentUser.role === 'COMMUTER'
                          ? 'Commuter Portal'
                          : currentUser.role === 'DRIVER'
                          ? `Unit #${currentUser.bodyNumber || 'SJB-042'}`
                          : 'Super Admin'}
                      </span>
                    </div>

                    <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 ml-1 hidden sm:block" />
                  </button>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>
              ) : isDriverPath ? (
                /* Driver Portal Guest CTAs (Only Driver Links) */
                <div className="flex items-center gap-2">
                  <Link
                    href="/driver/login"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-600" />
                    <span>Driver Sign In</span>
                  </Link>

                  <Link
                    href="/driver/register"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Unit</span>
                  </Link>
                </div>
              ) : isAdminPath ? (
                /* Admin Portal Guest CTAs */
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/login"
                    className="px-3.5 py-2 bg-blue-900 text-white hover:bg-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                    <span>Admin Login</span>
                  </Link>
                </div>
              ) : isCommuterPath ? (
                /* Commuter Portal Guest CTAs (Only Commuter Links) */
                <div className="flex items-center gap-2">
                  <Link
                    href="/commuter/login"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/commuter/register"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </Link>
                </div>
              ) : (
                /* Home Gateway CTAs */
                <div className="flex items-center gap-2">
                  <Link
                    href="/commuter"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Commuter</span>
                  </Link>

                  <Link
                    href="/driver"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>TODA Driver</span>
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
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="fixed inset-x-3 top-16 sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Live Activity & Alerts</span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        aria-label="Close notifications"
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
                            <div className="mt-0.5 shrink-0">
                              {n.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              ) : n.type === 'warning' ? (
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Bell className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-bold text-xs text-slate-800 truncate">{n.title}</h5>
                                <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 break-words">{n.message}</p>
                            </div>
                            <button
                              onClick={() => clearNotification(n.id)}
                              className="p-1 text-slate-300 hover:text-slate-500 cursor-pointer shrink-0"
                              aria-label="Dismiss notification"
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

      {/* Profile & Photo Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Safety Modal Component */}
      <SafetyModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} />
    </>
  );
}

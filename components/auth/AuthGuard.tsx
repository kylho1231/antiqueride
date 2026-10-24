'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role } from '@/lib/types';
import { ShieldAlert, Lock, ArrowRight, LogOut, Users, Car, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAppState();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  const isCommuterPortal = allowedRoles.includes('COMMUTER');
  const isDriverPortal = allowedRoles.includes('DRIVER');
  const isAdminPortal = allowedRoles.includes('SUPER_ADMIN');

  // 1. Not Authenticated: Show Portal-Specific Login Screen
  if (!currentUser) {
    if (isCommuterPortal) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
              <Users className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Commuter Portal
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">Sign In to Book Tricycles</h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Please log in to your verified commuter account to request rides, calculate official fares, and track tricycles in San Jose.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/commuter/login?redirect=${encodeURIComponent(pathname)}`}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
              >
                <span>Sign In as Commuter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/commuter/register"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Register Commuter Account</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (isDriverPortal) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
              <Car className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                TODA Driver Operator Portal
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">Driver Sign In Required</h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Please sign in with your registered TODA mobile number and unit body number to access the dispatch console.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/driver/login?redirect=${encodeURIComponent(pathname)}`}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
              >
                <span>Sign In as TODA Driver</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/driver/register"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Register Tricycle Unit</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Admin Portal
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8 text-blue-300" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              Administrative Console
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">Super Admin Access Required</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              This console is restricted to authorized municipal transport officials and system administrators.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={`/admin/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full py-3.5 bg-blue-900 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <span>Sign In to Admin Gateway</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Unauthorized Role (Strict Separation of Portals)
  if (!allowedRoles.includes(currentUser.role)) {
    const userRoleLabel =
      currentUser.role === 'COMMUTER'
        ? 'Commuter'
        : currentUser.role === 'DRIVER'
        ? 'TODA Driver'
        : 'Super Admin';

    const targetHome =
      currentUser.role === 'COMMUTER'
        ? '/commuter'
        : currentUser.role === 'DRIVER'
        ? '/driver'
        : '/admin';

    const attemptedPortal = isCommuterPortal
      ? 'Commuter Portal'
      : isDriverPortal
      ? 'Driver Operational Console'
      : 'Super Admin Workspace';

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900">Portal Access Restricted</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              You are signed in with a <strong className="text-slate-900">{userRoleLabel}</strong> account. 
              You cannot access the <strong className="text-red-700">{attemptedPortal}</strong> from this session.
            </p>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 text-left space-y-1">
            <span className="font-bold">Strict Portal Separation Policy:</span>
            <p className="text-[11px] leading-relaxed text-red-800">
              Commuters and Drivers operate in separate portals to prevent unauthorized dispatch access and protect private user records.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={targetHome}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <span>Return to My {userRoleLabel} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={logout}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out / Switch Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated and Authorized
  return <>{children}</>;
}

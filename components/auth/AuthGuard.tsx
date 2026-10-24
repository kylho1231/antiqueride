'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role } from '@/lib/types';
import { ShieldAlert, Lock, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout } = useAppState();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">Verifying AntiqueRide credentials...</p>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated: Prompt Login
  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-[#102A43]">Authentication Required</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              To use AntiqueRide, you must sign in to your verified account or register a new one. 
              Guest or unauthenticated access to live transit dispatch is not permitted.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 text-left space-y-1">
            <div className="font-bold text-slate-700">Account Access Required:</div>
            <div>• <strong className="text-emerald-800">Commuters:</strong> Sign in with Google, Phone OTP, or Email</div>
            <div>• <strong className="text-[#102A43]">Drivers:</strong> Sign in with registered mobile & MTOP unit</div>
            <div>• <strong className="text-amber-800">Super Admin:</strong> Platform administrative key</div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full py-3.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/register"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Register New Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Unauthorized Role (Separation of Portals)
  if (!allowedRoles.includes(currentUser.role)) {
    const userRoleLabel =
      currentUser.role === 'COMMUTER'
        ? 'Commuter'
        : currentUser.role === 'DRIVER'
        ? 'Driver'
        : 'Super Admin';

    const requiredPortalName =
      allowedRoles.includes('DRIVER')
        ? 'Driver Operational Portal'
        : allowedRoles.includes('SUPER_ADMIN')
        ? 'Super Admin Workspace'
        : 'Commuter Portal';

    const targetHome =
      currentUser.role === 'COMMUTER'
        ? '/commuter'
        : currentUser.role === 'DRIVER'
        ? '/driver'
        : '/admin';

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-[#102A43]">Portal Access Restricted</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              You are signed in as <strong className="text-slate-900">{currentUser.fullName} ({userRoleLabel})</strong>. 
              This portal is strictly reserved for <strong className="text-slate-900">{requiredPortalName}</strong> users.
            </p>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 text-left space-y-1">
            <span className="font-bold">Strict Role Isolation Enforced:</span>
            <p className="text-[11px] leading-relaxed text-red-800">
              Under municipal transport and data isolation rules, commuters cannot access driver dispatch consoles, 
              and drivers cannot access commuter booking interfaces without a separate registered account.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={targetHome}
              className="w-full py-3.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <span>Return to My Authorized Portal ({userRoleLabel})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={logout}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Switch Account / Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated and Authorized
  return <>{children}</>;
}

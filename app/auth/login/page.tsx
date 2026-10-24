'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Car, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginRouterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    if (role === 'DRIVER') {
      router.replace(`/driver/login${redirectQuery}`);
    } else if (role === 'SUPER_ADMIN') {
      router.replace(`/admin/login${redirectQuery}`);
    } else if (role === 'COMMUTER') {
      router.replace(`/commuter/login${redirectQuery}`);
    }
  }, [role, redirect, router]);

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
          <span>A</span>
          <span className="text-blue-200">R</span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Sign In to AntiqueRide
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Please choose your dedicated portal to proceed to your authorized login console:
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Commuter Portal Option */}
          <Link
            href="/commuter/login"
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 flex items-center justify-between text-left cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700">
                  Commuter Portal
                </h3>
                <p className="text-[11px] text-slate-500">
                  Passenger ride booking and official municipal fares
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Driver Portal Option */}
          <Link
            href="/driver/login"
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 flex items-center justify-between text-left cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold shadow-xs">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700">
                  TODA Driver Portal
                </h3>
                <p className="text-[11px] text-slate-500">
                  Franchised tricycle dispatch and terminal queue
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600 font-semibold">
            ← Home
          </Link>
          <Link href="/admin/login" className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Gateway</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <LoginRouterContent />
    </Suspense>
  );
}

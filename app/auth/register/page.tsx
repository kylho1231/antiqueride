'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Car, ArrowRight, ShieldCheck } from 'lucide-react';

function RegisterRouterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  useEffect(() => {
    if (role === 'DRIVER') {
      router.replace('/driver/register');
    } else if (role === 'COMMUTER') {
      router.replace('/commuter/register');
    }
  }, [role, router]);

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
          <span>A</span>
          <span className="text-blue-200">R</span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Register for AntiqueRide
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose the portal for your account type:
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Commuter Register Option */}
          <Link
            href="/commuter/register"
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 flex items-center justify-between text-left cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700">
                  Register as Commuter
                </h3>
                <p className="text-[11px] text-slate-500">
                  For passengers • Student/Senior 20% discount validation
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Driver Register Option */}
          <Link
            href="/driver/register"
            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 flex items-center justify-between text-left cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold shadow-xs">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700">
                  Register as TODA Driver
                </h3>
                <p className="text-[11px] text-slate-500">
                  For operators • MTOP franchise & vehicle registration
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
          <div className="text-[11px]">
            Already registered?{' '}
            <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <RegisterRouterContent />
    </Suspense>
  );
}

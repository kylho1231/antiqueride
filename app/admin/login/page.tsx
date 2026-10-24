'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { AuthUser } from '@/lib/types';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const { login, currentUser } = useAppState();

  const [email, setEmail] = useState('admin@antiqueride.ph');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'SUPER_ADMIN') router.push('/admin');
      else if (currentUser.role === 'DRIVER') router.push('/driver');
      else router.push('/commuter');
    }
  }, [currentUser, router]);

  const executeLogin = (user: AuthUser) => {
    setIsLoading(true);
    setTimeout(() => {
      login(user);
      setIsLoading(false);
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push('/admin');
      }
    }, 500);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user: AuthUser = {
      id: 'admin-1',
      fullName: 'Platform Super Admin',
      email: email || 'admin@antiqueride.ph',
      role: 'SUPER_ADMIN',
    };
    executeLogin(user);
  };

  const handleDemoAdminLogin = () => {
    const user: AuthUser = {
      id: 'admin-1',
      fullName: 'Platform Super Admin',
      email: 'admin@antiqueride.ph',
      role: 'SUPER_ADMIN',
    };
    executeLogin(user);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {/* Dedicated Admin Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-blue-300" />
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
            Administrative Gateway
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">Super Admin Sign In</h1>
          <p className="text-xs text-slate-500">
            Authorized municipal transport governance and platform administration console
          </p>
        </div>

        {/* 1-Click Super Admin Login */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-blue-900 block tracking-wider">
            LGU Administrative Access:
          </span>
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-3 bg-blue-900 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-300" />
            <span>Sign In as Super Admin (admin@antiqueride.ph)</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400">
            or manual admin credentials
          </span>
        </div>

        <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Administrative Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@antiqueride.ph"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Security Key</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-900 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Administrative Console'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
          <Link href="/" className="font-semibold text-slate-600 hover:text-blue-600 underline">
            ← Return to AntiqueRide Main Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-900 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

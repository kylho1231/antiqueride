'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role, AuthUser } from '@/lib/types';
import {
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Users,
  Car,
  KeyRound,
  CheckCircle,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const roleParam = searchParams.get('role') as Role | null;

  const { login, currentUser } = useAppState();

  const [targetRole, setTargetRole] = useState<Role>(roleParam || 'COMMUTER');
  const [authMethod, setAuthMethod] = useState<'PHONE_OTP' | 'EMAIL'>('PHONE_OTP');
  const [phoneNumber, setPhoneNumber] = useState('0918-234-5678');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('maria.santos@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to matching portal
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'COMMUTER') router.push('/commuter');
      else if (currentUser.role === 'DRIVER') router.push('/driver');
      else if (currentUser.role === 'SUPER_ADMIN') router.push('/admin');
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
        if (user.role === 'COMMUTER') router.push('/commuter');
        else if (user.role === 'DRIVER') router.push('/driver');
        else router.push('/admin');
      }
    }, 600);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();

    let user: AuthUser;
    if (targetRole === 'COMMUTER') {
      user = {
        id: 'user-comm-1',
        fullName: 'Maria Santos',
        email: email || 'maria.santos@gmail.com',
        phone: phoneNumber || '0918-234-5678',
        role: 'COMMUTER',
        commuterId: 'comm-1',
      };
    } else if (targetRole === 'DRIVER') {
      user = {
        id: 'user-drv-1',
        fullName: 'Jose "Nong Joe" Mendoza',
        email: email || 'jose.mendoza@antiqueride.ph',
        phone: phoneNumber || '0917-882-9401',
        role: 'DRIVER',
        driverId: 'drv-1',
        bodyNumber: 'SJB-042',
        todaName: 'TTODA',
      };
    } else {
      user = {
        id: 'admin-1',
        fullName: 'Platform Super Admin',
        email: 'admin@antiqueride.ph',
        role: 'SUPER_ADMIN',
      };
    }

    executeLogin(user);
  };

  // Quick Demo Logins
  const handleDemoLogin = (role: Role) => {
    let user: AuthUser;
    if (role === 'COMMUTER') {
      user = {
        id: 'user-comm-1',
        fullName: 'Maria Santos',
        email: 'maria.santos@gmail.com',
        phone: '0918-234-5678',
        role: 'COMMUTER',
        commuterId: 'comm-1',
      };
    } else if (role === 'DRIVER') {
      user = {
        id: 'user-drv-1',
        fullName: 'Jose "Nong Joe" Mendoza',
        email: 'jose.mendoza@antiqueride.ph',
        phone: '0917-882-9401',
        role: 'DRIVER',
        driverId: 'drv-1',
        bodyNumber: 'SJB-042',
        todaName: 'TTODA',
      };
    } else {
      user = {
        id: 'admin-1',
        fullName: 'Super Admin',
        email: 'admin@antiqueride.ph',
        role: 'SUPER_ADMIN',
      };
    }

    executeLogin(user);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span>A</span>
            <span className="text-blue-200">R</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Sign in to AntiqueRide</h1>
          <p className="text-xs text-slate-500">
            Please log in with your authorized account role
          </p>
        </div>

        {/* Role Portal Selection */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTargetRole('COMMUTER')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              targetRole === 'COMMUTER' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Commuter
          </button>
          <button
            type="button"
            onClick={() => setTargetRole('DRIVER')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              targetRole === 'DRIVER' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Driver
          </button>
          <button
            type="button"
            onClick={() => setTargetRole('SUPER_ADMIN')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              targetRole === 'SUPER_ADMIN' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Super Admin
          </button>
        </div>

        {/* Quick 1-Click Demo Login Button for Testing */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Quick Pilot Demo Authentication:
          </span>
          <button
            type="button"
            onClick={() => handleDemoLogin(targetRole)}
            disabled={isLoading}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs text-white ${
              targetRole === 'COMMUTER'
                ? 'bg-blue-600 hover:bg-blue-700'
                : targetRole === 'DRIVER'
                ? 'bg-blue-800 hover:bg-blue-900'
                : 'bg-slate-800 hover:bg-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              {targetRole === 'COMMUTER'
                ? 'Sign In as Commuter (Maria Santos)'
                : targetRole === 'DRIVER'
                ? 'Sign In as Driver (Nong Joe #SJB-042)'
                : 'Sign In as Super Admin (admin@antiqueride.ph)'}
            </span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400">
            or sign in manually
          </span>
        </div>

        {/* Auth Method Selector */}
        <div className="flex border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setAuthMethod('PHONE_OTP')}
            className={`flex-1 pb-2 font-bold cursor-pointer transition-colors ${
              authMethod === 'PHONE_OTP'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-400'
            }`}
          >
            Mobile Number & OTP
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('EMAIL')}
            className={`flex-1 pb-2 font-bold cursor-pointer transition-colors ${
              authMethod === 'EMAIL'
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-400'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* Forms */}
        {authMethod === 'PHONE_OTP' ? (
          <form onSubmit={otpSent ? handleCustomLogin : (e) => { e.preventDefault(); setOtpSent(true); }} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Philippine Mobile Number</label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0917-000-0000"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-mono"
                  required
                />
                {!otpSent && (
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Send OTP
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Enter 6-Digit OTP</label>
                    <span className="text-[10px] text-blue-700 font-semibold">Sent to {phoneNumber}</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-center text-lg font-mono tracking-widest font-bold text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-sm"
                >
                  {isLoading ? 'Verifying...' : `Enter ${targetRole} Portal`}
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-sm"
            >
              {isLoading ? 'Signing In...' : `Sign In as ${targetRole}`}
            </button>
          </form>
        )}

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          Need an account?{' '}
          <Link href="/auth/register" className="font-bold text-blue-600 hover:underline">
            Register new account
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
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-semibold">Loading AntiqueRide sign-in...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

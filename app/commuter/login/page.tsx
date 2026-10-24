'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { AuthUser } from '@/lib/types';
import {
  Phone,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  Users,
} from 'lucide-react';

function CommuterLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const { login, currentUser, commuter } = useAppState();

  const [authMethod, setAuthMethod] = useState<'PHONE_OTP' | 'EMAIL'>('PHONE_OTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as commuter, redirect to /commuter
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'COMMUTER') router.push('/commuter');
      else if (currentUser.role === 'DRIVER') router.push('/driver');
      else router.push('/admin');
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
        router.push('/commuter');
      }
    }, 500);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let matchedName = '';
    let matchedId = 'comm-1';
    let matchedUserId = 'user-comm-' + Date.now();
    let matchedAvatar: string | undefined;

    try {
      const regUsersStr = localStorage.getItem('antiqueride_registered_users');
      if (regUsersStr) {
        const regUsers: AuthUser[] = JSON.parse(regUsersStr);
        const match = regUsers.find(
          (u) =>
            u.role === 'COMMUTER' &&
            ((phoneNumber && u.phone && u.phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')) ||
              (email && u.email && u.email.toLowerCase() === email.toLowerCase()))
        );
        if (match) {
          matchedName = match.fullName;
          matchedUserId = match.id;
          matchedId = match.commuterId || matchedId;
          matchedAvatar = match.avatarUrl;
        }
      }

      if (!matchedName && commuter) {
        if (
          (phoneNumber && commuter.phone && commuter.phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')) ||
          (email && commuter.email && commuter.email.toLowerCase() === email.toLowerCase())
        ) {
          matchedName = commuter.fullName;
          matchedUserId = commuter.userId;
          matchedId = commuter.id;
          matchedAvatar = commuter.avatarUrl;
        }
      }
    } catch (err) {}

    const user: AuthUser = {
      id: matchedUserId,
      fullName: matchedName || (email ? email.split('@')[0] : phoneNumber ? `Commuter (${phoneNumber})` : 'Antique Commuter'),
      email: email || 'commuter@antiqueride.ph',
      phone: phoneNumber || '0918-234-5678',
      role: 'COMMUTER',
      commuterId: matchedId,
      avatarUrl: matchedAvatar,
    };
    executeLogin(user);
  };

  const handleDemoCommuterLogin = () => {
    const user: AuthUser = {
      id: commuter?.userId || 'user-comm-1',
      fullName: commuter?.fullName || 'Antique Commuter',
      email: commuter?.email || 'commuter@antiqueride.ph',
      phone: commuter?.phone || '0918-234-5678',
      role: 'COMMUTER',
      commuterId: commuter?.id || 'comm-1',
      avatarUrl: commuter?.avatarUrl,
    };
    executeLogin(user);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {/* Dedicated Commuter Header (Blue & White) */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span>A</span>
            <span className="text-blue-200">R</span>
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Commuter Passenger Portal
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">Sign In as Commuter</h1>
          <p className="text-xs text-slate-500">
            Enter your commuter credentials to book tricycles across San Jose
          </p>
        </div>

        {/* 1-Click Commuter Sign In */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-blue-800 block tracking-wider">
            Quick Pilot Commuter Access:
          </span>
          <button
            type="button"
            onClick={handleDemoCommuterLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Quick Test as Commuter</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400">
            or sign in with mobile / email
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
                : 'text-slate-400 hover:text-slate-600'
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
                : 'text-slate-400 hover:text-slate-600'
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
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0917-000-0000"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>

            {otpSent && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 animate-in fade-in">
                <span className="text-[11px] font-bold text-blue-900 block">
                  Enter 4-Digit Code (Demo: 7492):
                </span>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="7492"
                  className="w-full text-center text-lg font-mono font-bold tracking-widest bg-white border border-blue-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-blue-600"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>{isLoading ? 'Verifying...' : otpSent ? 'Confirm & Open Commuter Portal' : 'Send One-Time PIN (OTP)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. commuter@antiqueride.ph"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Commuter Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
          <div>
            Don't have a commuter account?{' '}
            <Link href="/commuter/register" className="font-bold text-blue-600 hover:underline">
              Register as Commuter
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Are you a TODA tricycle driver?{' '}
            <Link href="/driver/login" className="font-semibold text-slate-700 hover:text-blue-600 underline">
              Go to TODA Driver Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommuterLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <CommuterLoginForm />
    </Suspense>
  );
}

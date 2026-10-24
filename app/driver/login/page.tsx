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
  Car,
} from 'lucide-react';

function DriverLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const { login, currentUser, drivers } = useAppState();

  const [authMethod, setAuthMethod] = useState<'PHONE_OTP' | 'EMAIL'>('PHONE_OTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as driver, redirect to /driver
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'DRIVER') router.push('/driver');
      else if (currentUser.role === 'COMMUTER') router.push('/commuter');
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
        router.push('/driver');
      }
    }, 500);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let matchedDriver = drivers.find(
      (d) =>
        (phoneNumber && d.phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')) ||
        (phoneNumber && d.bodyNumber.toLowerCase() === phoneNumber.toLowerCase().trim()) ||
        (email && d.email.toLowerCase() === email.toLowerCase().trim())
    );

    let matchedUser: AuthUser | undefined;
    try {
      const regUsersStr = localStorage.getItem('antiqueride_registered_users');
      if (regUsersStr) {
        const regUsers: AuthUser[] = JSON.parse(regUsersStr);
        matchedUser = regUsers.find(
          (u) =>
            u.role === 'DRIVER' &&
            ((phoneNumber && u.phone && u.phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')) ||
              (phoneNumber && u.bodyNumber && u.bodyNumber.toLowerCase() === phoneNumber.toLowerCase().trim()) ||
              (email && u.email && u.email.toLowerCase() === email.toLowerCase().trim()))
        );
      }
    } catch (e) {}

    const driverId = matchedDriver?.id || matchedUser?.driverId || 'drv-1';
    const bodyNumber = matchedDriver?.bodyNumber || matchedUser?.bodyNumber || 'SJB-042';
    const fullName = matchedDriver?.fullName || matchedUser?.fullName || (email ? email.split('@')[0] : phoneNumber ? `Driver (${phoneNumber})` : 'TODA Driver');
    const userEmail = email || matchedDriver?.email || matchedUser?.email || 'driver@antiqueride.ph';
    const userPhone = phoneNumber || matchedDriver?.phone || matchedUser?.phone || '0917-882-9401';
    const todaName = matchedDriver?.todaName || matchedUser?.todaName || 'TTODA';
    const avatarUrl = matchedDriver?.avatarUrl || matchedUser?.avatarUrl;

    const user: AuthUser = {
      id: matchedUser?.id || 'user-' + driverId,
      fullName,
      email: userEmail,
      phone: userPhone,
      role: 'DRIVER',
      driverId,
      bodyNumber,
      todaName,
      avatarUrl,
    };
    executeLogin(user);
  };

  const handleDemoDriverLogin = () => {
    const defaultDriver = drivers[0];
    const user: AuthUser = {
      id: defaultDriver?.userId || 'user-drv-1',
      fullName: defaultDriver?.fullName || 'Pilot Driver',
      email: defaultDriver?.email || 'driver@antiqueride.ph',
      phone: defaultDriver?.phone || '0917-882-9401',
      role: 'DRIVER',
      driverId: defaultDriver?.id || 'drv-1',
      bodyNumber: defaultDriver?.bodyNumber || 'SJB-042',
      todaName: defaultDriver?.todaName || 'TTODA',
      avatarUrl: defaultDriver?.avatarUrl,
    };
    executeLogin(user);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {/* Dedicated Driver Header (Blue & White) */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span>A</span>
            <span className="text-blue-200">R</span>
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            TODA Driver Operator Portal
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">Sign In as TODA Driver</h1>
          <p className="text-xs text-slate-500">
            Access your tricycle shift console, dispatch requests, and terminal queue
          </p>
        </div>

        {/* 1-Click Driver Sign In */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-blue-800 block tracking-wider">
            Quick Pilot Driver Access:
          </span>
          <button
            type="button"
            onClick={handleDemoDriverLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Quick Test as Pilot Driver (Unit #SJB-042)</span>
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
              <label className="block font-bold text-slate-700 mb-1">Registered Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0917-882-9401"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>

            {otpSent && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 animate-in fade-in">
                <span className="text-[11px] font-bold text-blue-900 block">
                  Enter 4-Digit Dispatch Code (Demo: 7492):
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
              <span>{isLoading ? 'Verifying...' : otpSent ? 'Confirm & Open Driver Console' : 'Send Driver Login OTP'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Driver Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@antiqueride.ph"
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
              <span>{isLoading ? 'Signing In...' : 'Sign In to Driver Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
          <div>
            New TODA driver?{' '}
            <Link href="/driver/register" className="font-bold text-blue-600 hover:underline">
              Register Your Tricycle Unit
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Looking for commuter ride booking?{' '}
            <Link href="/commuter/login" className="font-semibold text-slate-700 hover:text-blue-600 underline">
              Go to Commuter Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <DriverLoginForm />
    </Suspense>
  );
}

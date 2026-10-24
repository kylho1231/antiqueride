'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role } from '@/lib/types';
import { Phone, Mail, Lock, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole } = useAppState();

  const [authMethod, setAuthMethod] = useState<'PHONE_OTP' | 'EMAIL'>('PHONE_OTP');
  const [targetRole, setTargetRole] = useState<Role>('COMMUTER');
  const [phoneNumber, setPhoneNumber] = useState('0918-234-5678');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('maria.santos@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setCurrentRole(targetRole);
      setIsLoading(false);
      if (targetRole === 'COMMUTER') router.push('/commuter');
      else if (targetRole === 'DRIVER') router.push('/driver');
      else router.push('/admin');
    }, 800);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentRole(targetRole);
      setIsLoading(false);
      if (targetRole === 'COMMUTER') router.push('/commuter');
      else if (targetRole === 'DRIVER') router.push('/driver');
      else router.push('/admin');
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#087F5B] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span className="text-[#F5B301]">A</span>R
          </div>
          <h1 className="text-xl font-extrabold text-[#102A43]">Sign in to AntiqueRide</h1>
          <p className="text-xs text-slate-500">Your Ride. Your Antique.</p>
        </div>

        {/* Role Picker for Login */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTargetRole('COMMUTER')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              targetRole === 'COMMUTER' ? 'bg-[#087F5B] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Commuter
          </button>
          <button
            type="button"
            onClick={() => setTargetRole('DRIVER')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              targetRole === 'DRIVER' ? 'bg-[#102A43] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Driver
          </button>
          <button
            type="button"
            onClick={() => setTargetRole('SUPER_ADMIN')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              targetRole === 'SUPER_ADMIN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Super Admin
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] uppercase font-bold text-slate-400">or</span>
        </div>

        {/* Phone OTP vs Email Toggle */}
        <div className="flex border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setAuthMethod('PHONE_OTP')}
            className={`flex-1 pb-2 font-bold cursor-pointer transition-colors ${
              authMethod === 'PHONE_OTP'
                ? 'border-b-2 border-emerald-600 text-emerald-800'
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
                ? 'border-b-2 border-emerald-600 text-emerald-800'
                : 'text-slate-400'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* Phone OTP Form */}
        {authMethod === 'PHONE_OTP' && (
          <form onSubmit={otpSent ? handleLoginSubmit : handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Philippine Mobile Number</label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0917-000-0000"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-mono font-medium"
                  required
                />
                {!otpSent && (
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
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
                    <span className="text-[10px] text-emerald-700 font-semibold">Sent to {phoneNumber}</span>
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
                  <p className="text-[10px] text-slate-400 mt-1">
                    Demo OTP: Enter any 6 digits (e.g. 123456)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-sm"
                >
                  {isLoading ? 'Authenticating...' : 'Verify & Enter Portal'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Email Password Form */}
        {authMethod === 'EMAIL' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
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
              className="w-full py-3 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-sm"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          New to AntiqueRide?{' '}
          <Link href="/auth/register" className="font-bold text-emerald-800 hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
}

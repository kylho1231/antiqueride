'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role } from '@/lib/types';
import { TODA_ASSOCIATIONS } from '@/lib/data/antique-data';
import { Users, Car, Check, Shield } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAppState();

  const [registerRole, setRegisterRole] = useState<'COMMUTER' | 'DRIVER'>('COMMUTER');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Driver fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [bodyNumber, setBodyNumber] = useState('');
  const [todaId, setTodaId] = useState(TODA_ASSOCIATIONS[0].id);
  const [franchiseMtop, setFranchiseMtop] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      registerUser({
        fullName,
        phone,
        email,
        role: registerRole,
        licenseNumber,
        vehiclePlate,
        bodyNumber,
        todaId,
        franchiseMtop,
      });
      setIsLoading(false);
      setRegisteredSuccess(true);
      setTimeout(() => {
        if (registerRole === 'COMMUTER') router.push('/commuter');
        else router.push('/driver');
      }, 1000);
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#087F5B] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span className="text-[#F5B301]">A</span>R
          </div>
          <h1 className="text-xl font-extrabold text-[#102A43]">Register for AntiqueRide</h1>
          <p className="text-xs text-slate-500">
            San Jose de Buenavista Smart Transportation Service
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRegisterRole('COMMUTER')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
              registerRole === 'COMMUTER' ? 'bg-[#087F5B] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Commuter Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRegisterRole('DRIVER')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
              registerRole === 'DRIVER' ? 'bg-[#102A43] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driver / Operator</span>
          </button>
        </div>

        {registeredSuccess ? (
          <div className="py-8 text-center space-y-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Registration Successful!</h4>
            <p className="text-xs text-slate-500">Entering your AntiqueRide portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone (OTP)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-000-0000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Additional Driver Compliance Fields */}
            {registerRole === 'DRIVER' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 pt-3">
                <span className="font-extrabold text-xs text-[#102A43] block">
                  Tricycle Driver & MTOP Accreditation Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">LTO Driver License #</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="F02-XX-XXXXXX"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Vehicle Plate #</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="1234-AQ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Tricycle Body #</label>
                    <input
                      type="text"
                      value={bodyNumber}
                      onChange={(e) => setBodyNumber(e.target.value)}
                      placeholder="SJB-000"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">MTOP Franchise #</label>
                    <input
                      type="text"
                      value={franchiseMtop}
                      onChange={(e) => setFranchiseMtop(e.target.value)}
                      placeholder="MTOP-SJB-2024-XXXX"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Affiliated TODA Association</label>
                  <select
                    value={todaId}
                    onChange={(e) => setTodaId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {TODA_ASSOCIATIONS.map((toda) => (
                      <option key={toda.id} value={toda.id}>
                        {toda.acronym} — {toda.name} ({toda.barangay})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
              By creating an account, you agree to the AntiqueRide Terms of Service and Privacy Policy under Republic Act No. 10173 (Philippine Data Privacy Act).
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-md"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-emerald-800 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

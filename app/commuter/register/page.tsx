'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import {
  Users,
  Camera,
  Upload,
  Phone,
  Mail,
  Lock,
  User,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function CommuterRegisterPage() {
  const router = useRouter();
  const { registerUser } = useAppState();

  // Personal Credentials
  const [fullName, setFullName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('09');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // OTP Verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Commuter ID & Discount Category
  const [commuterIdType, setCommuterIdType] = useState<
    'STUDENT_ID' | 'PHILSYS_ID' | 'DRIVERS_LICENSE' | 'VOTERS_ID' | 'SENIOR_ID' | 'PWD_ID'
  >('STUDENT_ID');
  const [commuterIdNumber, setCommuterIdNumber] = useState('');
  const [commuterIdPhoto, setCommuterIdPhoto] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCommuterIdPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert('Please enter a valid Philippine mobile number (e.g. 0918-123-4567)');
      return;
    }
    setOtpSent(true);
    setOtpCode('7492'); // Auto-populate OTP for seamless verification
  };

  const handleVerifyOtp = () => {
    if (otpCode === '7492' || otpCode.length === 4) {
      setIsPhoneVerified(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isStudent = commuterIdType === 'STUDENT_ID';
    const isSenior = commuterIdType === 'SENIOR_ID';
    const isPwd = commuterIdType === 'PWD_ID';

    setTimeout(() => {
      registerUser({
        fullName,
        legalName: legalName || fullName,
        phone,
        email,
        role: 'COMMUTER',
        avatarUrl: profilePhoto || undefined,
        idDocumentType: commuterIdType as any,
        idDocumentUrl: commuterIdPhoto || undefined,
        discountCategory: isStudent ? 'STUDENT' : isSenior ? 'SENIOR' : isPwd ? 'PWD' : 'NONE',
      });

      setIsLoading(false);
      setRegisteredSuccess(true);
      setTimeout(() => {
        router.push('/commuter');
      }, 900);
    }, 700);
  };

  const isStudentSelected = commuterIdType === 'STUDENT_ID';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Dedicated Commuter Header (Blue and White) */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span>A</span>
            <span className="text-blue-200">R</span>
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Commuter Passenger Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Create Commuter Account
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Book authorized tricycles, check official fares, and track rides across San Jose de Buenavista, Antique.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Photo Upload Section */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-blue-200" />
                )}
              </div>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-blue-700 text-white shadow-xs hover:bg-blue-800 cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={profileInputRef}
                onChange={handleProfilePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-xs text-slate-900">Commuter Profile Photo</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add a photo of yourself so participating TODA drivers can easily recognize you at pickup.
              </p>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {profilePhoto ? 'Change Photo' : '+ Upload Profile Photo'}
              </button>
            </div>
          </div>

          {/* Names Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Legal Name (on School / Gov ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Maria Clara Santos y Reyes"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Mobile Number with SMS OTP Step */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Philippine Mobile Number (for SMS OTP) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-123-4567"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
                />
              </div>

              {!isPhoneVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
                >
                  {otpSent ? 'Resend OTP' : 'Send SMS OTP'}
                </button>
              ) : (
                <div className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Number Verified</span>
                </div>
              )}
            </div>

            {/* OTP Verification Box */}
            {otpSent && !isPhoneVerified && (
              <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-blue-900 block">
                    Enter 4-Digit Verification Code sent to {phone}:
                  </span>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="7492"
                    className="w-28 text-center text-sm font-mono font-bold tracking-widest bg-white border border-blue-300 rounded-lg px-2 py-1 mt-1 text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commuter@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Commuter ID & Mandatory 20% Discount Verification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Identity Document & Mandatory 20% Discount</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                RA 10642 / RA 9994 / RA 9442
              </span>
            </div>

            {/* Student 20% Highlight Banner */}
            {isStudentSelected && (
              <div className="p-2.5 bg-blue-100/70 border border-blue-300 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Student Account Selected: Entitles you to 20% discount on all tricycle fares in San Jose!
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select ID Type
                </label>
                <select
                  value={commuterIdType}
                  onChange={(e) => setCommuterIdType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                >
                  <option value="STUDENT_ID">School ID (Student — 20% Off)</option>
                  <option value="SENIOR_ID">Senior Citizen OSCA ID (20% Off)</option>
                  <option value="PWD_ID">Persons with Disability ID (20% Off)</option>
                  <option value="PHILSYS_ID">PhilSys National ID</option>
                  <option value="DRIVERS_LICENSE">LTO Driver's License</option>
                  <option value="VOTERS_ID">COMELEC Voter's ID</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ID Document / Student ID #
                </label>
                <input
                  type="text"
                  value={commuterIdNumber}
                  onChange={(e) => setCommuterIdNumber(e.target.value)}
                  placeholder="e.g. UA-2024-0891 or PhilSys ID"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>

            {/* Document Upload Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Upload Photo of School ID or Government ID
              </label>
              <div
                onClick={() => idDocInputRef.current?.click()}
                className="p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white rounded-xl text-center cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-700 block">
                  {commuterIdPhoto ? 'Document Uploaded (Click to change)' : 'Upload ID Document Photo'}
                </span>
                <span className="text-[10px] text-slate-400">Clear front photo of your ID card</span>
                <input
                  type="file"
                  ref={idDocInputRef}
                  onChange={handleIdDocChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {registeredSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Registration successful! Opening your Commuter Portal...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || registeredSuccess}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <span>
              {isLoading ? 'Creating Account...' : 'Complete Commuter Registration'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Dedicated Commuter Sign In Link */}
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
          <div>
            Already have a Commuter account?{' '}
            <Link href="/commuter/login" className="font-bold text-blue-600 hover:underline">
              Sign In to Commuter Portal
            </Link>
          </div>

          {/* Clear Driver Portal Redirect Notice */}
          <div className="pt-2 text-[11px] text-slate-400">
            Are you a TODA tricycle driver?{' '}
            <Link href="/driver/register" className="font-semibold text-slate-700 hover:text-blue-600 underline">
              Register at the TODA Driver Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

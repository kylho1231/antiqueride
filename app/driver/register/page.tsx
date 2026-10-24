'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { TODA_ASSOCIATIONS } from '@/lib/data/antique-data';
import {
  Car,
  Camera,
  Upload,
  Phone,
  Mail,
  Lock,
  User,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function DriverRegisterPage() {
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

  // Driver Compliance & TODA Fields
  const [driverGovIdType, setDriverGovIdType] = useState('PhilSys National ID');
  const [driverGovIdPhoto, setDriverGovIdPhoto] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [bodyNumber, setBodyNumber] = useState('');
  const [todaId, setTodaId] = useState(TODA_ASSOCIATIONS[0].id);
  const [franchiseMtop, setFranchiseMtop] = useState('');

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
      reader.onload = () => setDriverGovIdPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert('Please enter a valid Philippine mobile number (e.g. 0917-882-9401)');
      return;
    }
    setOtpSent(true);
    setOtpCode('7492');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '7492' || otpCode.length === 4) {
      setIsPhoneVerified(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      registerUser({
        fullName,
        legalName: legalName || fullName,
        phone,
        email,
        role: 'DRIVER',
        avatarUrl: profilePhoto || undefined,
        governmentIdType: driverGovIdType,
        governmentIdUrl: driverGovIdPhoto || undefined,
        licenseNumber: licenseNumber || 'F02-24-000123',
        vehiclePlate: vehiclePlate || '1201-AQ',
        bodyNumber: bodyNumber || 'SJB-042',
        todaId,
        franchiseMtop: franchiseMtop || 'MTOP-SJB-2024-0042',
      });

      setIsLoading(false);
      setRegisteredSuccess(true);
      setTimeout(() => {
        router.push('/driver');
      }, 900);
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Dedicated Driver Header (Blue and White) */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span>A</span>
            <span className="text-blue-200">R</span>
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            TODA Driver Operator Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Register Franchised Tricycle Unit
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Authorized municipal transport platform for San Jose de Buenavista TODA drivers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Driver Photo Upload */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Driver Profile" className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-8 h-8 text-blue-200" />
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
              <h4 className="font-extrabold text-xs text-slate-900">Driver Operator Photo</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload a clear photo of yourself for passenger verification and TMPSO regulatory safety.
              </p>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {profilePhoto ? 'Change Photo' : '+ Upload Driver Photo'}
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
                placeholder='e.g. Jose "Nong Joe" Mendoza'
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Legal Name (on Government ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Jose Mendoza y Alvarez"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Mobile Number with SMS OTP Step */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Philippine Mobile Number (for Dispatch Alerts & SMS OTP) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-882-9401"
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
                    Enter 4-Digit Dispatch Code sent to {phone}:
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
                  placeholder="driver@antiqueride.ph"
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

          {/* TODA Association & Unit Credentials */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>San Jose de Buenavista Franchise & Regulatory Documents</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Government ID Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={driverGovIdType}
                  onChange={(e) => setDriverGovIdType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                >
                  <option value="PhilSys National ID">PhilSys National ID</option>
                  <option value="LTO Driver's License">LTO Driver's License</option>
                  <option value="UMID">UMID Card</option>
                  <option value="Voter's ID">COMELEC Voter's ID</option>
                  <option value="Passport">Philippine Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  LTO Professional License # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. F02-12-004819"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  TODA Association <span className="text-red-500">*</span>
                </label>
                <select
                  value={todaId}
                  onChange={(e) => setTodaId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                >
                  {TODA_ASSOCIATIONS.map((toda) => (
                    <option key={toda.id} value={toda.id}>
                      {toda.name} ({toda.acronym})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Body Number (Unit #) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bodyNumber}
                  onChange={(e) => setBodyNumber(e.target.value)}
                  placeholder="e.g. SJB-042"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Vehicle Plate # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="e.g. 1201-AQ"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Franchise MTOP Permit # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={franchiseMtop}
                  onChange={(e) => setFranchiseMtop(e.target.value)}
                  placeholder="e.g. MTOP-SJB-2024-0042"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>

            {/* Document Upload Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Upload Government ID or Franchise Document Photo
              </label>
              <div
                onClick={() => idDocInputRef.current?.click()}
                className="p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white rounded-xl text-center cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-700 block">
                  {driverGovIdPhoto ? 'Document Uploaded (Click to change)' : 'Upload Gov ID / MTOP Document'}
                </span>
                <span className="text-[10px] text-slate-400">Clear photo or scanned copy</span>
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
              <span>Registration submitted! Opening Driver Operator Portal...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || registeredSuccess}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <span>
              {isLoading ? 'Registering Unit...' : 'Complete TODA Driver Registration'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Dedicated Driver Sign In Link */}
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
          <div>
            Already registered as a TODA Driver?{' '}
            <Link href="/driver/login" className="font-bold text-blue-600 hover:underline">
              Sign In to Driver Portal
            </Link>
          </div>

          {/* Clear Commuter Portal Redirect Notice */}
          <div className="pt-2 text-[11px] text-slate-400">
            Looking for passenger ride booking?{' '}
            <Link href="/commuter/register" className="font-semibold text-slate-700 hover:text-blue-600 underline">
              Register at the Commuter Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

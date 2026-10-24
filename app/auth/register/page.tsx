'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store/app-state';
import { Role } from '@/lib/types';
import { TODA_ASSOCIATIONS } from '@/lib/data/antique-data';
import {
  Users,
  Car,
  Check,
  Shield,
  Camera,
  Upload,
  Phone,
  Mail,
  Lock,
  User,
  FileText,
  Sparkles,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAppState();

  const [registerRole, setRegisterRole] = useState<'COMMUTER' | 'DRIVER'>('COMMUTER');

  // Common Identity Fields
  const [fullName, setFullName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('09');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Commuter ID & Student Discount Fields
  const [commuterIdType, setCommuterIdType] = useState<
    'STUDENT_ID' | 'PHILSYS_ID' | 'DRIVERS_LICENSE' | 'VOTERS_ID' | 'SENIOR_ID' | 'PWD_ID'
  >('STUDENT_ID');
  const [commuterIdNumber, setCommuterIdNumber] = useState('');
  const [commuterIdPhoto, setCommuterIdPhoto] = useState<string | null>(null);

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

  // Handle Profile Photo Upload
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle ID Document Upload
  const handleIdDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (registerRole === 'COMMUTER') {
          setCommuterIdPhoto(reader.result as string);
        } else {
          setDriverGovIdPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate OTP Verification
  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert('Please enter a valid Philippine mobile number (e.g. 0918-123-4567)');
      return;
    }
    setOtpSent(true);
    setOtpCode('7492'); // Auto-populate for seamless UX
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
        role: registerRole,
        avatarUrl: profilePhoto || undefined,
        // Commuter fields
        idDocumentType: commuterIdType as any,
        idDocumentUrl: commuterIdPhoto || undefined,
        discountCategory: isStudent ? 'STUDENT' : isSenior ? 'SENIOR' : isPwd ? 'PWD' : 'NONE',
        // Driver fields
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
        if (registerRole === 'COMMUTER') router.push('/commuter');
        else router.push('/driver');
      }, 1000);
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header (Blue and White) */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            <span>A</span>
            <span className="text-blue-200">R</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Register for AntiqueRide
          </h1>
          <p className="text-xs text-slate-500">
            Official Smart Tricycle Transportation Platform • San Jose de Buenavista, Antique
          </p>
        </div>

        {/* Role Portal Selection Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRegisterRole('COMMUTER')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
              registerRole === 'COMMUTER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Commuter Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRegisterRole('DRIVER')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
              registerRole === 'DRIVER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>TODA Driver Operator</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo Upload Section */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-blue-100" />
                )}
              </div>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                title="Add your photo"
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
              <h4 className="font-bold text-xs text-slate-900">Your Profile Photo</h4>
              <p className="text-[11px] text-slate-500">
                Add a photo of yourself for passenger/driver verification and safety.
              </p>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>{profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>

          {/* Full Name & Legal Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Legal Name (As on Government ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Maria Clara Santos"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Mobile Number for OTP Verification */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mobile Number (For OTP Verification) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0918-234-5678"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
              {!isPhoneVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              ) : (
                <span className="px-3 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {/* OTP Code Entry */}
            {otpSent && !isPhoneVerified && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-2 animate-in fade-in">
                <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 4-digit OTP (7492)"
                  className="w-32 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Confirm Code
                </button>
                <span className="text-[11px] text-blue-700 ml-auto hidden sm:inline">
                  Demo Code: <strong>7492</strong>
                </span>
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
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* ROLE SPECIFIC COMPLIANCE SECTION */}
          {registerRole === 'COMMUTER' ? (
            /* COMMUTER IDENTIFICATION & STUDENT DISCOUNT HIGHLIGHT */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    Identification Document & Fare Discount
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Students, Seniors, and PWD receive a verified 20% fare discount.
                  </p>
                </div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  RA 10642
                </span>
              </div>

              {/* Discount Highlight Badge Preview */}
              {commuterIdType === 'STUDENT_ID' && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student 20% Discount will be Highlighted on your Account</span>
                  </span>
                  <span className="font-extrabold font-mono text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    20% OFF
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={commuterIdType}
                    onChange={(e) => setCommuterIdType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="STUDENT_ID">School ID (Student 20% Discount)</option>
                    <option value="PHILSYS_ID">PhilSys National ID</option>
                    <option value="DRIVERS_LICENSE">LTO Driver's License</option>
                    <option value="VOTERS_ID">COMELEC Voter's ID</option>
                    <option value="SENIOR_ID">Senior Citizen OSCA ID (20% Discount)</option>
                    <option value="PWD_ID">PWD Identification Card (20% Discount)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ID / Student Number
                  </label>
                  <input
                    type="text"
                    value={commuterIdNumber}
                    onChange={(e) => setCommuterIdNumber(e.target.value)}
                    placeholder="e.g. 2024-00129"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Upload ID Document File */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Upload School ID or Government ID Photo
                </label>
                <div
                  onClick={() => idDocInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white rounded-xl text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-700 block">
                    {commuterIdPhoto ? 'ID Document Uploaded (Click to change)' : 'Click to Upload ID Photo'}
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
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
          ) : (
            /* TODA DRIVER OPERATOR COMPLIANCE SECTION */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  TODA Franchise & Government Identification
                </h4>
                <p className="text-[11px] text-slate-500">
                  Required under San Jose de Buenavista Municipal Ordinance No. 2023-014.
                </p>
              </div>

              {/* TODA Association & Government ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    TODA Association in San Jose <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={todaId}
                    onChange={(e) => setTodaId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    {TODA_ASSOCIATIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.acronym} — {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Driver Government ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={driverGovIdType}
                    onChange={(e) => setDriverGovIdType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="PhilSys National ID">PhilSys National ID</option>
                    <option value="LTO Driver License">LTO Professional Driver's License</option>
                    <option value="UMID">UMID / SSS Card</option>
                    <option value="Voters ID">COMELEC Voter's ID</option>
                    <option value="Passport">Philippine Passport</option>
                  </select>
                </div>
              </div>

              {/* License Number & Vehicle Plate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    LTO Driver License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. F02-12-004819"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Vehicle Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="e.g. 1201-AQ"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Tricycle Body Number & Franchise MTOP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Municipal Body Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bodyNumber}
                    onChange={(e) => setBodyNumber(e.target.value)}
                    placeholder="e.g. SJB-042"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Government ID & MTOP documents */}
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
          )}

          {/* Feedback */}
          {registeredSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Registration successful! Routing you to your verified {registerRole === 'COMMUTER' ? 'Commuter' : 'Driver'} portal...
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || registeredSuccess}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <span>
              {isLoading
                ? 'Registering Account...'
                : `Complete Registration as ${registerRole === 'COMMUTER' ? 'Commuter' : 'TODA Driver'}`}
            </span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

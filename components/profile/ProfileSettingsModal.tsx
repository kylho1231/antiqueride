'use client';

import React, { useState, useRef } from 'react';
import { useAppState } from '@/lib/store/app-state';
import {
  Camera,
  User,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  X,
  CheckCircle2,
  Upload,
  Sparkles,
  Car,
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const {
    currentUser,
    commuter,
    activeDriver,
    updateUserProfilePhoto,
    updateCommuterProfile,
    updateDriverProfile,
  } = useAppState();

  const isDriver = currentUser?.role === 'DRIVER';

  // Form states
  const [fullName, setFullName] = useState(
    currentUser?.fullName || (isDriver ? activeDriver.fullName : commuter.fullName)
  );
  const [legalName, setLegalName] = useState(
    currentUser?.legalName ||
      (isDriver ? activeDriver.legalName : commuter.legalName) ||
      fullName
  );
  const [phone, setPhone] = useState(
    currentUser?.phone || (isDriver ? activeDriver.phone : commuter.phone)
  );
  const [email, setEmail] = useState(
    currentUser?.email || (isDriver ? activeDriver.email : commuter.email)
  );
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(
    currentUser?.avatarUrl || (isDriver ? activeDriver.avatarUrl : commuter.avatarUrl) || null
  );

  // Commuter ID upload state
  const [idType, setIdType] = useState(
    commuter.idDocumentType || 'STUDENT_ID'
  );
  const [idNumber, setIdNumber] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewPhoto(result);
        updateUserProfilePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDriver) {
      updateDriverProfile({
        fullName,
        legalName,
        phone,
        email,
        avatarUrl: previewPhoto || undefined,
      });
    } else {
      const isStudent = idType === 'STUDENT_ID';
      updateCommuterProfile({
        fullName,
        legalName,
        phone,
        email,
        avatarUrl: previewPhoto || undefined,
        idDocumentType: idType as any,
        discountCategory: isStudent ? 'STUDENT' : commuter.discountCategory,
        verificationStatus: isStudent ? 'VERIFIED' : commuter.verificationStatus,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
              AntiqueRide Profile
            </span>
            <h3 className="font-extrabold text-lg text-slate-900">
              Account Settings & Identity
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Photo Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md overflow-hidden border-2 border-white">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-transform hover:scale-110"
              title="Upload your photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {fullName || 'Your Name'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDriver ? (
                <span className="font-semibold text-blue-700">
                  Tricycle Driver • Unit #{activeDriver.bodyNumber} ({activeDriver.todaName})
                </span>
              ) : (
                <span className="font-semibold text-blue-700">
                  Verified Commuter • San Jose de Buenavista
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Profile Picture</span>
            </button>
          </div>
        </div>

        {/* Student Discount Highlight Banner (for Commuters) */}
        {!isDriver && (
          <div className="p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>20% Statutory Discount</span>
              </div>
              <p className="text-[11px] text-blue-100">
                Mandatory discount under RA 10642 (Student) / RA 9994 (Senior) / RA 9442 (PWD).
              </p>
            </div>
            <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-white text-blue-700 shadow-xs">
              {commuter.discountCategory === 'STUDENT'
                ? 'Student Active'
                : commuter.discountCategory === 'SENIOR'
                ? 'Senior Active'
                : commuter.discountCategory === 'PWD'
                ? 'PWD Active'
                : 'Eligible with ID'}
            </span>
          </div>
        )}

        {/* Profile Information Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Full Name & Legal Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Maria Santos"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Legal Name (As on Gov ID)
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Maria Clara Santos"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (For OTP Verification)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="0918-234-5678"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="name@example.com"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Role Specific Identification Details */}
          {isDriver ? (
            /* Driver Operator Official Information */
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <span className="font-extrabold text-slate-900 block text-xs">
                Municipal Transport Franchise Information (San Jose LGU)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block font-medium">LTO Driver License:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeDriver.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Franchise MTOP #:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeDriver.franchiseMtopNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tricycle Body Number:</span>
                  <span className="font-bold text-blue-700 font-mono">{activeDriver.bodyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">TODA Association:</span>
                  <span className="font-bold text-slate-800">{activeDriver.todaName}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Commuter Verification & ID Option */
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <span className="font-extrabold text-slate-900 block text-xs">
                Identification Document for Fare Discount
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ID Document Type
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="STUDENT_ID">School ID (Student 20% Discount)</option>
                    <option value="PHILSYS_ID">PhilSys National ID</option>
                    <option value="DRIVERS_LICENSE">LTO Driver's License</option>
                    <option value="VOTERS_ID">COMELEC Voter's ID</option>
                    <option value="SENIOR_ID">Senior Citizen OSCA ID</option>
                    <option value="PWD_ID">PWD Identification Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ID / Student Number
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. 2024-1082"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Feedback & Actions */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings saved! Your profile and photo have been updated.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md transition-all active:scale-95"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

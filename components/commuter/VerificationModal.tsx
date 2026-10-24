'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { Shield, Upload, Check, AlertCircle, X, FileText } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const { commuter, submitCommuterVerification } = useAppState();
  const [docType, setDocType] = useState<'STUDENT_ID' | 'GOVERNMENT_ID' | 'VOTERS_ID'>('STUDENT_ID');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      submitCommuterVerification(docType, fileName ? `/uploads/${fileName}` : '/uploads/student_id.png');
      setIsUploading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#102A43]">Commuter Verification</h4>
              <p className="text-[11px] text-slate-500">Student & Senior/PWD 20% Discount</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-sm text-slate-900">Document Submitted</h5>
            <p className="text-xs text-slate-500">
              Your document is queued for Super Admin review. You will be notified once verified!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Privacy Notice Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-emerald-700" />
                Data Privacy Act Compliance (RA 10173)
              </span>
              <p className="text-[11px] leading-relaxed">
                ID documents are encrypted, stored in private storage buckets, and accessed solely by authorized AntiqueRide verifiers to authenticate student, senior, and PWD passenger discount entitlements.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium"
              >
                <option value="STUDENT_ID">Current Student ID (e.g. ANS, UA, St. Anthony)</option>
                <option value="GOVERNMENT_ID">Senior Citizen OSCA ID or PWD ID Card</option>
                <option value="VOTERS_ID">National ID (PhilSys) / Government Valid ID</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Upload Document Photo</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 bg-slate-50/50 transition-colors">
                <input
                  type="file"
                  id="idDocFile"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="idDocFile"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="font-bold text-emerald-700">
                    {fileName ? fileName : 'Tap to select document file'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPEG, PNG or PDF up to 5MB</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 bg-[#087F5B] hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm"
            >
              {isUploading ? 'Encrypting & Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

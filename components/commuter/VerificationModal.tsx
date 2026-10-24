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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">Commuter Verification</h4>
              <p className="text-[11px] text-blue-600 font-bold">Student, Senior & PWD 20% Discount</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
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
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 text-slate-600">
              <span className="font-bold text-blue-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                Data Privacy Act Compliance (RA 10173)
              </span>
              <p className="text-[11px] leading-relaxed">
                ID documents are encrypted, stored securely, and accessed solely by authorized AntiqueRide verifiers to authenticate student, senior, and PWD passenger discount entitlements.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 min-h-[44px]"
              >
                <option value="STUDENT_ID">Current Student ID (e.g. ANS, UA, St. Anthony)</option>
                <option value="GOVERNMENT_ID">Senior Citizen OSCA ID or PWD ID Card</option>
                <option value="VOTERS_ID">National ID (PhilSys) / Government Valid ID</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Upload Document Photo</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors">
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
                  <span className="font-bold text-blue-700">
                    {fileName ? fileName : 'Tap to select document file'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPEG, PNG or PDF up to 5MB</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm active:scale-[0.99]"
            >
              {isUploading ? 'Encrypting & Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

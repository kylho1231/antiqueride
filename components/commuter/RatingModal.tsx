'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { Star, Check, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  rideId: string;
  driverName: string;
  onClose: () => void;
}

export default function RatingModal({ isOpen, rideId, driverName, onClose }: RatingModalProps) {
  const { rateTrip } = useAppState();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const compliments = ['Safe Driving', 'Polite & Courteous', 'Clean Tricycle', 'Fair Ordinance Fare', 'Fast Pickup'];

  const handleComplimentToggle = (tag: string) => {
    if (feedback.includes(tag)) {
      setFeedback(feedback.replace(tag, '').trim());
    } else {
      setFeedback((prev) => (prev ? `${prev}, ${tag}` : tag));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateTrip(rideId, rating, feedback);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center">
          <h4 className="font-black text-base text-slate-900">Rate Your Trip</h4>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer" aria-label="Close rating modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-sm text-slate-900">Thank You!</h5>
            <p className="text-xs text-slate-500">Your feedback helps improve transport standards across Antique.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 text-center">
              How was your tricycle ride with <span className="font-bold text-slate-800">{driverName}</span>?
            </p>

            {/* Star Rating */}
            <div className="flex justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:scale-110 active:scale-95 transition-transform"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Compliment Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {compliments.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleComplimentToggle(tag)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[11px] font-semibold cursor-pointer transition-all ${
                      feedback.includes(tag)
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add optional notes or driver commendation..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
            />

            <button
              type="submit"
              className="w-full py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer transition-colors shadow-sm active:scale-[0.99]"
            >
              Submit Rating
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

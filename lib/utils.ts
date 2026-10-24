import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Coordinates, FarePolicy, RideType, TripFareSnapshot } from '@/lib/types';
import { OFFICIAL_FARE_POLICY } from '@/lib/data/antique-data';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the great-circle distance between two points using the Haversine formula
 */
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;

  // Real road multiplier (usually 1.25x - 1.35x of straight line distance in municipal grid)
  const roadEstimatedDist = rawDist * 1.3;
  return Math.round(roadEstimatedDist * 10) / 10;
}

/**
 * Computes official fare according to municipal fare ordinance rules
 */
export function calculateFare(
  distanceKm: number,
  rideType: RideType,
  discountCategory: 'NONE' | 'STUDENT' | 'SENIOR' | 'PWD' = 'NONE',
  policy: FarePolicy = OFFICIAL_FARE_POLICY
): TripFareSnapshot {
  let baseFare = 0;
  let distanceCharge = 0;
  let isNegotiatedSpecial = false;

  if (rideType === 'REGULAR') {
    baseFare = policy.baseFareRegular;
    if (distanceKm > policy.baseKmRegular) {
      const extraKm = distanceKm - policy.baseKmRegular;
      distanceCharge = Math.ceil(extraKm) * policy.succeedingPerKmRegular;
    }
  } else {
    // Special / Exclusive Pakyaw
    baseFare = policy.specialTripBaseFare;
    isNegotiatedSpecial = true;
    // Standard surcharge for long inter-barangay special charter trips beyond 3km
    if (distanceKm > 3.0) {
      const extraKm = distanceKm - 3.0;
      distanceCharge = Math.ceil(extraKm) * 8.0;
    }
  }

  const subtotal = baseFare + distanceCharge;
  let discountPct = 0;

  // Statutory 20% discount on public transportation in the Philippines
  if (discountCategory === 'STUDENT') {
    discountPct = policy.studentDiscountPct;
  } else if (discountCategory === 'SENIOR' || discountCategory === 'PWD') {
    discountPct = policy.seniorPwdDiscountPct;
  }

  const discountAmount = Math.round(subtotal * discountPct * 100) / 100;
  const totalFare = Math.max(10, Math.round((subtotal - discountAmount) * 100) / 100);

  return {
    baseFare,
    distanceKm,
    distanceCharge,
    discountPct,
    discountAmount,
    totalFare,
    isNegotiatedSpecial,
    currency: 'PHP',
    farePolicyRef: policy.sourceOrdinance,
  };
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

export function generatePinCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Determines whether driver GPS report is considered stale (> 45 seconds old)
 */
export function isGpsStale(lastGpsUpdateIso: string | null, thresholdSeconds = 45): boolean {
  if (!lastGpsUpdateIso) return true;
  const diffMs = Date.now() - new Date(lastGpsUpdateIso).getTime();
  return diffMs > thresholdSeconds * 1000;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return date.toLocaleDateString();
}

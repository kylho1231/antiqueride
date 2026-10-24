'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates } from '@/lib/types';
import { DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';

export interface DeviceLocationState {
  coords: Coordinates | null;
  accuracy: number | null; // in meters
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
  isLoading: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  locationName: string | null;
  isWithinSanJose: boolean;
}

export const SAN_JOSE_LANDMARKS = [
  { name: 'San Jose Public Plaza & Cathedral Station', barangay: 'Barangay 2 (Poblacion)', coords: { lat: 10.7445, lng: 121.9395 } },
  { name: 'Tradetown Dalipe Public Market & Terminal', barangay: 'Dalipe', coords: { lat: 10.7483, lng: 121.9442 } },
  { name: 'Antique National School (ANS) / EBJ Gym', barangay: 'Mojon', coords: { lat: 10.7510, lng: 121.9420 } },
  { name: 'San Pedro Fishing Port & Coastal Boulevard', barangay: 'San Pedro', coords: { lat: 10.7380, lng: 121.9350 } },
  { name: 'Funda-Dalipe Crossroads Junction', barangay: 'Funda-Dalipe', coords: { lat: 10.7550, lng: 121.9490 } },
  { name: 'Robinsons Place Antique', barangay: 'San Angel', coords: { lat: 10.7495, lng: 121.9468 } },
  { name: 'Gaisano Grand Mall Antique', barangay: 'Poblacion', coords: { lat: 10.7430, lng: 121.9380 } },
  { name: 'Antique Provincial Capitol & Freedom Park', barangay: 'Barangay 3', coords: { lat: 10.7460, lng: 121.9390 } },
  { name: 'Madrangca Coastal Beach & Resort Road', barangay: 'Madrangca', coords: { lat: 10.7580, lng: 121.9330 } },
  { name: 'San Jose Municipal Hall & TMPSO Police Substation', barangay: 'Poblacion', coords: { lat: 10.7450, lng: 121.9400 } },
  { name: 'St. Anthony\'s College (SAC)', barangay: 'San Angel', coords: { lat: 10.7535, lng: 121.9445 } },
  { name: 'Barangay Dalipe Coastal Zone', barangay: 'Dalipe', coords: { lat: 10.7465, lng: 121.9425 } },
  { name: 'Malaiba Sibalom Junction', barangay: 'Malaiba', coords: { lat: 10.7680, lng: 121.9800 } },
];

/**
 * Calculates raw Haversine distance in meters between two lat/lng coordinates
 */
export function calculateDistanceMeters(c1: Coordinates, c2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves human-readable location name for San Jose de Buenavista or external locations
 */
export async function resolveLocationName(coords: Coordinates): Promise<{
  name: string;
  isWithinSanJose: boolean;
  nearestLandmark: string;
  distanceMeters: number;
}> {
  // Find nearest local landmark in San Jose
  let nearestLandmark = SAN_JOSE_LANDMARKS[0];
  let minDistance = calculateDistanceMeters(coords, nearestLandmark.coords);

  for (const landmark of SAN_JOSE_LANDMARKS) {
    const dist = calculateDistanceMeters(coords, landmark.coords);
    if (dist < minDistance) {
      minDistance = dist;
      nearestLandmark = landmark;
    }
  }

  const isWithinSanJose = minDistance <= 8000; // Within 8km of San Jose center

  // If closely matching a known landmark in San Jose (< 150m)
  if (minDistance <= 150) {
    return {
      name: `${nearestLandmark.name} (${nearestLandmark.barangay})`,
      isWithinSanJose: true,
      nearestLandmark: nearestLandmark.name,
      distanceMeters: minDistance,
    };
  }

  // If within San Jose radius (< 4km)
  if (minDistance <= 4000) {
    return {
      name: `${nearestLandmark.barangay} (~${minDistance}m from ${nearestLandmark.name})`,
      isWithinSanJose: true,
      nearestLandmark: nearestLandmark.name,
      distanceMeters: minDistance,
    };
  }

  // Attempt reverse geocoding via OpenStreetMap Nominatim for exact address
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || addr.quarter;
      const village = addr.village || addr.neighbourhood || addr.city_district || addr.hamlet;
      const town = addr.town || addr.city || addr.municipality || 'Antique';

      if (road && village) {
        return {
          name: `${road}, ${village}, ${town}`,
          isWithinSanJose,
          nearestLandmark: nearestLandmark.name,
          distanceMeters: minDistance,
        };
      } else if (data.display_name) {
        const parts = data.display_name.split(',').slice(0, 3).map((p: string) => p.trim());
        return {
          name: parts.join(', '),
          isWithinSanJose,
          nearestLandmark: nearestLandmark.name,
          distanceMeters: minDistance,
        };
      }
    }
  } catch (e) {
    // Reverse geocode timeout or offline - fallback to coordinates or nearest point
  }

  // Fallback for non-local or offline
  if (isWithinSanJose) {
    return {
      name: `San Jose de Buenavista (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E)`,
      isWithinSanJose: true,
      nearestLandmark: nearestLandmark.name,
      distanceMeters: minDistance,
    };
  }

  return {
    name: `Live Location (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E)`,
    isWithinSanJose: false,
    nearestLandmark: nearestLandmark.name,
    distanceMeters: minDistance,
  };
}

/**
 * Custom React hook for high-accuracy device geolocation
 */
export function useDeviceLocation(options?: {
  autoFetchOnMount?: boolean;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}) {
  const {
    autoFetchOnMount = false,
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 3000,
  } = options || {};

  const [state, setState] = useState<DeviceLocationState>({
    coords: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    isLoading: false,
    permissionState: 'prompt',
    locationName: null,
    isWithinSanJose: true,
  });

  const watchIdRef = useRef<number | null>(null);

  // Check initial permission status if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, permissionState: 'unsupported', error: 'Geolocation is not supported by your browser' }));
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          setState((s) => ({ ...s, permissionState: permissionStatus.state }));
          permissionStatus.onchange = () => {
            setState((s) => ({ ...s, permissionState: permissionStatus.state }));
          };
        })
        .catch(() => {
          // Permissions API query not supported for geolocation on all browsers
        });
    }
  }, []);

  /**
   * Fetches the current location once with high accuracy
   */
  const fetchCurrentLocation = useCallback(async (): Promise<{
    coords: Coordinates;
    accuracy: number;
    name: string;
    isWithinSanJose: boolean;
  } | null> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setState((s) => ({
        ...s,
        error: 'Geolocation is not supported by your device or browser.',
        isLoading: false,
      }));
      return null;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const accuracy = Math.round(position.coords.accuracy);
          const heading = position.coords.heading;
          const speed = position.coords.speed;
          const timestamp = position.timestamp;

          const resolved = await resolveLocationName(coords);

          setState({
            coords,
            accuracy,
            heading,
            speed,
            timestamp,
            error: null,
            isLoading: false,
            permissionState: 'granted',
            locationName: resolved.name,
            isWithinSanJose: resolved.isWithinSanJose,
          });

          resolve({
            coords,
            accuracy,
            name: resolved.name,
            isWithinSanJose: resolved.isWithinSanJose,
          });
        },
        (error) => {
          let errorMsg = 'Failed to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission was denied. Please allow location access in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'GPS position is currently unavailable. Please check device location settings.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Location request timed out. Retrying with network location.';
          }

          setState((s) => ({
            ...s,
            isLoading: false,
            error: errorMsg,
            permissionState: error.code === error.PERMISSION_DENIED ? 'denied' : s.permissionState,
          }));

          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  /**
   * Starts continuous watch of device location
   */
  const startWatching = useCallback(
    (onUpdate?: (coords: Coordinates, accuracy: number, heading: number | null, speed: number | null) => void) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      setState((s) => ({ ...s, isLoading: true, error: null }));

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const accuracy = Math.round(position.coords.accuracy);
          const heading = position.coords.heading;
          const speed = position.coords.speed;
          const timestamp = position.timestamp;

          setState((prev) => ({
            ...prev,
            coords,
            accuracy,
            heading,
            speed,
            timestamp,
            error: null,
            isLoading: false,
            permissionState: 'granted',
          }));

          if (onUpdate) {
            onUpdate(coords, accuracy, heading, speed);
          }
        },
        (error) => {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: error.message || 'Error watching device location',
          }));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    },
    [enableHighAccuracy, timeout, maximumAge]
  );

  /**
   * Stops watching position
   */
  const stopWatching = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto-fetch if requested
  useEffect(() => {
    if (autoFetchOnMount) {
      fetchCurrentLocation();
    }
  }, [autoFetchOnMount, fetchCurrentLocation]);

  return {
    ...state,
    fetchCurrentLocation,
    startWatching,
    stopWatching,
  };
}

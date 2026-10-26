'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Coordinates, Terminal, DriverProfile } from '@/lib/types';
import { DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';
import { isGpsStale } from '@/lib/utils';
import { Radio, Navigation2, Crosshair, Loader2, AlertCircle } from 'lucide-react';

interface AntiqueMapProps {
  center?: Coordinates;
  zoom?: number;
  terminals?: Terminal[];
  drivers?: DriverProfile[];
  pickupCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
  driverCoords?: Coordinates | null;
  userLiveCoords?: Coordinates | null;
  userLiveAccuracy?: number | null;
  onSelectTerminal?: (terminal: Terminal) => void;
  onMapClick?: (coords: Coordinates) => void;
  onLocationFound?: (coords: Coordinates, accuracy: number) => void;
  className?: string;
  showTerminals?: boolean;
  showDrivers?: boolean;
  showLocateControl?: boolean;
}

export default function AntiqueMap({
  center = DEFAULT_MAP_CENTER,
  zoom = 14,
  terminals = [],
  drivers = [],
  pickupCoords = null,
  destinationCoords = null,
  driverCoords = null,
  userLiveCoords = null,
  userLiveAccuracy = null,
  onSelectTerminal,
  onMapClick,
  onLocationFound,
  className = 'h-[460px] min-h-[460px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200',
  showTerminals = true,
  showDrivers = true,
  showLocateControl = true,
}: AntiqueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const liveLocationLayerRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [internalLiveCoords, setInternalLiveCoords] = useState<Coordinates | null>(userLiveCoords);
  const [internalAccuracy, setInternalAccuracy] = useState<number | null>(userLiveAccuracy);
  const [locationToast, setLocationToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Sync internal live coords if userLiveCoords prop updates externally
  useEffect(() => {
    if (userLiveCoords) {
      setInternalLiveCoords(userLiveCoords);
      if (userLiveAccuracy !== undefined && userLiveAccuracy !== null) {
        setInternalAccuracy(userLiveAccuracy);
      }
    }
  }, [userLiveCoords, userLiveAccuracy]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        const initialLat = internalLiveCoords?.lat || center.lat;
        const initialLng = internalLiveCoords?.lng || center.lng;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: zoom,
          zoomControl: false,
        });

        // OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | AntiqueRide GIS',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        if (onMapClick) {
          map.on('click', (e: any) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }

        const markersLayer = L.layerGroup().addTo(map);
        const routeLayer = L.layerGroup().addTo(map);
        const liveLocationLayer = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = markersLayer;
        routeLayerRef.current = routeLayer;
        liveLocationLayerRef.current = liveLocationLayer;
        setMapReady(true);

        // Force container reflow for Leaflet bounds calculation
        setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 100);
        setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 400);
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      const routeLayer = routeLayerRef.current;
      const liveLocationLayer = liveLocationLayerRef.current;

      markersLayer.clearLayers();
      routeLayer.clearLayers();
      liveLocationLayer.clearLayers();

      // 1. Render Verified Terminals
      if (showTerminals) {
        terminals.forEach((t) => {
          const isPhase2 = t.status === 'FIELD_VERIFICATION_PENDING';
          const iconHtml = `
            <div style="background-color: ${isPhase2 ? '#64748B' : '#087F5B'}; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); white-space: nowrap; display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#86EFAC;"></span>
              ${t.todaName}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-terminal-marker',
            iconSize: [80, 24],
            iconAnchor: [40, 12],
          });

          const marker = L.marker([t.coordinates.lat, t.coordinates.lng], { icon: customIcon });

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
              <div style="font-size: 10px; color: #087F5B; font-weight: bold; text-transform: uppercase;">
                ${t.municipality} • ${t.queueMode === 'PILA' ? 'Queue Pila Mode' : 'On-Demand Dispatch'}
              </div>
              <h4 style="margin: 3px 0; font-size: 14px; font-weight: 700; color: #102A43;">${t.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B;">${t.barangay}</p>
              <div style="font-size: 11px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
                <strong>Capacity:</strong> ${t.currentQueueCount} / ${t.capacity} tricycles
              </div>
              ${isPhase2 ? '<div style="margin-top:4px; font-size:10px; color:#DC2626; font-weight:bold;">Phase 2 candidate (Field verification pending)</div>' : ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          if (onSelectTerminal) {
            marker.on('click', () => onSelectTerminal(t));
          }
          marker.addTo(markersLayer);
        });
      }

      // 2. Render Active Drivers / Tricycles
      if (showDrivers) {
        drivers.forEach((d) => {
          if (!d.isOnline || !d.currentCoordinates) return;
          const stale = isGpsStale(d.lastGpsUpdate);

          let badgeColor = '#087F5B'; // Available (Primary Emerald)
          if (stale) badgeColor = '#64748B'; // Stale GPS (>45s)
          else if (d.availability === 'ON_TRIP') badgeColor = '#F5B301'; // On Trip (Accent Yellow)
          else if (d.availability === 'RESERVED' || d.availability === 'ARRIVING') badgeColor = '#0284C7';

          const driverHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: ${badgeColor}; color: white; border: 2.5px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                  <circle cx="7" cy="17" r="2"/>
                  <path d="M9 17h6"/>
                  <circle cx="17" cy="17" r="2"/>
                </svg>
              </div>
              <div style="background-color: #102A43; color: #F5B301; font-size: 9px; font-weight: 800; padding: 1.5px 5px; border-radius: 5px; margin-top: -6px; border: 1.5px solid white; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${d.bodyNumber}
              </div>
            </div>
          `;

          const driverIcon = L.divIcon({
            html: driverHtml,
            className: 'custom-driver-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          const marker = L.marker([d.currentCoordinates.lat, d.currentCoordinates.lng], {
            icon: driverIcon,
          });

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px;">
              <div style="font-weight:bold; color: #102A43; font-size: 13px;">${d.fullName}</div>
              <div style="font-size: 11px; color: #087F5B; font-weight:700;">Unit: ${d.bodyNumber} (${d.todaName})</div>
              <div style="font-size: 11px; color: #64748B;">Plate: ${d.vehiclePlate} • Rating: <span style="color:#F5B301;">★</span> ${d.rating}</div>
              <div style="margin-top: 4px; font-size: 10px; color: ${stale ? '#DC2626' : '#087F5B'}; font-weight:bold;">
                ${stale ? '⚠️ Stale GPS (>45s inactive)' : `● Live Hardware GPS (±${d.gpsAccuracyMeters || 3.8}m)`}
              </div>
            </div>
          `);

          marker.addTo(markersLayer);
        });
      }

      // 3. Render User's Accurate Live Location (Pulsating Blue/Emerald Pin & Accuracy Circle)
      const activeLiveCoords = internalLiveCoords || userLiveCoords;
      if (activeLiveCoords) {
        const accuracyRadius = internalAccuracy || userLiveAccuracy || 12;

        // Leaflet Accuracy Circle Buffer
        L.circle([activeLiveCoords.lat, activeLiveCoords.lng], {
          radius: Math.max(accuracyRadius, 8),
          color: '#2563EB',
          weight: 1.5,
          opacity: 0.8,
          fillColor: '#3B82F6',
          fillOpacity: 0.15,
          dashArray: '4, 4',
        }).addTo(liveLocationLayer);

        // Animated Pulsing Pin
        const liveUserHtml = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(37, 99, 235, 0.7); display: flex; align-items: center; justify-content: center;">
              <div style="width: 5px; height: 5px; border-radius: 50%; background: #FFFFFF;"></div>
            </div>
          </div>
        `;

        const liveUserIcon = L.divIcon({
          html: liveUserHtml,
          className: 'custom-live-user-marker',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const liveMarker = L.marker([activeLiveCoords.lat, activeLiveCoords.lng], {
          icon: liveUserIcon,
          zIndexOffset: 1000,
        });

        liveMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #102A43; display: flex; items-center; justify-content: center; gap: 4px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Your Live Location</span>
            </div>
            <div style="font-size: 10px; color: #2563EB; font-weight: bold; margin-top: 2px;">
              GPS Accuracy: ±${accuracyRadius}m
            </div>
            <div style="font-size: 9px; font-family: monospace; color: #64748B; margin-top: 2px;">
              ${activeLiveCoords.lat.toFixed(5)}° N, ${activeLiveCoords.lng.toFixed(5)}° E
            </div>
          </div>
        `);

        liveMarker.addTo(liveLocationLayer);
      }

      // 4. Pickup Pin (if different from or explicitly placed)
      if (pickupCoords && (!activeLiveCoords || pickupCoords.lat !== activeLiveCoords.lat || pickupCoords.lng !== activeLiveCoords.lng)) {
        const pickupHtml = `
          <div style="background-color: #087F5B; color: white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 28px; height: 28px; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="transform: rotate(45deg); font-size: 10px; font-weight: bold;">P</div>
          </div>
        `;
        const pickupIcon = L.divIcon({
          html: pickupHtml,
          className: 'custom-pin-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
          .bindPopup('<strong>Pickup Location</strong>')
          .addTo(markersLayer);
      }

      // 5. Destination Pin
      if (destinationCoords) {
        const destHtml = `
          <div style="background-color: #D92D20; color: white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 28px; height: 28px; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="transform: rotate(45deg); font-size: 10px; font-weight: bold;">D</div>
          </div>
        `;
        const destIcon = L.divIcon({
          html: destHtml,
          className: 'custom-pin-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon })
          .bindPopup('<strong>Destination</strong>')
          .addTo(markersLayer);
      }

      // 6. Draw Route Polyline if both pickup and destination exist
      if (pickupCoords && destinationCoords) {
        const latLngs: [number, number][] = [
          [pickupCoords.lat, pickupCoords.lng],
          [destinationCoords.lat, destinationCoords.lng],
        ];
        L.polyline(latLngs as any, {
          color: '#087F5B',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(routeLayer);

        const bounds = L.latLngBounds(latLngs as any);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    center,
    zoom,
    terminals,
    drivers,
    pickupCoords,
    destinationCoords,
    driverCoords,
    internalLiveCoords,
    internalAccuracy,
    userLiveCoords,
    userLiveAccuracy,
    showTerminals,
    showDrivers,
  ]);

  // Center on San Jose Plaza
  const handleCenterSanJose = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], 14, {
        animate: true,
        duration: 1.0,
      });
    }
  };

  // High-accuracy "Locate Me" handler
  const handleLocateMe = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationToast({ message: 'GPS Geolocation is not supported by your browser.', isError: true });
      setTimeout(() => setLocationToast(null), 4000);
      return;
    }

    setIsLocating(true);
    setLocationToast({ message: 'Locking high-accuracy GPS satellite fix...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const accuracy = Math.round(position.coords.accuracy);

        setInternalLiveCoords(coords);
        setInternalAccuracy(accuracy);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 16, {
            animate: true,
            duration: 1.2,
          });
        }

        setLocationToast({
          message: `GPS Locked! Location accurate to ±${accuracy}m`,
          isError: false,
        });
        setTimeout(() => setLocationToast(null), 4000);

        if (onLocationFound) {
          onLocationFound(coords, accuracy);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow GPS access in browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Please ensure device location is switched on.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS fix timed out. Retrying with cell tower/WiFi location.';
        }
        setLocationToast({ message: msg, isError: true });
        setTimeout(() => setLocationToast(null), 4500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );
  }, [onLocationFound]);

  const onlineDriversCount = drivers.filter((d) => d.isOnline).length;
  const activeAccuracy = internalAccuracy || userLiveAccuracy;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-[380px] sm:h-[480px] min-h-[360px]"
      style={{ position: 'relative', display: 'block' }}
    >
      {/* Top Floating GIS Telemetry Badge */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-none max-w-[calc(100%-190px)] sm:max-w-none">
        <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-[10px] sm:text-[11px] font-black text-[#102A43] tracking-wide">
            LIVE GIS MAP
          </span>
          {activeAccuracy !== null && activeAccuracy !== undefined ? (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              GPS ±{activeAccuracy}m
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
              San Jose de Buenavista
            </span>
          )}
        </div>

        <div className="bg-[#102A43]/90 text-white px-2.5 py-1.5 rounded-xl shadow-md text-[10px] font-bold flex items-center gap-1.5 pointer-events-auto hidden sm:flex">
          <Radio className="w-3 h-3 text-[#F5B301]" />
          <span>{onlineDriversCount} Tricycles Active</span>
        </div>
      </div>

      {/* Floating Action Buttons: Locate Me & Center Plaza */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex items-center gap-1.5">
        {showLocateControl && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl shadow-md border cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
              isLocating
                ? 'bg-blue-600 text-white border-blue-700 animate-pulse'
                : internalLiveCoords
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200'
            }`}
            title="Fetch live high-accuracy device location"
            aria-label="Locate where I am"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )}
            <span className="whitespace-nowrap font-extrabold">
              {isLocating ? 'Locating...' : internalLiveCoords ? 'My Location' : 'Locate Me'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCenterSanJose}
          className="bg-white/95 hover:bg-white text-slate-800 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl shadow-md border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          title="Re-center on San Jose Plaza & Municipal Hall"
          aria-label="Center on San Jose Plaza"
        >
          <Navigation2 className="w-3.5 h-3.5 text-[#087F5B] shrink-0" />
          <span className="whitespace-nowrap hidden sm:inline">Center Plaza</span>
        </button>
      </div>

      {/* Floating Status / Accuracy Toast Notification */}
      {locationToast && (
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-2 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 max-w-[90%] transition-all animate-in fade-in slide-in-from-bottom-2 ${
            locationToast.isError
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-[#102A43] text-white border-slate-700'
          }`}
        >
          {locationToast.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          )}
          <span className="truncate">{locationToast.message}</span>
        </div>
      )}

      {/* Actual Map Container */}
      <div
        ref={mapContainerRef}
        className="antique-gis-map-container h-full w-full min-h-[360px]"
        style={{ position: 'relative', display: 'block' }}
      />
    </div>
  );
}

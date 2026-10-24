'use client';

import React, { useEffect, useRef } from 'react';
import { Coordinates, Terminal, DriverProfile } from '@/lib/types';
import { DEFAULT_MAP_CENTER } from '@/lib/data/antique-data';
import { isGpsStale } from '@/lib/utils';

interface AntiqueMapProps {
  center?: Coordinates;
  zoom?: number;
  terminals?: Terminal[];
  drivers?: DriverProfile[];
  pickupCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
  driverCoords?: Coordinates | null;
  onSelectTerminal?: (terminal: Terminal) => void;
  onMapClick?: (coords: Coordinates) => void;
  className?: string;
  showTerminals?: boolean;
  showDrivers?: boolean;
}

export default function AntiqueMap({
  center = DEFAULT_MAP_CENTER,
  zoom = 14,
  terminals = [],
  drivers = [],
  pickupCoords = null,
  destinationCoords = null,
  driverCoords = null,
  onSelectTerminal,
  onMapClick,
  className = 'h-[450px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200',
  showTerminals = true,
  showDrivers = true,
}: AntiqueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet on client side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Prevent re-initialization if map already exists
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: zoom,
          zoomControl: false,
        });

        // Add standard OSM tile layer with proper OpenStreetMap attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | AntiqueRide',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        if (onMapClick) {
          map.on('click', (e: any) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }

        const markersLayer = L.layerGroup().addTo(map);
        const routeLayer = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = markersLayer;
        routeLayerRef.current = routeLayer;
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      const routeLayer = routeLayerRef.current;

      markersLayer.clearLayers();
      routeLayer.clearLayers();

      // Render Verified Terminals
      if (showTerminals) {
        terminals.forEach((t) => {
          const isPhase2 = t.status === 'FIELD_VERIFICATION_PENDING';
          const iconHtml = `
            <div style="background-color: ${isPhase2 ? '#94A3B8' : '#087F5B'}; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#F5B301;"></span>
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
            <div style="font-family: system-ui, sans-serif; padding: 2px; max-width: 220px;">
              <div style="font-size: 10px; color: #087F5B; font-weight: bold; text-transform: uppercase;">
                ${t.municipality} • ${t.queueMode === 'PILA' ? 'Queue Pila Mode' : 'On-Demand Dispatch'}
              </div>
              <h4 style="margin: 3px 0; font-size: 14px; font-weight: 700; color: #102A43;">${t.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B;">${t.barangay}</p>
              <div style="font-size: 11px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
                <strong>Capacity:</strong> ${t.currentQueueCount} / ${t.capacity} tricycles
              </div>
              ${isPhase2 ? '<div style="margin-top:4px; font-size:10px; color:#D92D20; font-weight:bold;">Phase 2 candidate (Field verification pending)</div>' : ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          if (onSelectTerminal) {
            marker.on('click', () => onSelectTerminal(t));
          }
          marker.addTo(markersLayer);
        });
      }

      // Render Active Drivers
      if (showDrivers) {
        drivers.forEach((d) => {
          if (!d.isOnline || !d.currentCoordinates) return;
          const stale = isGpsStale(d.lastGpsUpdate);

          let badgeColor = '#087F5B'; // available
          if (stale) badgeColor = '#64748B'; // stale
          else if (d.availability === 'ON_TRIP') badgeColor = '#F5B301'; // on trip
          else if (d.availability === 'RESERVED' || d.availability === 'ARRIVING') badgeColor = '#3B82F6';

          const driverHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="background-color: ${badgeColor}; color: white; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 16px;">
                🛺
              </div>
              <div style="background-color: #102A43; color: #F5B301; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; margin-top: -6px; border: 1px solid white; white-space: nowrap;">
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
            <div style="font-family: system-ui, sans-serif; padding: 2px;">
              <div style="font-weight:bold; color: #102A43; font-size: 13px;">${d.fullName}</div>
              <div style="font-size: 11px; color: #087F5B; font-weight:600;">Unit: ${d.bodyNumber} (${d.todaName})</div>
              <div style="font-size: 11px; color: #64748B;">Plate: ${d.vehiclePlate} • Rating: ⭐ ${d.rating}</div>
              <div style="margin-top: 4px; font-size: 10px; color: ${stale ? '#D92D20' : '#10B981'}; font-weight:bold;">
                ${stale ? '⚠️ Stale GPS (>45s inactive)' : '● Active Live GPS'}
              </div>
            </div>
          `);

          marker.addTo(markersLayer);
        });
      }

      // Pickup Pin
      if (pickupCoords) {
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

      // Destination Pin
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

      // Draw Route Polyline if both pickup and destination exist
      if (pickupCoords && destinationCoords) {
        const latLngs: [number, number][] = [
          [pickupCoords.lat, pickupCoords.lng],
          [destinationCoords.lat, destinationCoords.lng],
        ];
        L.polyline(latLngs as any, {
          color: '#087F5B',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(routeLayer);

        // Fit map bounds to show full route
        const bounds = L.latLngBounds(latLngs as any);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [center, zoom, terminals, drivers, pickupCoords, destinationCoords, driverCoords, showTerminals, showDrivers]);

  const handleCenterSanJose = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], 14);
    }
  };

  return (
    <div className="relative w-full">
      <div ref={mapContainerRef} className={className} />
      {/* Floating Center Control */}
      <button
        onClick={handleCenterSanJose}
        className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors"
        title="Center on San Jose de Buenavista Plaza"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        San Jose Plaza
      </button>
    </div>
  );
}

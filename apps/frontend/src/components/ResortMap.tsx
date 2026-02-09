"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapResort {
  id: string;
  name: string;
  lat: number;
  lng: number;
  snowfallTotal: number;
  snowfallDisplay: string;
}

export interface UserLocation {
  location: string; // City name
  lat: number;
  lng: number;
  driveRadiusMiles: number; // Calculated from driveRadius minutes
}

function getMarkerColor(inches: number): { bg: string; text: string } {
  if (inches >= 12) return { bg: "#1e3a5f", text: "#fff" };
  if (inches >= 6) return { bg: "#3b82f6", text: "#fff" };
  if (inches >= 1) return { bg: "#93c5fd", text: "#1e3a5f" };
  return { bg: "#6b7280", text: "#fff" };
}

function createSnowIcon(snowfallTotal: number, snowfallDisplay: string) {
  const { bg, text } = getMarkerColor(snowfallTotal);
  const label = snowfallTotal === 0 ? "—" : snowfallDisplay;
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${bg};color:${text};
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;
      border:2px solid rgba(255,255,255,0.8);
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
      line-height:1;
      transition: transform 0.2s ease;
    ">${label}</div>`,
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:#ef4444;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:700;
      border:3px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    ">📍</div>`,
  });
}

function FitBounds({ resorts, userLocation }: { resorts: MapResort[]; userLocation?: UserLocation }) {
  const map = useMap();

  useEffect(() => {
    if (resorts.length === 0 && !userLocation) return;

    // Build bounds including resorts and user location
    const points: [number, number][] = [];

    // Add resort locations
    resorts.forEach((r) => points.push([r.lat, r.lng]));

    // Add user location if provided
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);

      // Add points around the circle to ensure the full drive radius is visible
      // 1 mile ≈ 1609.34 meters
      const radiusMeters = userLocation.driveRadiusMiles * 1609.34;
      const radiusDegrees = (radiusMeters / 111320); // Rough conversion to degrees

      points.push([userLocation.lat + radiusDegrees, userLocation.lng]);
      points.push([userLocation.lat - radiusDegrees, userLocation.lng]);
      points.push([userLocation.lat, userLocation.lng + radiusDegrees]);
      points.push([userLocation.lat, userLocation.lng - radiusDegrees]);
    }

    if (points.length === 0) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9 });
  }, [map, resorts, userLocation]);

  return null;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDark;
}

export default function ResortMap({
  resorts,
  userLocation
}: {
  resorts: MapResort[];
  userLocation?: UserLocation;
}) {
  const isDark = useDarkMode();

  const markers = useMemo(
    () =>
      resorts.map((r) => ({
        ...r,
        icon: createSnowIcon(r.snowfallTotal, r.snowfallDisplay),
      })),
    [resorts],
  );

  if (resorts.length === 0 && !userLocation) return null;

  // Center on user location if available, otherwise average of resorts
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : resorts.length > 0
    ? [
        resorts.reduce((s, r) => s + r.lat, 0) / resorts.length,
        resorts.reduce((s, r) => s + r.lng, 0) / resorts.length,
      ]
    : [39.5, -106]; // Default to Colorado if no data

  // Standard OSM tiles — saturated green geography that works against both light and dark UI
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="mx-4 md:mx-6 lg:mx-8 mt-3 h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden border border-white/10 dark:border-gray-700 transition-colors">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        zoomControl={true}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer
          url={tileUrl}
          subdomains={["a", "b", "c"]}
        />
        <FitBounds resorts={resorts} userLocation={userLocation} />

        {/* User location marker and drive radius circle */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.driveRadiusMiles * 1609.34} // Convert miles to meters
              pathOptions={{
                color: isDark ? "#3b82f6" : "#2563eb",
                fillColor: isDark ? "#3b82f6" : "#2563eb",
                fillOpacity: 0.08,
                weight: 2,
                opacity: 0.4,
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserIcon()}
            >
              <Tooltip direction="top" offset={[0, -12]} permanent={false}>
                <span className="font-semibold">{userLocation.location}</span>
                <br />
                {userLocation.driveRadiusMiles} mile radius
              </Tooltip>
            </Marker>
          </>
        )}

        {/* Resort markers */}
        {markers.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={r.icon}>
            <Tooltip direction="top" offset={[0, -18]}>
              <span className="font-semibold">{r.name}</span>
              <br />
              10-day: {r.snowfallDisplay}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

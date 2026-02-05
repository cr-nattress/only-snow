"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
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
    ">${label}</div>`,
  });
}

function FitBounds({ resorts }: { resorts: MapResort[] }) {
  const map = useMap();

  useEffect(() => {
    if (resorts.length === 0) return;
    const bounds = L.latLngBounds(resorts.map((r) => [r.lat, r.lng]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
  }, [map, resorts]);

  return null;
}

export default function ResortMap({ resorts }: { resorts: MapResort[] }) {
  const markers = useMemo(
    () =>
      resorts.map((r) => ({
        ...r,
        icon: createSnowIcon(r.snowfallTotal, r.snowfallDisplay),
      })),
    [resorts],
  );

  if (resorts.length === 0) return null;

  const center: [number, number] = [
    resorts.reduce((s, r) => s + r.lat, 0) / resorts.length,
    resorts.reduce((s, r) => s + r.lng, 0) / resorts.length,
  ];

  return (
    <div className="mx-4 md:mx-6 lg:mx-8 mt-3 h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        zoomControl={true}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}" />
        <FitBounds resorts={resorts} />
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

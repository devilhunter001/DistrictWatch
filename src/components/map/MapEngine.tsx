import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../../store/useStore';
import { DISTRICT_CENTER, MOCK_SHELTERS } from '../../data/mockData';
import {
  GHAZIABAD_DISTRICT_BOUNDARY,
  GHAZIABAD_PLACES,
  GHAZIABAD_BBOX,
  type DistrictPlace,
} from '../../data/ghaziabadBoundary';
import { getSeverityColor, getSeverityGlow, getCategoryIcon } from '../../utils/helpers';
import type { IncidentRecord, EmergencyShelter } from '../../types';

type BasemapStyle = 'dark' | 'voyager' | 'satellite';

const CARTO_API_KEY = 'cb1_4gv8_1_7b894e107356dcc329486e65';

const BASEMAP_TILES: Record<BasemapStyle, { url: string; subdomains?: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  voyager: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: '0123',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
};

const BORDER_STYLES: Record<BasemapStyle, {
  haloColor: string;
  haloWeight: number;
  haloOpacity: number;
  lineColor: string;
  lineWeight: number;
  lineOpacity: number;
  dashArray?: string;
  fillColor: string;
  fillOpacity: number;
}> = {
  dark: {
    haloColor: '#38BDF8',
    haloWeight: 6,
    haloOpacity: 0.35,
    lineColor: '#FFFFFF',
    lineWeight: 2.2,
    lineOpacity: 0.98,
    fillColor: '#38BDF8',
    fillOpacity: 0.02,
  },
  voyager: {
    haloColor: '#0F172A',
    haloWeight: 5,
    haloOpacity: 0.25,
    lineColor: '#881337',
    lineWeight: 2.8,
    lineOpacity: 0.95,
    dashArray: '6, 4',
    fillColor: '#881337',
    fillOpacity: 0.03,
  },
  satellite: {
    haloColor: '#DC2626',
    haloWeight: 6,
    haloOpacity: 0.45,
    lineColor: '#EF4444',
    lineWeight: 2.5,
    lineOpacity: 1,
    dashArray: '7, 5',
    fillColor: '#EF4444',
    fillOpacity: 0.04,
  },
};

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createIncidentIcon(incident: IncidentRecord): L.DivIcon {
  const color = getSeverityColor(incident.severity);
  const glow = getSeverityGlow(incident.severity);
  const emoji = getCategoryIcon(incident.category);
  const isPulsing = incident.status === 'ACTIVE';

  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    html: `
      <div style="position:relative;width:36px;height:36px;">
        ${isPulsing ? `
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:${color};opacity:0.2;
            animation:pulse-ring 2s ease-out infinite;
          "></div>
        ` : ''}
        <div style="
          position:absolute;inset:6px;border-radius:50%;
          background:${color}33;border:2px solid ${color};
          box-shadow:0 0 12px ${glow};
          display:flex;align-items:center;justify-content:center;font-size:12px;
        ">${emoji}</div>
      </div>
    `,
  });
}

function createShelterIcon(shelter: EmergencyShelter): L.DivIcon {
  const typeEmoji =
    shelter.type === 'HOSPITAL' ? '🏥' :
    shelter.type === 'STADIUM' ? '🏟️' :
    shelter.type === 'SCHOOL' ? '🏫' : '🏛️';
  const capacityPct = shelter.capacityOccupied / shelter.capacityTotal;
  const borderColor = capacityPct > 0.85 ? '#EF4444' : capacityPct > 0.6 ? '#F59E0B' : '#10B981';
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:rgba(16,185,129,0.12);
      border:2px solid ${borderColor};
      display:flex;align-items:center;justify-content:center;font-size:13px;
      box-shadow:0 0 8px rgba(16,185,129,0.25);
    ">${typeEmoji}</div>`,
  });
}

function createPlaceLabelIcon(place: DistrictPlace, basemap: BasemapStyle): L.DivIcon {
  const isCity = place.type === 'CITY';
  const isLight = basemap === 'voyager';

  const dotColor = isLight ? (isCity ? '#0284C7' : '#B91C1C') : (isCity ? '#38BDF8' : '#FFFFFF');
  const textColor = isLight ? '#0F172A' : '#FFFFFF';
  const bgColor = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(8,12,20,0.72)';
  const borderColor = isLight
    ? (isCity ? 'rgba(2,132,199,0.7)' : 'rgba(15,23,42,0.3)')
    : (isCity ? 'rgba(56,189,248,0.7)' : 'rgba(255,255,255,0.25)');
  const shadow = isLight
    ? '0 1px 3px rgba(0,0,0,0.15)'
    : '0 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)';

  return L.divIcon({
    className: '',
    iconSize: [120, 24],
    iconAnchor: [60, 12],
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        gap:4px;
        pointer-events:none;
        user-select:none;
        white-space:nowrap;
      ">
        <span style="
          width:${isCity ? '6px' : '4px'};
          height:${isCity ? '6px' : '4px'};
          border-radius:50%;
          background:${dotColor};
          box-shadow:0 0 ${isCity ? '6px ' + dotColor : '3px ' + dotColor};
          display:inline-block;
          flex-shrink:0;
        "></span>
        <span style="
          font-family:var(--font-mono, monospace);
          font-size:${isCity ? '11px' : '9.5px'};
          font-weight:${isCity ? '800' : '600'};
          color:${textColor};
          letter-spacing:${isCity ? '1.2px' : '0.4px'};
          text-shadow:${shadow};
          background:${bgColor};
          padding:${isCity ? '2px 7px' : '1px 5px'};
          border-radius:3px;
          border:1px solid ${borderColor};
          box-shadow:${isLight ? '0 1px 4px rgba(0,0,0,0.15)' : 'none'};
          backdrop-filter:blur(3px);
        ">${place.label}</span>
      </div>
    `,
  });
}

function MapController({ activeBasemapUrl, subdomains }: { activeBasemapUrl: string; subdomains?: string }) {
  const { selectedIncidentId, incidents, isSidebarOpen } = useStore();
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isSidebarOpen]);

  useEffect(() => {
    if (selectedIncidentId) {
      const inc = incidents.find((i) => i.id === selectedIncidentId);
      if (inc) map.flyTo([inc.location.lat, inc.location.lng], 14, { duration: 1.2 });
    }
  }, [selectedIncidentId, incidents, map]);

  // Pre-load district tiles across zooms 10-13 into browser memory cache
  useEffect(() => {
    const zooms = [10, 11, 12, 13];
    const subs = (subdomains || 'abc').split('');
    let subIdx = 0;

    for (const z of zooms) {
      const minX = Math.floor(((GHAZIABAD_BBOX.minLng + 180) / 360) * Math.pow(2, z));
      const maxX = Math.floor(((GHAZIABAD_BBOX.maxLng + 180) / 360) * Math.pow(2, z));
      const minY = Math.floor(
        ((1 - Math.log(Math.tan((GHAZIABAD_BBOX.maxLat * Math.PI) / 180) + 1 / Math.cos((GHAZIABAD_BBOX.maxLat * Math.PI) / 180)) / Math.PI) / 2) *
          Math.pow(2, z)
      );
      const maxY = Math.floor(
        ((1 - Math.log(Math.tan((GHAZIABAD_BBOX.minLat * Math.PI) / 180) + 1 / Math.cos((GHAZIABAD_BBOX.minLat * Math.PI) / 180)) / Math.PI) / 2) *
          Math.pow(2, z)
      );

      for (let x = Math.max(0, minX - 1); x <= maxX + 1; x++) {
        for (let y = Math.max(0, minY - 1); y <= maxY + 1; y++) {
          const s = subs[subIdx % subs.length];
          subIdx++;
          const tileUrl = activeBasemapUrl
            .replace('{s}', s)
            .replace('{z}', String(z))
            .replace('{x}', String(x))
            .replace('{y}', String(y));

          const img = new Image();
          img.src = tileUrl;
        }
      }
    }
  }, [activeBasemapUrl, subdomains]);

  return null;
}

export function MapEngine() {
  const { incidents, selectedIncidentId, selectIncident, viewMode } = useStore();
  const [basemap, setBasemap] = useState<BasemapStyle>('dark');
  const activeTile = BASEMAP_TILES[basemap];
  const borderStyle = BORDER_STYLES[basemap];

  // Dedicated SVG renderer with 2.5x viewport padding so boundary stays permanently rendered off-screen
  const svgRenderer = useMemo(() => L.svg({ padding: 2.5 }), []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <MapContainer
        center={[28.74, 77.46]}
        zoom={11}
        minZoom={8}
        maxZoom={18}
        maxBounds={[
          [26.5, 75.0],
          [30.8, 80.0],
        ]}
        maxBoundsViscosity={0.75}
        zoomSnap={0.5}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        wheelDebounceTime={20}
        preferCanvas={false}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          key={basemap}
          url={activeTile.url}
          subdomains={activeTile.subdomains || 'abc'}
          attribution={activeTile.attribution}
          maxZoom={activeTile.maxZoom}
          keepBuffer={32}
          updateWhenZooming={false}
          updateWhenIdle={false}
        />

        {/* If satellite mode, also render reference boundaries/places overlay */}
        {basemap === 'satellite' && (
          <TileLayer
            key="satellite-reference-overlay"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
            maxZoom={19}
            opacity={0.8}
            keepBuffer={32}
            updateWhenZooming={false}
            updateWhenIdle={false}
          />
        )}

        <MapController activeBasemapUrl={activeTile.url} subdomains={activeTile.subdomains} />

        {/* Ghaziabad District Official Boundary — noClip + 2.5x viewport padding prevents disappearing */}
        <Polyline
          positions={GHAZIABAD_DISTRICT_BOUNDARY}
          renderer={svgRenderer}
          pathOptions={{
            color: borderStyle.haloColor,
            weight: borderStyle.haloWeight,
            opacity: borderStyle.haloOpacity,
            lineCap: 'round',
            lineJoin: 'round',
            noClip: true,
            smoothFactor: 0,
          }}
        />
        <Polygon
          positions={GHAZIABAD_DISTRICT_BOUNDARY}
          renderer={svgRenderer}
          pathOptions={{
            color: borderStyle.lineColor,
            weight: borderStyle.lineWeight,
            opacity: borderStyle.lineOpacity,
            dashArray: borderStyle.dashArray,
            fillColor: borderStyle.fillColor,
            fillOpacity: borderStyle.fillOpacity,
            lineCap: 'round',
            lineJoin: 'round',
            noClip: true,
            smoothFactor: 0,
          }}
        />

        {/* Ghaziabad Town & Locality Labels — Visible across all basemaps with adaptive theme */}
        {GHAZIABAD_PLACES.map((place) => (
          <Marker
            key={place.name}
            position={[place.lat, place.lng]}
            icon={createPlaceLabelIcon(place, basemap)}
            interactive={false}
          />
        ))}

        {/* Incidents */}
        {incidents.map((inc) => {
          if (inc.status === 'RESOLVED') return null;
          const color = getSeverityColor(inc.severity);
          const isSelected = selectedIncidentId === inc.id;
          return (
            <div key={inc.id}>
              <Circle
                center={[inc.location.lat, inc.location.lng]}
                radius={inc.radiusMeters}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.18 : 0.07,
                  weight: isSelected ? 2 : 1,
                  opacity: isSelected ? 0.9 : 0.45,
                  dashArray: inc.status === 'CONTAINED' ? '6, 4' : undefined,
                }}
                eventHandlers={{ click: () => selectIncident(inc.id) }}
              />
              <Marker
                position={[inc.location.lat, inc.location.lng]}
                icon={createIncidentIcon(inc)}
                eventHandlers={{ click: () => selectIncident(inc.id) }}
              >
                <Popup>
                  <div style={{ minWidth: '190px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                      {getCategoryIcon(inc.category)} {inc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>
                      {inc.location.wardOrDistrict}
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                      background: `${color}22`, color, border: `1px solid ${color}50`,
                      fontSize: '10px', fontWeight: 700,
                    }}>
                      {inc.severity.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '5px' }}>
                      ~{(inc.estimatedImpactedPopulation / 1000).toFixed(0)}K people affected
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

        {/* Shelters */}
        {MOCK_SHELTERS.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.location.lat, shelter.location.lng]}
            icon={createShelterIcon(shelter)}
          >
            <Popup>
              <div style={{ minWidth: '170px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{shelter.name}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '5px' }}>{shelter.location.address}</div>
                <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Capacity: </span>
                  <span style={{ fontWeight: 600, color: shelter.capacityOccupied / shelter.capacityTotal > 0.85 ? '#EF4444' : '#10B981' }}>
                    {shelter.capacityOccupied} / {shelter.capacityTotal}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>📞 {shelter.contactPhone}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend — bottom right */}
      <div style={{
        position: 'absolute', bottom: '40px', right: '12px', zIndex: 400,
        background: 'rgba(8,12,20,0.82)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(51,65,85,0.5)', borderRadius: '8px',
        padding: '8px 12px',
      }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: '#475569', fontFamily: 'var(--font-mono)', marginBottom: '6px', letterSpacing: '0.5px' }}>SEVERITY</div>
        {[
          { label: 'CRITICAL', color: '#EF4444' },
          { label: 'WARNING', color: '#F59E0B' },
          { label: 'WATCH', color: '#8B5CF6' },
          { label: 'ADVISORY', color: '#06B6D4' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
            <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Basemap Switcher — Top Right */}
      <div style={{
        position: 'absolute', top: '10px', right: viewMode === 'CITIZEN' ? '335px' : '12px', zIndex: 400,
        background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(51,65,85,0.6)', borderRadius: '6px',
        padding: '3px', display: 'flex', gap: '3px',
      }}>
        {(['dark', 'voyager', 'satellite'] as const).map((style) => (
          <button
            key={style}
            onClick={() => setBasemap(style)}
            style={{
              background: basemap === style ? 'rgba(6,182,212,0.22)' : 'transparent',
              border: basemap === style ? '1px solid rgba(6,182,212,0.6)' : '1px solid transparent',
              color: basemap === style ? '#38BDF8' : '#64748B',
              borderRadius: '4px', padding: '3px 8px', fontSize: '10px',
              fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {style === 'dark' ? '🌙 Tactical' : style === 'voyager' ? '🗺️ Streets' : '🛰️ Satellite'}
          </button>
        ))}
      </div>
    </div>
  );
}

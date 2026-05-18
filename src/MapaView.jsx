import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#ff5c3a;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function AjustarVista({ restaurantes }) {
  const map = useMap();
  useEffect(() => {
    if (restaurantes.length === 0) return;
    const bounds = L.latLngBounds(restaurantes.map(r => [r.lat, r.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [restaurantes, map]);
  return null;
}

function MapaView({ restaurantes, onAbrirModal }) {
  const conCoords = restaurantes.filter(r => r.lat && r.lng);
  const sinCoords = restaurantes.length - conCoords.length;

  return (
    <div>
      {sinCoords > 0 && (
        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 12, textAlign: 'center' }}>
          {conCoords.length} de {restaurantes.length} sitios tienen ubicación.
          {sinCoords > 0 && ' Geocodifica el resto desde el panel de admin.'}
        </p>
      )}
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', height: '62vh' }}>
        <MapContainer
          center={[40.4168, -3.7038]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <AjustarVista restaurantes={conCoords} />
          {conCoords.map(r => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={pinIcon}
              eventHandlers={{ click: () => onAbrirModal(r) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapaView;

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl: iconRetina,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Numbered icon creator
const createNumberedIcon = (number: number, highlight = false) => {
  const bgColor = highlight ? '#4f46e5' : '#6366f1';
  return L.divIcon({
    html: `<div style="background-color:${bgColor}; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Generic location type – works for both destinations and stops
export interface MapLocation {
  id?: string;
  latitude: number;
  longitude: number;
  name: string;
  photos?: { url: string; caption?: string }[];   // optional
  address?: string;                               // optional
}

interface Props {
  locations: MapLocation[];
  showNumbers?: boolean;
  selectedLocation?: MapLocation | null;
  onMarkerClick?: (loc: MapLocation) => void;
  center?: [number, number];
  zoom?: number;
  polyline?: any; // GeoJSON object
}

function FlyToSelected({ loc }: { loc: MapLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (loc) {
      map.flyTo([loc.latitude, loc.longitude], 15);
    }
  }, [loc, map]);
  return null;
}

function FitBounds({ polyline }: { polyline: any }) {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.coordinates) {
      const coords = polyline.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polyline, map]);
  return null;
}

export default function MapView({
  locations,
  showNumbers = false,
  selectedLocation,
  onMarkerClick,
  center = [14.6, 121.0],
  zoom = 8,
  polyline,
}: Props) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected loc={selectedLocation ?? null} />
      {polyline && <FitBounds polyline={polyline} />}
      {polyline && (
        <GeoJSON
          key={JSON.stringify(polyline)}
          data={polyline}
          style={{ color: '#4f46e5', weight: 5 }}
        />
      )}
      {locations.map((loc, index) => {
        const isSelected = selectedLocation?.id === loc.id;
        const icon = showNumbers
          ? createNumberedIcon(index + 1, isSelected)
          : DefaultIcon;
        return (
          <Marker
            key={loc.id || `${loc.latitude}-${loc.longitude}-${index}`}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            eventHandlers={
              onMarkerClick ? { click: () => onMarkerClick(loc) } : undefined
            }
          >
            <Popup>
              <div>
                <strong>{loc.name}</strong>
                <br />
                {loc.address && <span>{loc.address}</span>}
                {loc.photos && loc.photos.length > 0 && (
                  <img
                    src={loc.photos[0].url}
                    alt={loc.name}
                    className="mt-1 w-full h-20 object-cover rounded"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
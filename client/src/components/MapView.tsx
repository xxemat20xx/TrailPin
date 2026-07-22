import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { Destination } from '../api/destination';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon (still needed for the default icon)
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
export const createNumberedIcon = (number: number, isHighlighted = false) => {
    const bgColor = isHighlighted ? '#4f46e5' : '#6366f1'; // indigo-600 vs indigo-500
    return L.divIcon({
        html: `<div style="background-color:${bgColor}; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
};

interface Props {
    destinations: Destination[];
    selectedDest?: Destination | null;
    onMarkerClick?: (dest: Destination) => void;
    center: [number, number];
    zoom?: number;
    showNumbers?: boolean;
}

function FlyToSelected({ dest }: { dest: Destination | null }) {
    const map = useMap();
    useEffect(() => {
        if (dest) {
            map.flyTo([dest.latitude, dest.longitude], map.getZoom(), { duration: 1 });
        }
    }, [dest, map]);
    return null;
}

export default function MapView({
    destinations,
    selectedDest,
    onMarkerClick,
    center,
    zoom = 8,
    showNumbers = false,
}: Props) {
    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToSelected dest={selectedDest ?? null} />
            {destinations.map((dest, idx) => {
                const isSelected = selectedDest?.id === dest.id;
                const icon = showNumbers ? createNumberedIcon(idx + 1, isSelected) : DefaultIcon;
                return (
                    <Marker
                        key={dest.id}
                        position={[dest.latitude, dest.longitude]}
                        icon={icon}
                        eventHandlers={onMarkerClick ? { click: () => onMarkerClick(dest) } : undefined}
                    >
                        <Popup>
                            <div>
                                <strong>{dest.name}</strong><br />
                                {dest.address}
                                {dest.photos.length > 0 && (
                                    <img
                                        src={dest.photos[0].url}
                                        alt={dest.name}
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { Destination } from '../api/destination';
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

interface Props {
    destinations: Destination[];
    selectedDest: Destination | null;
    onMarkerClick: (dest: Destination) => void;
    center: [number, number];
}

// Helper to fly to selected destination
function FlyToSelected({ dest }: { dest: Destination | null }) {
    const map = useMap();
    useEffect(() => {
        if (dest) {
            map.flyTo([dest.latitude, dest.longitude], 15);
        }
    }, [dest, map]);
    return null;
}

export default function MapView({ destinations, selectedDest, onMarkerClick, center }: Props) {
    return (
        <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToSelected dest={selectedDest} />
            {destinations.map((dest) => (
                <Marker
                    key={dest.id}
                    position={[dest.latitude, dest.longitude]}
                    eventHandlers={{ click: () => onMarkerClick(dest) }}
                >
                    <Popup>
                        <div className="min-w-[200px]">
                            <h3 className="font-bold">{dest.name}</h3>
                            {dest.photos.length > 0 && (
                                <img
                                    src={dest.photos[0].url}
                                    alt={dest.name}
                                    className="w-full h-32 object-cover rounded mt-1"
                                />
                            )}
                            <p className="text-sm text-gray-600">{dest.address}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
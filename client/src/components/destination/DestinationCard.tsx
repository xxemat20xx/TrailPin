import { Link } from 'react-router-dom';
import { MapPin, Image } from 'lucide-react';
import type { Destination } from '../../api/destination';

export default function DestinationCard({ destination }: { destination: Destination }) {
    return (
        <Link
            to={`/destination/${destination.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
        >
            <div className="relative h-48 bg-gray-200">
                {destination.photos.length > 0 ? (
                    <img
                        src={destination.photos[0].url}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <Image className="w-12 h-12" />
                    </div>
                )}
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {destination.photos.length} photo{destination.photos.length !== 1 ? 's' : ''}
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="font-semibold text-lg">{destination.name}</h3>
                        <p className="text-sm text-gray-600">{destination.address || 'No address'}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
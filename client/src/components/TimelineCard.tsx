import { Link } from 'react-router-dom';
import { MapPin, Image } from 'lucide-react';
import type { Destination } from '../api/destination';

interface Props {
    destination: Destination;
    index: number;
}

export default function TimelineCard({ destination, index }: Props) {
    return (
        <Link
            to={`/destination/${destination.id}`}
            className="group block bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
        >
            <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gray-200">
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
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                                {index + 1}
                            </span>
                            <h3 className="text-xl font-semibold group-hover:text-indigo-600 transition">
                                {destination.name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3" />
                            {destination.address || 'No address'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {destination.photos.length} photo{destination.photos.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {/* You can add ratings or other details later */}
                </div>
            </div>
        </Link>
    );
}
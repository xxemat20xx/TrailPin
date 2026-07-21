import type { Destination } from '../../api/destination';
import { MapPin } from 'lucide-react';

interface Props {
    destinations: Destination[];
    onSelect: (dest: Destination) => void;
    selectedId?: string;
}

export default function DestinationList({ destinations, onSelect, selectedId }: Props) {
    return (
        <ul className="divide-y">
            {destinations.map((dest) => (
                <li
                    key={dest.id}
                    onClick={() => onSelect(dest)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedId === dest.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                        }`}
                >
                    <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                            <p className="font-medium">{dest.name}</p>
                            <p className="text-sm text-gray-500">{dest.address || 'No address'}</p>
                            <p className="text-xs text-gray-400">{dest.photos.length} photo(s)</p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
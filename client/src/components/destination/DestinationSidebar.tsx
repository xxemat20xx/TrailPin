import type { Destination } from '../../api/destination';
import { MapPin, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    destinations: Destination[];
    onSelect: (dest: Destination) => void;
    selectedId?: string;
}

export default function DestinationSidebar({ destinations, onSelect, selectedId }: Props) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="absolute top-4 left-4 z-40 md:hidden bg-white p-2 rounded shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MapPin className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <aside
                className={`w-80 bg-white border-r overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 md:relative absolute h-full z-30`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">Destinations</h2>
                    <button
                        className="md:hidden text-gray-500"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <ul className="divide-y">
                    {destinations.map((dest) => (
                        <li
                            key={dest.id}
                            onClick={() => {
                                onSelect(dest);
                                setIsOpen(false); // close on mobile after selection
                            }}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedId === dest.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">{dest.name}</p>
                                    <p className="text-sm text-gray-500">{dest.address || 'No address'}</p>
                                    <p className="text-xs text-gray-400">{dest.photos.length} photo(s)</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>
        </>
    );
}
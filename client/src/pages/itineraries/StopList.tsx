import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useItineraryStore } from '../../stores/itineraryStore';

function SortableStop({ stop, index }: { stop: any; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
    const { removeStop } = useItineraryStore();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-gray-50 rounded mb-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
            </span>
            <div className="flex-1">
                <p className="font-medium">{stop.destination.name}</p>
                <p className="text-xs text-gray-500">{stop.destination.address}</p>
            </div>
            <button {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={() => removeStop(stop.id)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function StopList() {
    const { stops, reorderStops } = useItineraryStore();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = stops.findIndex((s) => s.id === active.id);
        const newIndex = stops.findIndex((s) => s.id === over.id);
        const newStops = [...stops];
        const [moved] = newStops.splice(oldIndex, 1);
        newStops.splice(newIndex, 0, moved);
        reorderStops(newStops);
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {stops.map((stop, index) => (
                    <SortableStop key={stop.id} stop={stop} index={index} />
                ))}
            </SortableContext>
        </DndContext>
    );
}
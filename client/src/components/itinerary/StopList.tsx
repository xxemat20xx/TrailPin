import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core/dist/types";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  MapPin,
  Route,
} from "lucide-react";
import { useItineraryStore } from "../../stores/itineraryStore";

function SortableStop({
  stop,
  index,
}: {
  stop: any;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: stop.id,
    });

  const removeStop = useItineraryStore((state) => state.removeStop);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-gray-200
        bg-white/80
        backdrop-blur-md
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:shadow-xl
      "
    >
      {/* Stop Number */}
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-gradient-to-br
          from-indigo-600
          via-violet-600
          to-purple-600
          text-lg
          font-bold
          text-white
          shadow-md
        "
      >
        {index + 1}
      </div>

      {/* Stop Details */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-gray-900">
          {stop.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4 text-indigo-500" />
          <span className="truncate">{stop.address}</span>
        </div>
      </div>

      {/* Drag */}
      <button
        {...attributes}
        {...listeners}
        className="
          rounded-lg
          p-2
          text-gray-400
          transition
          hover:bg-indigo-50
          hover:text-indigo-600
          active:cursor-grabbing
          cursor-grab
        "
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Delete */}
      <button
        onClick={() => removeStop(stop.id)}
        className="
          rounded-lg
          p-2
          text-gray-400
          transition
          hover:bg-red-50
          hover:text-red-500
        "
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function StopList() {
  const stops = useItineraryStore((state) => state.stops);
  const reorderStops = useItineraryStore((state) => state.reorderStops);

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

  if (stops.length === 0) {
    return (
      <div
        className="
          rounded-3xl
          border-2
          border-dashed
          border-indigo-200
          bg-gradient-to-br
          from-indigo-50
          to-violet-50
          py-14
          px-6
          text-center
        "
      >
        <div
          className="
            mx-auto
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-indigo-100
          "
        >
          <Route className="h-8 w-8 text-indigo-600" />
        </div>

        <h2 className="text-lg font-semibold text-gray-800">
          Your itinerary is empty
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Search for places and start building your perfect travel route.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white to-gray-50 p-5 shadow-lg">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Trip Stops
          </h2>

          <p className="text-sm text-gray-500">
            Drag to reorder your itinerary
          </p>
        </div>

        <div
          className="
            rounded-full
            bg-indigo-100
            px-3
            py-1
            text-sm
            font-semibold
            text-indigo-700
          "
        >
          {stops.length} Stops
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stops.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <SortableStop
                key={stop.id}
                stop={stop}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
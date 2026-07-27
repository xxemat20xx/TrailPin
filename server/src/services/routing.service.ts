import axios from 'axios';

// OSRM public demo server (free, no key)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

interface Coordinate {
    lat: number;
    lng: number;
}

interface RouteResponse {
    polyline: string;   // encoded polyline
    distance: number;   // total distance in meters
    duration: number;   // total duration in seconds
    legs: {
        distance: number;
        duration: number;
    }[];
}

export const getRoute = async (coordinates: Coordinate[]): Promise<RouteResponse> => {
    try {
        // OSRM expects [lng, lat] pairs, separated by semicolons
        const coordsString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');

        // radiuses: large value (e.g. 5000 meters) to allow snapping points far from roads
        const radiuses = coordinates.map(() => 5000).join(';');

        const url = `${OSRM_BASE_URL}/${coordsString}?geometries=geojson&overview=full&radiuses=${radiuses}&steps=false`;

        const response = await axios.get(url);

        const route = response.data.routes[0];
        if (!route) throw new Error('No route found');

        return {
            polyline: JSON.stringify(route.geometry), // return as JSON string (can be parsed later)
            distance: route.distance,
            duration: route.duration,
            legs: route.legs.map((leg: any) => ({
                distance: leg.distance,
                duration: leg.duration,
            })),
        };
    } catch (error: any) {
        console.error('OSRM error:', error.response?.data || error.message);
        throw new Error('Failed to fetch route');
    }
};
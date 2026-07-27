import { Request, Response } from 'express';
import prisma from '../config/db';
import { getRoute } from '../services/routing.service';

// Create itinerary
export const createItinerary = async (req: Request, res: Response) => {
    const { name, stops } = req.body;  // stops: { destinationId, order }[]
    const userId = req.userId!;

    if (!name || !Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({ error: 'Name and at least one stop are required' });
    }

    try {
        const itinerary = await prisma.itinerary.create({
            data: {
                name,
                userId,
                stops: {
                    create: stops.map((s: { destinationId: string; order: number }) => ({
                        order: s.order,
                        destinationId: s.destinationId,
                    })),
                },
            },
            include: {
                stops: {
                    include: { destination: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        res.status(201).json(itinerary);
    } catch (error) {
        console.error('Create itinerary error:', error);
        res.status(500).json({ error: 'Failed to create itinerary' });
    }
};

// Get all itineraries for logged-in user
export const getUserItineraries = async (req: Request, res: Response) => {
    const userId = req.userId!;
    try {
        const itineraries = await prisma.itinerary.findMany({
            where: { userId },
            include: {
                stops: {
                    include: { destination: true },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch itineraries' });
    }
};

// Get single itinerary (owner only)
export const getItinerary = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;

    try {
        const itinerary = await prisma.itinerary.findFirst({
            where: { id, userId },
            include: {
                stops: {
                    include: { destination: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
        res.json(itinerary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch itinerary' });
    }
};

// Update itinerary (reorder stops / add / remove)
export const updateItinerary = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;
    const { name, stops } = req.body;

    try {
        const itinerary = await prisma.itinerary.findFirst({ where: { id, userId } });
        if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });

        // Replace all stops (easy approach)
        await prisma.stop.deleteMany({ where: { itineraryId: id } });

        const updated = await prisma.itinerary.update({
            where: { id },
            data: {
                name: name !== undefined ? name : itinerary.name,
                stops: stops ? {
                    create: stops.map((s: { destinationId: string; order: number }) => ({
                        destinationId: s.destinationId,
                        order: s.order,
                    })),
                } : undefined,
            },
            include: {
                stops: {
                    include: { destination: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update itinerary' });
    }
};

// Delete itinerary
export const deleteItinerary = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;

    try {
        const itinerary = await prisma.itinerary.findFirst({ where: { id, userId } });
        if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
        await prisma.itinerary.delete({ where: { id } });
        res.json({ message: 'Itinerary deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete itinerary' });
    }
};

// Get route polyline and leg durations for an itinerary
export const getItineraryRoute = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;

    try {
        const itinerary = await prisma.itinerary.findFirst({
            where: { id, userId },
            include: {
                stops: {
                    include: { destination: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });

        const coordinates = itinerary.stops.map(stop => ({
            lat: stop.destination.latitude,
            lng: stop.destination.longitude,
        }));

        if (coordinates.length < 2) {
            return res.status(400).json({ error: 'Need at least two stops for a route' });
        }

        const routeData = await getRoute(coordinates);
        res.json({
            itinerary: itinerary.name,
            polyline: routeData.polyline,
            distance: routeData.distance,
            duration: routeData.duration,
            legs: routeData.legs,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to get route' });
    }
};

export const calculateRoute = async (req: Request, res: Response) => {
    const { coordinates } = req.body; // array of {lat, lng}
    if (!coordinates || coordinates.length < 2) return res.status(400).json({ error: 'Need at least 2 coordinates' });
    try {
        const routeData = await getRoute(coordinates);
        res.json(routeData);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
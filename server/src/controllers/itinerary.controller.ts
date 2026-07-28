import { Request, Response } from 'express';
import prisma from '../config/db';
import { getRoute } from '../services/routing.service';

// ---------- Create ----------
export const createItinerary = async (req: Request, res: Response) => {
    const { name, description, coverPhoto, estimatedTime, totalDistance, difficulty, tags, visibility, stops } = req.body;
    const userId = req.userId!;

    if (!name || !Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({ error: 'Name and at least one stop are required' });
    }

    try {
        const itinerary = await prisma.itinerary.create({
            data: {
                name,
                description,
                coverPhoto,
                estimatedTime,
                totalDistance,
                difficulty,
                tags,
                visibility: visibility || 'public',
                userId,
                stops: {
                    create: stops.map((s: any) => ({
                        order: s.order,
                        name: s.name,
                        latitude: s.latitude,
                        longitude: s.longitude,
                        address: s.address,
                        description: s.description,
                        arrivalNotes: s.arrivalNotes,
                        estimatedStay: s.estimatedStay,
                    })),
                },
            },
            include: { stops: { include: { photos: true }, orderBy: { order: 'asc' } } },
        });
        res.status(201).json(itinerary);
    } catch (error) {
        console.error('Create itinerary error:', error);
        res.status(500).json({ error: 'Failed to create itinerary' });
    }
};

// ---------- Get all for current user ----------
export const getUserItineraries = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const itineraries = await prisma.itinerary.findMany({
        where: { userId },
        include: {
            stops: { include: { photos: true }, orderBy: { order: 'asc' } },
            _count: { select: { likes: true, comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    // Attach counts to response
    const result = itineraries.map(it => ({
        ...it,
        likeCount: it._count.likes,
        commentCount: it._count.comments,
        ratingCount: it._count.ratings,
        _count: undefined,
    }));
    res.json(result);
};

// ---------- Get single (owner only) ----------
export const getItinerary = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;
    const itinerary = await prisma.itinerary.findFirst({
        where: { id, userId },
        include: {
            stops: { include: { photos: true }, orderBy: { order: 'asc' } },
            _count: { select: { likes: true, comments: true, ratings: true } },
        },
    });
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    res.json({ ...itinerary, likeCount: itinerary._count.likes, commentCount: itinerary._count.comments, ratingCount: itinerary._count.ratings, _count: undefined });
};

// ---------- Update ----------
export const updateItinerary = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;
    const { name, description, coverPhoto, estimatedTime, totalDistance, difficulty, tags, visibility, stops } = req.body;

    const existing = await prisma.itinerary.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Itinerary not found' });

    // Delete old stops and recreate
    await prisma.stop.deleteMany({ where: { itineraryId: id } });

    const updated = await prisma.itinerary.update({
        where: { id },
        data: {
            name: name ?? existing.name,
            description: description !== undefined ? description : existing.description,
            coverPhoto: coverPhoto !== undefined ? coverPhoto : existing.coverPhoto,
            estimatedTime: estimatedTime !== undefined ? estimatedTime : existing.estimatedTime,
            totalDistance: totalDistance !== undefined ? totalDistance : existing.totalDistance,
            difficulty: difficulty !== undefined ? difficulty : existing.difficulty,
            tags: tags !== undefined ? tags : existing.tags,
            visibility: visibility !== undefined ? visibility : existing.visibility,
            stops: stops ? {
                create: stops.map((s: any) => ({
                    order: s.order,
                    name: s.name,
                    latitude: s.latitude,
                    longitude: s.longitude,
                    address: s.address,
                    description: s.description,
                    arrivalNotes: s.arrivalNotes,
                    estimatedStay: s.estimatedStay,
                })),
            } : undefined,
        },
        include: { stops: { include: { photos: true }, orderBy: { order: 'asc' } } },
    });
    res.json(updated);
};

// ---------- Delete ----------
export const deleteItinerary = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;
    const existing = await prisma.itinerary.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Itinerary not found' });
    await prisma.itinerary.delete({ where: { id } });
    res.json({ message: 'Itinerary deleted' });
};

// ---------- Calculate route (uses OSRM) ----------
export const calculateRoute = async (req: Request, res: Response) => {
    const { coordinates } = req.body;  // [{lat, lng}, ...]
    if (!coordinates || coordinates.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 coordinates' });
    }
    try {
        const routeData = await getRoute(coordinates);
        res.json(routeData);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
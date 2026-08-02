import { Request, Response } from 'express';
import prisma from '../config/db';
import { getRoute } from '../services/routing.service';
import cloudinary from '../config/cloudinary';

function secondsToTimeString(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs} hr`);
  if (mins > 0) parts.push(`${mins} min`);
  return parts.join(' ') || '0 min';
}
// ---------- Create ----------
export const createItinerary = async (req: Request, res: Response) => {
   
  let { name, description, estimatedTime, totalDistance, difficulty, tags, visibility, stops } = req.body;
  const userId = req.userId!;

  if(typeof stops === 'string'){
    try{
      stops = JSON.parse(stops);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid stops format' });
    }
  }
  if (typeof tags === 'string') {
  try {
    tags = JSON.parse(tags);
  } catch {
    tags = []; // or return error
  }
}

  if (!name || !Array.isArray(stops) || stops.length === 0) {
    return res.status(400).json({ error: 'Name and at least one stop are required' });
  }
    let coverPhotoUrl: string | undefined;
    if(req.file){
          try {
            const result = await new Promise<any>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: 'trailpin_itineraries', resource_type: 'image' },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              stream.end(req.file!.buffer);
            });
            coverPhotoUrl = result.secure_url;
          } catch (err) {
            console.error('Cover photo upload error:', err);
            return res.status(500).json({ error: 'Failed to upload cover photo' });
          }
    }
  // Default values
  let finalDistance = totalDistance ?? null;
  let finalTime = estimatedTime ?? null;

  // Auto‑calculate route if possible
  if (stops.length >= 2) {
    try {
      const coordinates = stops.map((s: any) => ({ lat: s.latitude, lng: s.longitude }));
    const route = await getRoute(coordinates);
   
      
      finalDistance = route.distance / 1000;     // meters → km
      finalTime = secondsToTimeString(route.duration);
    } catch (err) {
      console.warn('Could not calculate route for itinerary, using null values');
      // keep null
    }
  }

  try {
    const itinerary = await prisma.itinerary.create({
      data: {
        name,
        description,
        coverPhoto: coverPhotoUrl || null,
        estimatedTime: finalTime,
        totalDistance: finalDistance,
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
  let { name, description, estimatedTime, totalDistance, difficulty, tags, visibility, stops } = req.body;
  if(typeof stops === 'string'){
    try{
      stops = JSON.parse(stops);
    }catch (err) {
      return res.status(400).json({ error: 'Invalid stops format' });
    }
    if (typeof tags === 'string') {
  try {
    tags = JSON.parse(tags);
  } catch {
    tags = []; // or return error
  }
}



  const existing = await prisma.itinerary.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ error: 'Itinerary not found' });

  // Determine new distance & time – reuse provided values or auto‑calculate
  let finalDistance = totalDistance !== undefined ? totalDistance : existing.totalDistance;
  let finalTime = estimatedTime !== undefined ? estimatedTime : existing.estimatedTime;

  // If new stops provided, recalculate if possible
  if (stops && stops.length >= 2) {
    try {
      const coordinates = stops.map((s: any) => ({ lat: s.latitude, lng: s.longitude }));
      const route = await getRoute(coordinates);
      finalDistance = route.distance / 1000;
      finalTime = secondsToTimeString(route.duration);
    } catch (err) {
      console.warn('Could not recalculate route, keeping existing values');
    }
  }

  let coverPhotoUrl: string | undefined;
  if(req.file){
      try {
            const result = await new Promise<any>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: 'trailpin_itineraries', resource_type: 'image' },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              stream.end(req.file!.buffer);
            });
            coverPhotoUrl = result.secure_url;
          } catch (err) {
            console.error('Cover photo upload error:', err);
            return res.status(500).json({ error: 'Failed to upload cover photo' });
          }
      }
  // Delete old stops and recreate
  await prisma.stop.deleteMany({ where: { itineraryId: id } });

  const updated = await prisma.itinerary.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      description: description !== undefined ? description : existing.description,
      coverPhoto: coverPhotoUrl !== undefined ? coverPhotoUrl : existing.coverPhoto,
      estimatedTime: finalTime,
      totalDistance: finalDistance,
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
}
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

// upload stop photo
export const uploadStopPhoto = async (req: Request, res: Response) => {
  const itineraryId = String(req.params.itineraryId);
  const stopId = String(req.params.stopId);
  const userId = req.userId!;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // verify the stop belongs to the user
   const stop = await prisma.stop.findFirst({
    where: {
      id: stopId,
      itineraryId,
      itinerary: { userId },
    },
  });
  if (!stop) {
    return res.status(404).json({ error: 'Stop not found or does not belong to user' });
  }
    try {
      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'trailpin_stop_photos', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      const photo = await prisma.stopPhoto.create({
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          caption: req.body.caption || null,
          stopId,
        },
      });

      res.status(201).json(photo);
    } catch (error) {
      console.error('Stop photo upload error:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
}


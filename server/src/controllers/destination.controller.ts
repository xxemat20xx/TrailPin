import { Request, Response } from 'express';
import prisma from '../config/db';
import { uploadToCloudinary } from '../middleware/upload';
import cloudinary from '../config/cloudinary';

// ---------- Create Destination ----------
export const createDestination = async (req: Request, res: Response) => {
    const { name, latitude, longitude, address } = req.body;
    const userId = req.userId!;

    if (!name || latitude == null || longitude == null) {
        return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }

    const destination = await prisma.destination.create({
        data: {
            name,
            latitude,
            longitude,
            address: address || null,
            userId,
        },
    });

    res.status(201).json(destination);
};

// ---------- Get All Destinations ----------
export const getUserDestinations = async (req: Request, res: Response) => {
    const userId = req.userId!;

    const destinations = await prisma.destination.findMany({
        where: { userId },
        include: {
            photos: {
                select: { id: true, url: true, caption: true },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    res.json(destinations);
};

// ---------- Get Single Destination ----------
export const getDestination = async (req: Request, res: Response) => {
    console.log("getDestination id:", req.params.id);
    const id = String(req.params.id);
    const userId = req.userId!;

    const destination = await prisma.destination.findFirst({
        where: { id, userId },
        include: {
            photos: {
                select: { id: true, url: true, caption: true },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
};

// ---------- Update Destination ----------
export const updateDestination = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;
    const { name, latitude, longitude, address } = req.body;

    const destination = await prisma.destination.findFirst({
        where: { id, userId },
    });

    if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
    }

    const updated = await prisma.destination.update({
        where: { id },
        data: {
            name: name ?? destination.name,
            latitude: latitude ?? destination.latitude,
            longitude: longitude ?? destination.longitude,
            address: address !== undefined ? address : destination.address,
        },
        include: {
            photos: {
                select: { id: true, url: true, caption: true },
            },
        },
    });

    res.json(updated);
};

// ---------- Delete Destination ----------
export const deleteDestination = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = req.userId!;

    // Fetch the destination with its photos' public_ids
    const destination = await prisma.destination.findFirst({
        where: { id, userId },
        include: { photos: { select: { public_id: true } } },
    });

    if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
    }

    // Delete photos from Cloudinary
    const deletePromises = destination.photos.map((photo) => {
        if (photo.public_id) {
            return cloudinary.uploader.destroy(photo.public_id).catch((err) => {
                console.error(`Failed to delete Cloudinary photo ${photo.public_id}:`, err);
                // continue even if one fails
            });
        }
    });
    await Promise.all(deletePromises);

    // Delete the destination (cascade will remove photo records)
    await prisma.destination.delete({ where: { id } });

    res.json({ message: 'Destination and all photos deleted' });
};
// ---------- Add Photo ----------
export const addPhoto = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const destination = await prisma.destination.findFirst({
    where: { id, userId },
  });
  if (!destination) {
    return res.status(404).json({ error: 'Destination not found' });
  }

  try {
    const { url, public_id } = await uploadToCloudinary(file);
    const photo = await prisma.photo.create({
      data: {
        url,
        public_id,
        caption: req.body.caption || null,
        destinationId: id,
      },
    });
    res.status(201).json(photo);
  } catch (error: any) {
    console.error('Add photo failed:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
};

// ---------- Delete Photo ----------
export const deletePhoto = async (req: Request, res: Response) => {
  const photoId = String(req.params.photoId);
  const userId = req.userId!;

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { destination: { select: { userId: true } } },
  });

  if (!photo || photo.destination.userId !== userId) {
    return res.status(404).json({ error: 'Photo not found' });
  }

  try {
    if (photo.public_id) {
      await cloudinary.uploader.destroy(photo.public_id);
    }
  } catch (cloudErr) {
    console.error('Cloudinary delete error:', cloudErr);
  }

  await prisma.photo.delete({ where: { id: photoId } });
  res.json({ message: 'Photo deleted' });
};


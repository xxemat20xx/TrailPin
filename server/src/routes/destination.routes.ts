import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createDestination,
  getUserDestinations,
  getDestination,
  updateDestination,
  deleteDestination,
  addPhoto,
  deletePhoto,
} from '../controllers/destination.controller';
import { upload } from '../middleware/upload';
import prisma from '../config/db';

export const router = Router();
export const publicRouter = Router();

router.use(authenticate);

router.post('/', createDestination);
router.get('/', getUserDestinations);
router.get('/:id', getDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

router.post('/:id/photos', upload.single('photo'), addPhoto);
router.delete('/:id/photos/:photoId', deletePhoto)

publicRouter.get('/', async (_req, res) => {
    const destinations = await prisma.destination.findMany({
        take: 20,
        select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            address: true,
            userId: true,               // ✅ add this
            createdAt: true,
            photos: {
                select: { id: true, url: true, caption: true },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json(destinations);
});


publicRouter.get('/:id', async (req, res) => {
    const id = String(req.params.id);
    try {
        const destination = await prisma.destination.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                address: true,
                userId: true,           // ✅ add this
                createdAt: true,
                photos: {
                    select: { id: true, url: true, caption: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!destination) return res.status(404).json({ error: 'Destination not found' });
        res.json(destination);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch destination' });
    }
});

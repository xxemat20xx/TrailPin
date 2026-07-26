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
import {
    toggleLike,
    addComment,
    deleteComment,
} from '../controllers/interaction.controller';
import {
    rateDestination,
    getRatings,
} from '../controllers/rating.controller';
import { upload } from '../middleware/upload';
import prisma from '../config/db';
import { softAuth } from '../middleware/softAuth';

export const router = Router();
export const publicRouter = Router();

router.use(authenticate);
publicRouter.use(softAuth);

router.post('/', createDestination);
router.get('/', getUserDestinations);
router.get('/:id', getDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

router.post('/:id/photos', upload.single('photo'), addPhoto);
router.delete('/:id/photos/:photoId', deletePhoto)


//interaction
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// ratings
router.post('/:id/rating', rateDestination);
router.get('/:id/ratings', getRatings);


// ---------- LIST ALL DESTINATIONS ----------
publicRouter.get('/', async (req, res) => {
    const userId = req.userId;   // may be undefined

    try {
        const destinations = await prisma.destination.findMany({
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                address: true,
                description: true,
                distance: true,
                duration: true,
                userId: true,
                createdAt: true,
                // Photos
                photos: {
                    select: { id: true, url: true, caption: true },
                    orderBy: { createdAt: 'asc' },
                },
                // Counts
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        ratings: true,
                    },
                },
                // If user logged in, check their like
                ...(userId
                    ? {
                        likes: {
                            where: { userId },
                            select: { id: true },
                        },
                    }
                    : {}),
                // Ratings for average and user's rating
                ratings: {
                    select: { score: true, userId: true },
                },
                user: {
                    select: {

                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map to clean response
        const result = destinations.map((dest: any) => {
            const ratings: { score: number; userId: string }[] = dest.ratings || [];
            const average =
                ratings.length > 0
                    ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                    : null;
            const userRating = userId
                ? ratings.find(r => r.userId === userId)?.score || null
                : null;

            return {
                id: dest.id,
                name: dest.name,
                latitude: dest.latitude,
                longitude: dest.longitude,
                address: dest.address,
                description: dest.description,
                distance: dest.distance,
                duration: dest.duration,
                userId: dest.userId,
                createdAt: dest.createdAt,
                photos: dest.photos,
                likeCount: dest._count.likes,
                commentCount: dest._count.comments,
                ratingsCount: ratings.length,
                averageRating: average,
                userRating,
                userLiked: userId ? (dest.likes?.length > 0) : false,
                user: dest.user,
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Public destinations error:', error);
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
});

// ---------- SINGLE DESTINATION ----------
publicRouter.get('/:id', async (req, res) => {
    const id = String(req.params.id);
    const userId = req.userId;

    try {
        const dest = await prisma.destination.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                address: true,
                description: true,
                distance: true,
                duration: true,
                userId: true,
                createdAt: true,
                photos: {
                    select: { id: true, url: true, caption: true },
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        ratings: true,
                    },
                },
                ...(userId
                    ? {
                        likes: {
                            where: { userId },
                            select: { id: true },
                        },
                    }
                    : {}),
                ratings: {
                    select: { score: true, userId: true },
                },
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!dest) return res.status(404).json({ error: 'Destination not found' });

        const ratings: { score: number; userId: string }[] = dest.ratings || [];
        const average =
            ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                : null;
        const userRating = userId
            ? ratings.find(r => r.userId === userId)?.score || null
            : null;

        const result = {
            ...dest,
            likeCount: dest._count.likes,
            commentCount: dest._count.comments,
            ratingsCount: ratings.length,
            averageRating: average,
            userRating,
            userLiked: userId ? (dest.likes?.length > 0) : false,
            // Remove raw data
            _count: undefined,
            likes: undefined,
            ratings: undefined,
            user: dest.user,
        };

        res.json(result);
    } catch (error) {
        console.error('Public single destination error:', error);
        res.status(500).json({ error: 'Failed to fetch destination' });
    }
});

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


//interaction
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// ratings
router.post('/:id/rate', rateDestination);
router.get('/:id/ratings', getRatings);


publicRouter.get('/', async (req, res) => {
    const userId = req.userId;

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
            ratings: {
                select: {
                    score: true,
                    review: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            photos: {
                select: { id: true, url: true, caption: true },
                orderBy: { createdAt: 'asc' },
            },
            _count: { select: { likes: true, comments: true } },
            // If user is logged in, check if they liked each destination
            ...(userId
                ? { likes: { where: { userId }, select: { id: true } } }
                : {}),
        },
        orderBy: { createdAt: 'desc' },
    });

    const result = destinations.map((dest: any) => ({
        ...dest,
        likeCount: dest._count.likes,
        commentCount: dest._count.comments,
        userLiked: userId ? dest.likes?.length > 0 : false,
        likes: undefined,
        _count: undefined,
    }));

    res.json(result);
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
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
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

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createItinerary,
    getUserItineraries,
    getItinerary,
    updateItinerary,
    deleteItinerary,
    calculateRoute,
} from '../controllers/itinerary.controller';
import { softAuth } from '../middleware/softAuth';
import prisma from '../config/db';

export const router = Router();
export const publicItineraryRouter = Router();
router.use(authenticate);
publicItineraryRouter.use(softAuth);


router.post('/', createItinerary);
router.get('/', getUserItineraries);
router.get('/:id', getItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);
router.post('/calculate-route', calculateRoute);


// Get all public itineraries (with stops, like count, etc.)
publicItineraryRouter.get('/', async (req, res) => {
  const userId = req.userId;   // from softAuth
  try {
    const itineraries = await prisma.itinerary.findMany({
      where: { visibility: 'public' },
      include: {
        stops: { include: { photos: true }, orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true, ratings: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
        ratings: userId ? { where: { userId }, select: { score: true } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = itineraries.map((it: any) => ({
      ...it,
      likeCount: it._count.likes,
      commentCount: it._count.comments,
      ratingsCount: it._count.ratings,
      averageRating: it.ratings?.length > 0
        ? it.ratings.reduce((sum: number, r: any) => sum + r.score, 0) / it.ratings.length
        : null,
      userLiked: userId ? it.likes?.length > 0 : false,
      userRating: userId ? it.ratings?.[0]?.score || null : null,
      _count: undefined,
      likes: undefined,
      ratings: undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('Public itineraries error:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});



export default router;
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createItinerary,
    getUserItineraries,
    getItinerary,
    updateItinerary,
    deleteItinerary,
    calculateRoute,
    uploadStopPhoto
} from '../controllers/itinerary.controller';
import { softAuth } from '../middleware/softAuth';
import { toggleItineraryLike,
          addComment,
          deleteComment,
          getComments
 } from '../controllers/interaction.controller';
import prisma from '../config/db';
import multer from 'multer';

export const router = Router();
export const publicItineraryRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(authenticate);
publicItineraryRouter.use(softAuth);

router.post('/:itineraryId/stops/:stopId/photos', upload.single('photo'), uploadStopPhoto);
router.post('/', upload.single('coverPhoto'), createItinerary);
router.get('/', getUserItineraries);
router.get('/:id', getItinerary);
router.put('/:id', upload.single('coverPhoto'), updateItinerary);
router.delete('/:id', deleteItinerary);
router.post('/calculate-route', calculateRoute);

// interaction routes (like/unlike, comments) are handled in interaction.routes.ts
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);
router.get('/:id/comments', getComments);


// interaction routes (like/unlike, comments) are handled in interaction.routes.ts
router.post('/:id/like', toggleItineraryLike);


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
        ...(userId
          ? {
              likes: { where: { userId }, select: { id: true } },
              ratings: { where: { userId }, select: { score: true } },
            }
          : {}),
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
// Get a single public itinerary (anyone can view)
publicItineraryRouter.get('/:id', async (req, res) => {
  const id = String(req.params.id);
  const userId = req.userId;

  try {
    const itinerary = await prisma.itinerary.findFirst({
      where: { id, visibility: 'public' },   // only public itineraries
      include: {
        stops: { include: { photos: true }, orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true, ratings: true } },
        ...(userId
          ? {
              likes: { where: { userId }, select: { id: true } },
              ratings: { where: { userId }, select: { score: true } },
            }
          : {}),
      },
    });

    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });

    // Clean up the response
    const ratings: { score: number; userId: string }[] = itinerary.ratings || [];
    const average = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;
    const userRating = userId ? ratings.find(r => r.userId === userId)?.score || null : null;

    const result = {
      ...itinerary,
      likeCount: itinerary._count.likes,
      commentCount: itinerary._count.comments,
      ratingsCount: ratings.length,
      averageRating: average,
      userLiked: userId ? itinerary.likes?.length > 0 : false,
      userRating,
      _count: undefined,
      likes: undefined,
      ratings: undefined,
    };

    res.json(result);
  } catch (error) {
    console.error('Get public itinerary error:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});
// In publicItineraryRouter (in itinerary.routes.ts)
publicItineraryRouter.get('/:id/comments', async (req, res) => {
  const itineraryId = String(req.params.id);
  const userId = req.userId;
  try {
    const comments = await prisma.comment.findMany({
      where: { itineraryId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const result = comments.map(c => ({
      ...c,
      canDelete: userId ? c.userId === userId : false,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});
// public for stop photos
publicItineraryRouter.get('/photos/stops', async(_req, res) => {
  try{
    const photos = await prisma.stopPhoto.findMany({
      include: {
        stop: {
          select: {
            id: true,
            name: true,
            itinerary: {
              select: {
                id: true,
                name: true,
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // limit for performance
    });
      const result = photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
      createdAt: photo.createdAt,
      stopId: photo.stop.id,
      stopName: photo.stop.name,
      itineraryId: photo.stop.itinerary.id,
      itineraryName: photo.stop.itinerary.name,
      user: photo.stop.itinerary.user,
    }));
    res.json(result);
  }
  catch(err){
    res.status(500).json({ error: 'Failed to fetch stop photos'
    })
  }
})

export default router;
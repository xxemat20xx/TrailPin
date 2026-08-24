import { Router } from 'express';
import prisma from '../config/db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const totalLikes = await prisma.like.count({
      where: { itinerary: { visibility: 'public' } },
    });

    res.json({ totalLikes });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
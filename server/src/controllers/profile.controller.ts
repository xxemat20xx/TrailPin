import { Request, Response } from 'express';
import prisma from '../config/db';

//GET /api/profile
export const getProfile = async (req: Request, res: Response) => {
    const userId = req.userId!;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try{
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                avatar: true,
                createdAt: true,
            },
        });
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        //count of itineraries created by the user
        const itinerariesCount = await prisma.itinerary.count({
            where: { userId: userId },
        });

        //total upvotes
        const totalUpvotes = await prisma.like.count({
            where: { userId: userId },
        });

        //get user itineraries
           const itineraries = await prisma.itinerary.findMany({
        where: { userId },
        include: {
            stops: { include: { photos: true }, orderBy: { order: 'asc' } },
            _count: { select: { likes: true, comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
        });
    res.json({
      user,
      stats: {
        itinerariesCount,
        totalUpvotes,
      },
      itineraries: itineraries.map((it: any) => ({
        ...it,
        likeCount: it._count.likes,
        commentCount: it._count.comments,
        ratingCount: it._count.ratings,
        _count: undefined,
      })),
    });

    }   catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// PUT /api/profile


export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { username, name, avatar } = req.body;

  // Basic validation: username must be alphanumeric/underscore, 3-20 chars
  if (username !== undefined) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters (letters, numbers, underscores)' });
    }
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== userId) {
      return res.status(409).json({ error: 'Username already taken' });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      username: username !== undefined ? username : undefined,
      name: name !== undefined ? name : undefined,
      avatar: avatar !== undefined ? avatar : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      createdAt: true,
    },
  });

  res.json(updated);
};
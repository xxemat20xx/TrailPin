import { Request, Response } from 'express';
import prisma from '../config/db';

// Rate or update rating
export const rateDestination = async (req: Request, res: Response) => {
    const destinationId = String(req.params.id);
    const userId = req.userId!;
    const { score, review } = req.body;

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) {
        return res.status(400).json({ error: 'Score must be between 1 and 5' });
    }

    const rating = await prisma.rating.upsert({
        where: { userId_destinationId: { userId, destinationId } },
        update: { score: scoreNum, review: review || null },
        create: {
            score: scoreNum,
            review: review || null,
            userId,
            destinationId,
        },
    });

    // Recalculate average rating for the destination (optional)
    const aggregate = await prisma.rating.aggregate({
        where: { destinationId },
        _avg: { score: true },
        _count: { score: true },
    });

    res.json({
        rating,
        average: aggregate._avg.score,
        count: aggregate._count.score,
    });
};

// Get all ratings for a destination (public)
export const getRatings = async (req: Request, res: Response) => {
    const destinationId = String(req.params.id);

    const ratings = await prisma.rating.findMany({
        where: { destinationId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
    });

    const aggregate = await prisma.rating.aggregate({
        where: { destinationId },
        _avg: { score: true },
        _count: { score: true },
    });

    res.json({
        ratings,
        average: aggregate._avg.score,
        count: aggregate._count.score,
    });
};


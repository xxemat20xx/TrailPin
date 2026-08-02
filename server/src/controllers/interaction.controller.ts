import { Request, Response } from 'express';
import prisma from '../config/db';

// Like / unlike
export const toggleLike = async (req: Request, res: Response) => {
    const itineraryId = String(req.params.id);
    const userId = req.userId!;

    const existing = await prisma.like.findUnique({
    where: {
        userId_itineraryId: {
            userId,
            itineraryId,
        },
    },
});

    if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        return res.json({ liked: false });
    }

    await prisma.like.create({ data: { userId, itineraryId } });
    res.json({ liked: true });
};

// Add comment
export const addComment = async (req: Request, res: Response) => {
    const itineraryId = String(req.params.id);
    const userId = req.userId!;
    const { text } = req.body;

    if (!text?.trim()) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await prisma.comment.create({
        data: { text, userId, itineraryId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    res.status(201).json(comment);
};

// Delete comment (owner only)
export const deleteComment = async (req: Request, res: Response) => {
    const commentId = String(req.params.commentId);
    const itineraryId = String(req.params.id);
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== userId || comment.itineraryId !== itineraryId) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted' });
};

export const getComments = async (req: Request, res: Response) => {
    const itineraryId = String(req.params.id);
    const userId = req.userId; //softauth optional

    try {
        const comments = await prisma.comment.findMany({
            where: { itineraryId },
            include: {
                user: {
                    select: { name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // map to include flags (true if the comment belongs to the loggedin user)
        const result = comments.map((c) => ({
            id: c.id,
            text: c.text,
            createdAt: c.createdAt,
            user: c.user,
            canDelete: userId ? c.userId === userId : false,
        }));
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: "Could not fetch comments" })

    }
}
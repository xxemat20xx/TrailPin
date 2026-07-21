import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userEmail?: string;
        }
    }
}

export const authenticate: RequestHandler = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }

    try {
        const decoded = verifyToken(token);

        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
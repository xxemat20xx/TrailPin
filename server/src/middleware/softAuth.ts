import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend Express Request (if not already done globally)
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userEmail?: string;
        }
    }
}

export const softAuth = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = verifyToken(token);
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        } catch {
            // invalid token but still continue, user remains undefined
        }
    }
    next();
};
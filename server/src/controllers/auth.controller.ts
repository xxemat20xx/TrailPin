import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { getGoogleAuthUrl, getGoogleUser } from "../services/auth.service";
import {
    generateToken,
    generateVerificationToken,
    verifyToken,
} from "../utils/jwt";
import { sendVerificationEmail } from "../services/email.service";
import jwt from 'jsonwebtoken'

// ---------- Email/Password Registration ----------
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: "All fields are required"
        })
    }
    if (password.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters long"
        })
    }
    try {
        // check if user exist already
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({
                error: 'Email already in use'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
                isVerified: false,

            }
        })

        //generate email verification token
        const verificationToken = generateVerificationToken(user.id);

        //send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account'
        });
    } catch (error: any) {
        console.log("Registration Error:", error)
        res.status(500).json({
            error: "Registration failed"
        })
    }
}

// ---------- Email verification controller ---------- 
export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Verification token missing' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        }
        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: { isVerified: true }
        });
        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.log("Verification Error:", error)
        res.status(400).json({ error: 'Invalid or expired verification token' });
    }
}

// ---------- Email/Password Login controller ----------  
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required.'
        })
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials, please try again.'
            })
        }
        // password validation
        const valid = await bcrypt.compare(password, user.password!);
        if (!valid) {
            return res.status(401).json({
                error: 'Invalid credentials, please try again.'
            })
        }
        // check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                error: 'Email not verified. Please check your email and verify your account.'
            })
        }
        //generate token
        const token = generateToken({ userId: user.id, email: user.email });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        console.log('Login error:', error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}

// ---------- Google Login controller ----------
export const googleRedirect = (req: Request, res: Response) => {
    res.redirect(getGoogleAuthUrl());
};
export const googleCallback = async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
        const googleUser = await getGoogleUser(code);
        if (!googleUser.email || !googleUser.id) {
            return res.status(400).json({ error: 'Failed to get Google user info' });
        }

        const user = await prisma.user.upsert({
            where: { email: googleUser.email },
            update: {
                googleId: googleUser.id,
                name: googleUser.name,
                avatar: googleUser.picture,
                // If they already had a password account, Google OAuth should mark them validated
                isVerified: true,
            },
            create: {
                email: googleUser.email,
                googleId: googleUser.id,
                name: googleUser.name,
                avatar: googleUser.picture,
                isVerified: true, // Google already verifies email ownership
            },
        });

        const token = generateToken({ userId: user.id, email: user.email });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(process.env.CLIENT_URL! + '/dashboard');
    } catch (error) {
        console.error('Google callback error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// ---------- Get Current User ----------
export const getMe = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
        },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
};
// ---------- Logout ----------
export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};
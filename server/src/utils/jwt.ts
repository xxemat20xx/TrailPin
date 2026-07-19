import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const JWT_EXPIRES_IN =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";

interface TokenPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: TokenPayload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

export const generateVerificationToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '1h',
    });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import destinationRoutes from './routes/destination.routes';

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

// Auth routes

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
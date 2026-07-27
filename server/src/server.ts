import dotenv from 'dotenv';
dotenv.config();                     // ← MUST be before any imports that use env vars

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { router as destinationRoutes, publicRouter as publicDestinationRoutes } from './routes/destination.routes';
import placesRoutes from './routes/places.routes';
import cloudinary from './config/cloudinary';   // now env is loaded
import itineraryRoutes from './routes/itinerary.routes';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/public/destinations', publicDestinationRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ message: 'Server is running' });
});

// TEMPORARY test endpoint
app.get('/api/test-cloudinary', async (_req, res) => {
  const base64Image =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      { folder: 'test' }
    );
    res.json({ success: true, url: result.secure_url });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      http_code: error.http_code,
      name: error.name,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
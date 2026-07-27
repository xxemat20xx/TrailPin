import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createItinerary,
    getUserItineraries,
    getItinerary,
    updateItinerary,
    deleteItinerary,
    getItineraryRoute,
    calculateRoute,
} from '../controllers/itinerary.controller';

const router = Router();

router.use(authenticate); // all routes require login

router.post('/', createItinerary);
router.get('/', getUserItineraries);
router.get('/:id', getItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);
router.get('/:id/route', getItineraryRoute);
router.post('/calculate-route', authenticate, calculateRoute);

export default router;
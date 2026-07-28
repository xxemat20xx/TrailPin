import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createItinerary,
    getUserItineraries,
    getItinerary,
    updateItinerary,
    deleteItinerary,
    calculateRoute,
} from '../controllers/itinerary.controller';

const router = Router();
router.use(authenticate);

router.post('/', createItinerary);
router.get('/', getUserItineraries);
router.get('/:id', getItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);
router.post('/calculate-route', calculateRoute);

export default router;
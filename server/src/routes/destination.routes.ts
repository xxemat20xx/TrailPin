import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createDestination,
    getUserDestinations,
    getDestination,
    updateDestination,
    deleteDestination,
    addPhoto,
    deletePhoto,
} from '../controllers/destination.controller';
import {
    toggleLike,
    addComment,
    deleteComment,
    getComments
} from '../controllers/interaction.controller';
import {
    rateDestination,
    getRatings,
} from '../controllers/rating.controller';
import { upload } from '../middleware/upload';

export const router = Router();

router.use(authenticate);


router.post('/', createDestination);
router.get('/', getUserDestinations);
router.get('/:id', getDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

router.post('/:id/photos', upload.single('photo'), addPhoto);
router.delete('/:id/photos/:photoId', deletePhoto)


router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// # LIKE
router.post('/:id/like', toggleLike);

// # RATINGS
router.post('/:id/rating', rateDestination);
router.get('/:id/ratings', getRatings);



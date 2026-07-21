
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
    addPhotoByUrl,
} from '../controllers/destination.controller';
import { upload } from '../middleware/upload';

const router = Router();


// All routes require authentication
router.use(authenticate);

router.post('/', createDestination);
router.get('/', getUserDestinations);
router.get('/:id', getDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

// Photo routes nested under a destination
router.post("/:id/photos", upload.single("photo"), addPhoto);
router.post('/:id/photos/url', addPhotoByUrl); //for backend testing
router.delete('/:id/photos/:photoId', deletePhoto);


export default router;
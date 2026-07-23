import { Router } from 'express';
import axios from 'axios';

const router = Router();
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const PLACES_API_BASE = 'https://places.googleapis.com/v1';

// Autocomplete (NEW)
router.post('/autocomplete', async (req, res) => {
    const { input } = req.body;
    if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: 'Input query required' });
    }

    try {
        const response = await axios.post(
            `${PLACES_API_BASE}/places:autocomplete`,
            {
                input,
                languageCode: 'en',
                regionCode: 'PH',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,       // ← key as header
                },
            }
        );

        const suggestions = response.data.suggestions || [];
        const predictions = suggestions.map((suggestion: any) => ({
            place_id: suggestion.placePrediction?.placeId || suggestion.placePrediction?.place_id,
            description: suggestion.placePrediction?.text?.text || '',
            structured_formatting: {
                main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
                secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '',
            },
        }));
        res.json(predictions);
    } catch (error: any) {
        console.error('Google Autocomplete error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Autocomplete service failed' });
    }
});

// Place Details (NEW)
router.get('/details', async (req, res) => {
    const { place_id } = req.query;
    if (!place_id || typeof place_id !== 'string') {
        return res.status(400).json({ error: 'place_id required' });
    }

    try {
        const response = await axios.get(
            `${PLACES_API_BASE}/places/${place_id}`,
            {
                headers: {
                    'X-Goog-Api-Key': GOOGLE_API_KEY,       // ← key as header
                    'X-Goog-FieldMask': '*',                // request all fields
                },
            }
        );

        const place = response.data;
        res.json({
            name: place.displayName?.text || place.name,
            address: place.formattedAddress || place.formatted_address,
            latitude: place.location?.latitude || place.geometry?.location?.lat,
            longitude: place.location?.longitude || place.geometry?.location?.lng,
        });
    } catch (error: any) {
        console.error('Google Place Details error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Details service failed' });
    }
});

export default router;
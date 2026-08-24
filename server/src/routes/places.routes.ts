import { Router } from 'express';
import axios from 'axios';


// const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

// const PLACES_API_BASE = 'https://places.googleapis.com/v1';

// Autocomplete (NEW)
// router.post('/autocomplete', async (req, res) => {
//     const { input } = req.body;
//     if (!input || typeof input !== 'string') {
//         return res.status(400).json({ error: 'Input query required' });
//     }

//     try {
//         const response = await axios.post(
//             `${PLACES_API_BASE}/places:autocomplete`,
//             {
//                 input,
//                 languageCode: 'en',
//                 regionCode: 'PH',
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Goog-Api-Key': GOOGLE_API_KEY,       // ← key as header
//                 },
//             }
//         );

//         const suggestions = response.data.suggestions || [];
//         const predictions = suggestions.map((suggestion: any) => ({
//             place_id: suggestion.placePrediction?.placeId || suggestion.placePrediction?.place_id,
//             description: suggestion.placePrediction?.text?.text || '',
//             structured_formatting: {
//                 main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
//                 secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '',
//             },
//         }));
//         res.json(predictions);
//     } catch (error: any) {
//         console.error('Google Autocomplete error:', error.response?.data || error.message);
//         res.status(500).json({ error: 'Autocomplete service failed' });
//     }
// });
// Autocomplete (forward geocoding)

// Place Details (NEW)
// router.get('/details', async (req, res) => {
//     const { place_id } = req.query;
//     if (!place_id || typeof place_id !== 'string') {
//         return res.status(400).json({ error: 'place_id required' });
//     }

//     try {
//         const response = await axios.get(
//             `${PLACES_API_BASE}/places/${place_id}`,
//             {
//                 headers: {
//                     'X-Goog-Api-Key': GOOGLE_API_KEY,       // ← key as header
//                     'X-Goog-FieldMask': '*',                // request all fields
//                 },
//             }
//         );

//         const place = response.data;
//         res.json({
//             name: place.displayName?.text || place.name,
//             address: place.formattedAddress || place.formatted_address,
//             latitude: place.location?.latitude || place.geometry?.location?.lat,
//             longitude: place.location?.longitude || place.geometry?.location?.lng,
//         });
//     } catch (error: any) {
//         console.error('Google Place Details error:', error.response?.data || error.message);
//         res.status(500).json({ error: 'Details service failed' });
//     }
// });
// const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN!;
// router.post('/autocomplete', async (req, res) => {
//   const { input } = req.body;

//   if (!input || typeof input !== 'string') {
//     return res.status(400).json({ error: 'Input query required' });
//   }

//   try {
//     const response = await axios.get(
//       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json`,
//       {
//         params: {
//           access_token: MAPBOX_TOKEN,
//           limit: 5,
//           // Optional: bias to a country or region (change as needed)
//           country: 'PH',   // remove for worldwide
//           types: 'place,address,poi',
//         },
//       }
//     );

//     // Map Mapbox response to the shape your frontend expects
//     const features = response.data.features || [];
//     const predictions = features.map((feature: any) => ({
//       place_id: feature.id,
//       description: feature.place_name,
//       structured_formatting: {
//         main_text: feature.text,
//         secondary_text: feature.place_name.replace(feature.text, '').trim(),
//       },
//     }));

//     res.json(predictions);
//   } catch (error: any) {
//     console.error('Mapbox Autocomplete error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Autocomplete service failed' });
//   }
// });

// router.get('/details', async (req, res) => {
//   const { place_id } = req.query;

//   if (!place_id || typeof place_id !== 'string') {
//     return res.status(400).json({ error: 'place_id required' });
//   }

//   try {
//     const response = await axios.get(
//       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place_id)}.json`,
//       {
//         params: {
//           access_token: MAPBOX_TOKEN,
//           limit: 1,
//         },
//       }
//     );

//     const feature = response.data.features?.[0];
//     if (!feature) {
//       return res.status(404).json({ error: 'Place not found' });
//     }

//     // Extract coordinates and address
//     const [longitude, latitude] = feature.center;
//     const address = feature.place_name;

//     res.json({
//       name: feature.text,
//       address,
//       latitude,
//       longitude,
//     });
//   } catch (error: any) {
//     console.error('Mapbox Place Details error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Details service failed' });
//   }
// });

const router = Router();

const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

// ---------- Autocomplete ----------
router.post('/autocomplete', async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Input query required' });
  }

  try {
    const response = await axios.get(
      'https://api.geoapify.com/v1/geocode/autocomplete',
      {
        params: {
          text: input,
          apiKey: GEOAPIFY_KEY,
          limit: 5,
          // Optional: bias to a country (use ISO code, e.g., PH)
          filter: 'countrycode:ph',
          lang: 'en',
        },
      }
    );

    const results = response.data.features || [];
    const predictions = results.map((feature: any) => ({
      place_id: feature.properties.place_id,
      description: feature.properties.formatted,
      structured_formatting: {
        main_text: feature.properties.name || feature.properties.street || input,
        secondary_text: feature.properties.formatted.replace(feature.properties.name || '', '').trim(),
      },
    }));

    res.json(predictions);
  } catch (error: any) {
    console.error('Geoapify Autocomplete error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Autocomplete service failed' });
  }
});

// ---------- Place Details ----------
router.get('/details', async (req, res) => {
  const { place_id } = req.query;

  if (!place_id || typeof place_id !== 'string') {
    return res.status(400).json({ error: 'place_id required' });
  }

  try {
    const response = await axios.get(
      'https://api.geoapify.com/v1/geocode/place-details',
      {
        params: {
          id: place_id,
          apiKey: GEOAPIFY_KEY,
        },
      }
    );

    const feature = response.data.features?.[0];
    if (!feature) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const { lat, lon, formatted, name } = feature.properties;

    res.json({
      name: name || formatted.split(',')[0],
      address: formatted,
      latitude: lat,
      longitude: lon,
    });
  } catch (error: any) {
    console.error('Geoapify Place Details error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Details service failed' });
  }
});

export default router;
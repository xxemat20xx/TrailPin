import { Router } from 'express';
import axios from 'axios';



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
          filter: 'countrycode:ph', // optional, adjust as needed
          lang: 'en',
        },
      }
    );

    const results = response.data.features || [];
    const predictions = results.map((feature: any) => {
      const { properties } = feature;
      return {
        place_id: properties.place_id,
        description: properties.formatted,
        structured_formatting: {
          main_text: properties.name || properties.street || input,
          secondary_text: properties.formatted.replace(properties.name || '', '').trim(),
        },
       
        name: properties.name || properties.street || input,
        address: properties.formatted,
        latitude: properties.lat,
        longitude: properties.lon,
      };
    });

    res.json(predictions);
  } catch (error: any) {
    console.error('Geoapify Autocomplete error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Autocomplete service failed' });
  }
});

// ---------- Place Details ----------
// router.get('/details', async (req, res) => {
//   const { place_id } = req.query;

//   if (!place_id || typeof place_id !== 'string') {
//     return res.status(400).json({ error: 'place_id required' });
//   }

//   try {
//     const response = await axios.get(
//       'https://api.geoapify.com/v1/geocode/place-details',
//       {
//         params: {
//           id: place_id,
//           apiKey: GEOAPIFY_KEY,
//         },
//       }
//     );

//     const feature = response.data.features?.[0];
//     if (!feature) {
//       return res.status(404).json({ error: 'Place not found' });
//     }

//     const { lat, lon, formatted, name } = feature.properties;

//     res.json({
//       name: name || formatted.split(',')[0],
//       address: formatted,
//       latitude: lat,
//       longitude: lon,
//     });
//   } catch (error: any) {
//     console.error('Geoapify Place Details error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Details service failed' });
//   }
// });

export default router;
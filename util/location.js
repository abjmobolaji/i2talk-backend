const axios = require('axios')
require('dotenv').config();
const API_KEY = process.env.GOOGLE_MAP_API_KEY;

async function getCoordsForAddress(address) {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new Error('Could not find location for the specified address');
        // error.message = 'Could not find location for the specified address';
        throw error;
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;
}

module.exports = getCoordsForAddress;
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const axios = require('axios');
const express = require('express');
const app=express();
const cache = new NodeCache({ stdTTL: 3600 });

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

async function decodeVin(vin) {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;

    try {
        const response = await axios.get(url);
        const results = response.data.Results;

        // Extract the relevant information (Make, Model, Year)
        const vehicleInfo = {};
        results.forEach(result => {
            if (result.Variable === "Make") {
                vehicleInfo.make = result.Value; // Use 'make' here
            } else if (result.Variable === "Model") {
                vehicleInfo.model = result.Value;
            } else if (result.Variable === "Model Year") {
                vehicleInfo.year = result.Value;
            }
        });

        // Return the extracted vehicle information
        return vehicleInfo;
    } catch (error) {
        console.error('Error decoding VIN:', error);
        throw new Error('Failed to decode VIN.');
    }
}

module.exports = { decodeVin, limiter, cache };

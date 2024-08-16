const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Org = require('../models/Org');
const { limiter, cache, decodeVin } = require('../cacheAndRateLimit');



// GET /vehicles/decode/:vin
router.get('/decode/:vin', limiter, async (req, res) => {
  const { vin } = req.params;

  const cachedData = cache.get(vin);
  if (cachedData) {
      return res.json(cachedData);
  }

  try {
      const vehicleData = await decodeVin(vin);
      if (!vehicleData.manufacturer && !vehicleData.model && !vehicleData.year) {
        return res.status(404).json({ error: 'Vehicle details not found for the given VIN' });
    }
      // Cache the result to deal with repeated calls for the same VIN
      cache.set(vin, vehicleData);
      res.json(vehicleData);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// POST /vehicles
router.post('/', authenticateToken, async (req, res) => {
    const { vin, org } = req.body;

    // Validate VIN format
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).json({ error: 'Invalid VIN format' });
    }

    try {
        // Decode VIN
        const { make, model, year } = await decodeVin(vin);

        // Check if organization exists
        const orgExists = await Org.findById(org);
        if (!orgExists) {
            return res.status(400).json({ error: 'Organization not found' });
        }

        // Create the vehicle
        const vehicle = new Vehicle({ 
            vin,
            make,
            model,
            year,
            org 
        });
        await vehicle.save();
        
        // // Cache the result to deal with repeated calls for the same VIN
        cache.set(vin, { make, model, year, org });

        res.status(201).json(vehicle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

  


// GET /vehicles/:vin
router.get('/:vin', async (req, res) => {
  const { vin } = req.params;

  // Vin should be a valid 17 digit alpha-numeric string
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return res.status(400).json({ error: 'Invalid VIN format' });
  }

  try {
      const vehicle = await Vehicle.findOne({ vin }).populate('org');

      // The given vin should be present in our system
      if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.status(200).json(vehicle);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Org = require('../models/Org');

// POST /Orgs
router.post('/', async (req, res) => {
    const { name, account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

    // Validate required fields
    if (!account) {
        return res.status(400).json({ error: 'Account is required' });
    }

    try {
        // Check if the organization already exists
        const existingOrg = await Org.findOne({ account });
        if (existingOrg) {
            return res.status(400).json({ error: 'Organization with this account already exists' });
        }

        // Find a random organization to be the parent
        const randomOrg = await Org.aggregate([{ $sample: { size: 1 } }]).exec();
        const parentOrg = randomOrg.length > 0 ? randomOrg[0] : null;
        const parentOrgId = parentOrg ? parentOrg._id : null;

        // Determine the fuelReimbursementPolicy for the new organization
        const effectiveFuelReimbursementPolicy = parentOrg ? parentOrg.fuelReimbursementPolicy : (fuelReimbursementPolicy || '1000');

        // Create the new organization
        const newOrg = new Org({
            name,
            account,
            website,
            fuelReimbursementPolicy: effectiveFuelReimbursementPolicy,
            speedLimitPolicy,
            parentOrg: parentOrgId // Set parentOrg to a random org or null
        });

        // Save to the database
        const savedOrg = await newOrg.save();
        res.status(201).json(savedOrg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



  
const updatePolicies = async (org, updates) => {
    const updatedOrg = await Org.findByIdAndUpdate(org._id, updates, { new: true });

    const children = await Org.find({ parentOrg: org._id });

    for (const child of children) {
        const childUpdates = { ...updates };

        // Handle fuelReimbursementPolicy inheritance
        if (updates.fuelReimbursementPolicy) {
            // Do not override if the child already has a policy
            if (!child.fuelReimbursementPolicy) {
                childUpdates.fuelReimbursementPolicy = updates.fuelReimbursementPolicy;
            } else {
                childUpdates.fuelReimbursementPolicy = undefined; // Cannot override inherited policy
            }
        }

        // Handle speedLimitPolicy propagation
        if (updates.speedLimitPolicy) {
            if (!child.speedLimitPolicy) {
                childUpdates.speedLimitPolicy = updates.speedLimitPolicy;
            }
        }

        // Recursively update child organizations
        await updatePolicies(child, childUpdates);
    }

    return updatedOrg;
};


// PATCH /orgs
router.patch('/', async (req, res) => {
    const { id, account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

    // Validate input
    if (!id) {
        return res.status(400).json({ error: 'Invalid Input' });
    }

    try {
        // Find the organization
        const org = await Org.findById(id);
        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Determine updates
        const updates = {};
        if (account) updates.account = account;
        if (website) updates.website = website;
        if (fuelReimbursementPolicy !== undefined) updates.fuelReimbursementPolicy = fuelReimbursementPolicy;
        if (speedLimitPolicy !== undefined) updates.speedLimitPolicy = speedLimitPolicy;

        // Update policies
        const updatedOrg = await updatePolicies(org, updates);

        res.status(200).json(updatedOrg);
    } catch (err) {
        console.error('Error updating organization:', err);
        res.status(400).json({ error: err.message });
    }
});


// GET /orgs
router.get('/', async (req, res) => {
  try {
      // Fetch all organizations from the database
      const orgs = await Org.find().populate('parentOrg');

      // Map through the organizations to include parent details if available
      const responseOrgs = orgs.map(org => {
          return {
              id: org._id,
              name: org.name,
              account: org.account,
              website: org.website,
              fuelReimbursementPolicy: org.fuelReimbursementPolicy,
              speedLimitPolicy: org.speedLimitPolicy,
              parent: org.parentOrg ? {
                  id: org.parentOrg._id,
                  name: org.parentOrg.name,
                  account: org.parentOrg.account,
                  website: org.parentOrg.website,
                  fuelReimbursementPolicy: org.parentOrg.fuelReimbursementPolicy,
                  speedLimitPolicy: org.parentOrg.speedLimitPolicy
              } : null
          };
      });

      res.status(200).json(responseOrgs);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

module.exports = router;

// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assume you have a User model
const generateAccessToken = require('../utils/token');

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
});

module.exports = router;

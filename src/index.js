require('dotenv').config();
const express = require('express');
const connectDB = require('./database/db');
const app = express();
const vehicleRoutes = require('./routes/vehicles');
const orgRoutes = require('./routes/orgs');


// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/vehicles', vehicleRoutes);
app.use('/orgs', orgRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

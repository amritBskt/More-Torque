const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    vin: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true },
});

module.exports = mongoose.model('Vehicle', VehicleSchema);

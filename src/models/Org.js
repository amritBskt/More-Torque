const mongoose = require('mongoose');

const OrgSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    account: { type: String, required: true },
    website: { type: String },
    fuelReimbursementPolicy: { type: String, default: '1000' },
    speedLimitPolicy: { type: String },
    parentOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Org' },
});

module.exports = mongoose.model('Org', OrgSchema);

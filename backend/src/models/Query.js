const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
    inputData: { type: Object, required: true },
    prediction: { type: String, enum: ['approved', 'rejected'] },
    probability: { type: Number },
    limeExplanation: { type: Object, default: null },
    shapExplanation: { type: Object, default: null },
    isMock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Query', QuerySchema);

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            logger.warn('MONGODB_URI is not defined. Skipping database connection in mock mode.');
            return;
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection failed:', error.message);
        throw error;
    }
};

module.exports = connectDB;

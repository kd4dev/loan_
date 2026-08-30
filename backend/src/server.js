require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const predictionRoutes = require('./routes/predictionRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Mount routes
app.use('/api', predictionRoutes);

// Use error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const isMockMode = process.env.MOCK_MODE === 'true';

// Connect to MongoDB and start listening
connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`MOCK_MODE is ${isMockMode ? 'ON' : 'OFF'}`);
    });
}).catch(err => {
    logger.error('Failed to connect to database', err);
});

const axios = require('axios');
const logger = require('../utils/logger');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

/**
 * Service to interact with the Python AI backend.
 * This is activated when MOCK_MODE=false in the environment variables.
 */

exports.getPrediction = async (inputData) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/predict`, inputData);
        return { prediction: response.data.prediction, probability: response.data.probability, isMock: false };
    } catch (error) {
        logger.error('Error calling Python service:', error.message);
        throw error;
    }
};

exports.getExplanation = async (inputData) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/explain`, inputData);
        return { 
          prediction: response.data.prediction, 
          probability: response.data.probability, 
          limeExplanation: response.data.limeExplanation, 
          shapExplanation: response.data.shapExplanation,
          isMock: false 
        };
    } catch (error) {
        logger.error('Error calling Python service:', error.message);
        throw error;
    }
};

const axios = require('axios');
const logger = require('../utils/logger');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

exports.getPrediction = async (inputData) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/predict`, inputData);
        return response.data;
    } catch (error) {
        logger.error('Error calling Python service:', error.message);
        if (error.response) {
            const detail = error.response.data?.detail || error.response.data?.message || 'Python service error';
            const err = new Error(detail);
            err.statusCode = error.response.status;
            throw err;
        }
        throw new Error('Python ML service unavailable');
    }
};

exports.getExplanation = async (inputData) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/explain`, inputData);
        return response.data;
    } catch (error) {
        logger.error('Error calling Python service:', error.message);
        if (error.response) {
            const detail = error.response.data?.detail || error.response.data?.message || 'Python service error';
            const err = new Error(detail);
            err.statusCode = error.response.status;
            throw err;
        }
        throw new Error('Python ML service unavailable');
    }
};

exports.getEvaluation = async () => {
    try {
        const response = await axios.get(`${PYTHON_SERVICE_URL}/evaluation`);
        return response.data;
    } catch (error) {
        logger.error('Error fetching evaluation:', error.message);
        throw new Error('Failed to fetch evaluation results');
    }
};

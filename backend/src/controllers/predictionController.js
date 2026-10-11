const Query = require('../models/Query');
const mockService = require('../services/mockService');
const pythonService = require('../services/pythonService');
const logger = require('../utils/logger');

exports.predict = async (req, res, next) => {
    try {
        const inputData = req.body;
        const isMockMode = process.env.MOCK_MODE === 'true';
        let result;

        if (isMockMode) {
            result = mockService.generatePrediction(inputData);
        } else {
            result = await pythonService.getPrediction(inputData);
        }

        // Save to DB if connection exists
        let savedQuery = null;
        if (process.env.MONGODB_URI) {
            try {
                savedQuery = await Query.create({
                    inputData,
                    prediction: result.prediction,
                    probability: result.probability,
                    model: result.model || req.body.model || 'random_forest',
                    isMock: isMockMode
                });
            } catch (dbErr) {
                logger.warn('Failed to save query to DB:', dbErr.message);
            }
        }

        res.json({
            ...result,
            queryId: savedQuery ? savedQuery._id : null
        });
    } catch (error) {
        next(error);
    }
};

exports.explain = async (req, res, next) => {
    try {
        const inputData = req.body;
        const isMockMode = process.env.MOCK_MODE === 'true';
        let result;

        if (isMockMode) {
            result = mockService.generateExplanation(inputData);
        } else {
            result = await pythonService.getExplanation(inputData);
        }

        // Save to DB if connection exists
        let savedQuery = null;
        if (process.env.MONGODB_URI) {
            try {
                savedQuery = await Query.create({
                    inputData,
                    prediction: result.prediction,
                    probability: result.probability,
                    model: result.model || req.body.model || 'random_forest',
                    limeExplanation: result.limeExplanation,
                    shapExplanation: result.shapExplanation,
                    isMock: isMockMode
                });
            } catch (dbErr) {
                logger.warn('Failed to save query to DB:', dbErr.message);
            }
        }

        res.json({
            ...result,
            queryId: savedQuery ? savedQuery._id : null
        });
    } catch (error) {
        next(error);
    }
};

exports.getEvaluation = async (req, res, next) => {
    try {
        const isMockMode = process.env.MOCK_MODE === 'true';
        if (isMockMode) {
            return res.json({ error: 'Evaluation not available in mock mode' });
        }
        const result = await pythonService.getEvaluation();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.getQueries = async (req, res, next) => {
    try {
        if (!process.env.MONGODB_URI) {
            return res.json([]);
        }
        const queries = await Query.find().sort({ createdAt: -1 });
        res.json(queries);
    } catch (error) {
        next(error);
    }
};

exports.getQueryById = async (req, res, next) => {
    try {
        if (!process.env.MONGODB_URI) {
            return res.status(404).json({ error: 'Database not connected' });
        }
        const query = await Query.findById(req.params.id);
        if (!query) {
            return res.status(404).json({ error: 'Query not found' });
        }
        res.json(query);
    } catch (error) {
        next(error);
    }
};

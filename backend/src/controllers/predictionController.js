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
            savedQuery = await Query.create({
                inputData,
                prediction: result.prediction,
                probability: result.probability,
                isMock: isMockMode
            });
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
            savedQuery = await Query.create({
                inputData,
                prediction: result.prediction,
                probability: result.probability,
                limeExplanation: result.limeExplanation,
                shapExplanation: result.shapExplanation,
                isMock: isMockMode
            });
        }

        res.json({
            ...result,
            queryId: savedQuery ? savedQuery._id : null
        });
    } catch (error) {
        next(error);
    }
};

exports.getQueries = async (req, res, next) => {
    try {
        if (!process.env.MONGODB_URI) {
            return res.json([]); // Return empty if no DB
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

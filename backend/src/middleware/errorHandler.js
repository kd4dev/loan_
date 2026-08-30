const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`, err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(err.errors).map(val => val.message)
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

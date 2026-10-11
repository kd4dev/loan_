const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const validateInput = require('../middleware/validateInput');

router.post('/predict', validateInput, predictionController.predict);
router.post('/explain', validateInput, predictionController.explain);
router.get('/evaluation', predictionController.getEvaluation);
router.get('/queries', predictionController.getQueries);
router.get('/queries/:id', predictionController.getQueryById);

module.exports = router;

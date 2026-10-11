const { test, describe } = require('node:test');
const assert = require('node:assert');
const validateInput = require('../src/middleware/validateInput');
const mockService = require('../src/services/mockService');

describe('Backend Input Validation Middleware', () => {
    test('should reject empty request body with 400', () => {
        let statusCode = null;
        let responseJson = null;

        const req = { body: {} };
        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => { responseJson = data; }
                };
            }
        };
        const next = () => { assert.fail('next() should not be called'); };

        validateInput(req, res, next);
        assert.strictEqual(statusCode, 400);
        assert.ok(responseJson.error.includes('cannot be empty'));
    });

    test('should reject request missing loan feature fields', () => {
        let statusCode = null;
        let responseJson = null;

        const req = { body: { foo: 'bar', baz: 123 } };
        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => { responseJson = data; }
                };
            }
        };
        const next = () => { assert.fail('next() should not be called'); };

        validateInput(req, res, next);
        assert.strictEqual(statusCode, 400);
        assert.ok(responseJson.error.includes('missing expected loan feature fields'));
    });

    test('should reject invalid model identifier with 400 Bad Request', () => {
        let statusCode = null;
        let responseJson = null;

        const req = {
            body: {
                A1: 'Male',
                Age: 30,
                Income: 5000,
                model: 'unsupported_model_xyz'
            }
        };
        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => { responseJson = data; }
                };
            }
        };
        const next = () => { assert.fail('next() should not be called'); };

        validateInput(req, res, next);
        assert.strictEqual(statusCode, 400);
        assert.ok(responseJson.error.includes("Invalid model 'unsupported_model_xyz'"));
    });

    test('should accept valid model "random_forest" and proceed', () => {
        let nextCalled = false;
        const req = {
            body: {
                A1: 'Male',
                Age: 30,
                Income: 5000,
                model: 'random_forest'
            }
        };
        const res = {};
        const next = () => { nextCalled = true; };

        validateInput(req, res, next);
        assert.strictEqual(nextCalled, true);
        assert.strictEqual(req.body.model, 'random_forest');
    });

    test('should accept valid model "logistic_regression" and proceed', () => {
        let nextCalled = false;
        const req = {
            body: {
                A1: 'Male',
                Age: 30,
                Income: 5000,
                model: 'logistic_regression'
            }
        };
        const res = {};
        const next = () => { nextCalled = true; };

        validateInput(req, res, next);
        assert.strictEqual(nextCalled, true);
        assert.strictEqual(req.body.model, 'logistic_regression');
    });

    test('should default model to "random_forest" if omitted', () => {
        let nextCalled = false;
        const req = {
            body: {
                A1: 'Male',
                Age: 30,
                Income: 5000
            }
        };
        const res = {};
        const next = () => { nextCalled = true; };

        validateInput(req, res, next);
        assert.strictEqual(nextCalled, true);
        assert.strictEqual(req.body.model, 'random_forest');
    });
});

describe('Backend Mock Service', () => {
    test('generatePrediction preserves selected model identifier', () => {
        const inputData = { model: 'logistic_regression', A1: 'Male', Age: 30 };
        const result = mockService.generatePrediction(inputData);

        assert.strictEqual(result.model, 'logistic_regression');
        assert.ok(['approved', 'rejected'].includes(result.prediction));
        assert.ok(typeof result.probability === 'number');
    });

    test('generateExplanation preserves selected model and generates feature attributions', () => {
        const inputData = { model: 'random_forest', A1: 'Male', Age: 30 };
        const result = mockService.generateExplanation(inputData);

        assert.strictEqual(result.model, 'random_forest');
        assert.ok(result.shapExplanation);
        assert.ok(Array.isArray(result.shapExplanation.features));
        assert.ok(result.shapExplanation.features.length > 0);
    });
});

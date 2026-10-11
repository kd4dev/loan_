import asyncio
import json
import os
import sys
import unittest
import numpy as np
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from main import (
    app,
    LoanInput,
    predict,
    explain,
    health,
    get_evaluation,
    normalize_input,
    preprocess_for_rf,
    preprocess_for_lr,
)
from fastapi import HTTPException


class TestLoanApprovalML(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model_dir = os.path.join(BASE_DIR, "models")

    def test_01_models_and_pipelines_exist(self):
        """Test that all required model artifacts and pipelines are saved."""
        rf_path = os.path.join(self.model_dir, "rf_model.pkl")
        rf_pipe_path = os.path.join(self.model_dir, "preprocessing_pipeline.pkl")
        lr_pipe_path = os.path.join(self.model_dir, "lr_pipeline.pkl")
        eval_path = os.path.join(self.model_dir, "evaluation_results.json")

        self.assertTrue(os.path.exists(rf_path), "rf_model.pkl should exist")
        self.assertTrue(os.path.exists(rf_pipe_path), "preprocessing_pipeline.pkl should exist")
        self.assertTrue(os.path.exists(lr_pipe_path), "lr_pipeline.pkl should exist")
        self.assertTrue(os.path.exists(eval_path), "evaluation_results.json should exist")

    def test_02_model_loading_and_pipeline_isolation(self):
        """Test that each model uses its own separate preprocessing pipeline."""
        rf_model = joblib.load(os.path.join(self.model_dir, "rf_model.pkl"))
        rf_pipe = joblib.load(os.path.join(self.model_dir, "preprocessing_pipeline.pkl"))
        lr_pipe = joblib.load(os.path.join(self.model_dir, "lr_pipeline.pkl"))

        # Verify Random Forest pipeline structure
        self.assertIn("cat_imputer", rf_pipe)
        self.assertIn("num_imputer", rf_pipe)
        self.assertIn("label_encoders", rf_pipe)
        self.assertIn("scaler", rf_pipe)

        # Verify Logistic Regression pipeline structure (sklearn Pipeline with ColumnTransformer)
        self.assertTrue(hasattr(lr_pipe, "named_steps"))
        self.assertIn("preprocessor", lr_pipe.named_steps)
        self.assertIn("classifier", lr_pipe.named_steps)

    def test_03_evaluation_metrics_validity(self):
        """Verify real evaluation metrics on the held-out test set."""
        eval_path = os.path.join(self.model_dir, "evaluation_results.json")
        with open(eval_path, "r") as f:
            data = json.load(f)

        self.assertIn("random_forest", data)
        self.assertIn("logistic_regression", data)
        self.assertEqual(data["test_set_size"], 138)
        self.assertEqual(data["train_set_size"], 552)

        for model_key in ["random_forest", "logistic_regression"]:
            metrics = data[model_key]
            self.assertGreater(metrics["accuracy"], 0.80, f"{model_key} accuracy should exceed 80%")
            self.assertGreater(metrics["precision"], 0.80, f"{model_key} precision should exceed 80%")
            self.assertGreater(metrics["recall"], 0.80, f"{model_key} recall should exceed 80%")
            self.assertGreater(metrics["f1_score"], 0.80, f"{model_key} F1 should exceed 80%")
            self.assertGreater(metrics["roc_auc"], 0.90, f"{model_key} ROC-AUC should exceed 0.90")
            cm = metrics["confusion_matrix"]
            total_test = cm["true_negative"] + cm["false_positive"] + cm["false_negative"] + cm["true_positive"]
            self.assertEqual(total_test, 138, "Confusion matrix sum must equal test set size")

    def test_04_health_endpoint(self):
        """Test /health endpoint returns both models as available."""
        data = asyncio.run(health())
        self.assertEqual(data["status"], "ok")
        self.assertIn("random_forest", data["models_available"])
        self.assertIn("logistic_regression", data["models_available"])

    def test_05_evaluation_endpoint(self):
        """Test /evaluation endpoint returns held-out evaluation metrics."""
        data = asyncio.run(get_evaluation())
        self.assertIn("random_forest", data)
        self.assertIn("logistic_regression", data)

    def test_06_predict_random_forest(self):
        """Test prediction using Random Forest model."""
        payload = LoanInput(
            A1="Male",
            A2=32,
            A3=4.5,
            A4="Single",
            A5="Yes",
            A6="University",
            A7="Group A",
            A8=2.5,
            A9="Yes",
            A10="Employed",
            A11=5,
            A12="No",
            A13="By Birth",
            A14="00200",
            A15=1000,
            model="random_forest"
        )
        data = asyncio.run(predict(payload))
        self.assertEqual(data["model"], "random_forest")
        self.assertIn(data["prediction"], ["approved", "rejected"])
        self.assertIsInstance(data["probability"], float)
        self.assertGreaterEqual(data["probability"], 0.0)
        self.assertLessEqual(data["probability"], 1.0)
        self.assertIn("shapExplanation", data)
        self.assertEqual(len(data["shapExplanation"]["features"]), 15)

    def test_07_predict_logistic_regression(self):
        """Test prediction using Logistic Regression model with isolated pipeline."""
        payload = LoanInput(
            A1="Male",
            A2=32,
            A3=4.5,
            A4="Single",
            A5="Yes",
            A6="University",
            A7="Group A",
            A8=2.5,
            A9="Yes",
            A10="Employed",
            A11=5,
            A12="No",
            A13="By Birth",
            A14="00200",
            A15=1000,
            model="logistic_regression"
        )
        data = asyncio.run(predict(payload))
        self.assertEqual(data["model"], "logistic_regression")
        self.assertIn(data["prediction"], ["approved", "rejected"])
        self.assertIsInstance(data["probability"], float)
        self.assertGreaterEqual(data["probability"], 0.0)
        self.assertLessEqual(data["probability"], 1.0)
        self.assertIn("shapExplanation", data)
        self.assertEqual(len(data["shapExplanation"]["features"]), 15)

    def test_08_invalid_model_identifier_rejected(self):
        """Test that invalid model identifier is rejected with 400 Bad Request."""
        payload = LoanInput(
            A1="Male",
            A2=25,
            model="non_existent_neural_net"
        )
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(predict(payload))
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Invalid model", ctx.exception.detail)

    def test_09_unseen_categorical_values_handled_gracefully(self):
        """Test that both models gracefully handle unseen categorical levels without crashing."""
        payload_rf = LoanInput(
            A1="UnknownCategoryXYZ",
            A2=45,
            A3=2.0,
            A4="NovelStatus",
            A5="UnknownBank",
            A6="QuantumPhysics",
            A7="AlienClan",
            A8=5.0,
            A9="Maybe",
            A10="SemiEmployed",
            A11=1,
            A12="Perhaps",
            A13="MarsCitizen",
            A14=99999,
            A15=10000,
            model="random_forest"
        )
        data_rf = asyncio.run(predict(payload_rf))
        self.assertIn(data_rf["prediction"], ["approved", "rejected"])

        payload_lr = LoanInput(
            A1="UnknownCategoryXYZ",
            A2=45,
            A3=2.0,
            A4="NovelStatus",
            A5="UnknownBank",
            A6="QuantumPhysics",
            A7="AlienClan",
            A8=5.0,
            A9="Maybe",
            A10="SemiEmployed",
            A11=1,
            A12="Perhaps",
            A13="MarsCitizen",
            A14=99999,
            A15=10000,
            model="logistic_regression"
        )
        data_lr = asyncio.run(predict(payload_lr))
        self.assertIn(data_lr["prediction"], ["approved", "rejected"])


if __name__ == "__main__":
    unittest.main()

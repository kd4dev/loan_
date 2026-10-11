import json
import os
import traceback
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

app = FastAPI(title="Loan Prediction Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# =============================================================================
# Load Model Artifacts
# =============================================================================
# 1. Random Forest Model and Fitted Preprocessor
rf_model_path = os.path.join(MODEL_DIR, "rf_model.pkl")
rf_pipeline_path = os.path.join(MODEL_DIR, "preprocessing_pipeline.pkl")

if os.path.exists(rf_model_path) and os.path.exists(rf_pipeline_path):
    rf_model = joblib.load(rf_model_path)
    rf_preprocessing = joblib.load(rf_pipeline_path)
else:
    rf_model = None
    rf_preprocessing = None
    print("WARNING: Random Forest artifacts not found in models directory.")

# 2. Logistic Regression Pipeline (Isolated ColumnTransformer + LogisticRegression)
lr_pipeline_path = os.path.join(MODEL_DIR, "lr_pipeline.pkl")
lr_model_path = os.path.join(MODEL_DIR, "lr_model.pkl")

if os.path.exists(lr_pipeline_path):
    lr_pipeline = joblib.load(lr_pipeline_path)
elif os.path.exists(lr_model_path):
    lr_pipeline = joblib.load(lr_model_path)
else:
    lr_pipeline = None
    print("WARNING: Logistic Regression pipeline not found in models directory.")

# 3. SHAP TreeExplainer for Random Forest
if SHAP_AVAILABLE and rf_model is not None:
    try:
        rf_explainer = shap.TreeExplainer(rf_model)
    except Exception as e:
        print(f"WARNING: Could not initialize TreeExplainer: {e}")
        rf_explainer = None
else:
    rf_explainer = None

# 4. Evaluation Results
eval_path = os.path.join(MODEL_DIR, "evaluation_results.json")
evaluation_results: Optional[Dict[str, Any]] = None
if os.path.exists(eval_path):
    with open(eval_path, "r") as f:
        evaluation_results = json.load(f)

# Feature metadata
FEATURE_NAMES = [
    "Gender", "Age", "Debt", "Marital Status", "Bank Customer",
    "Education Level", "Ethnicity", "Years Employed", "Prior Default",
    "Employment Status", "Credit Score", "Drivers License", "Citizenship",
    "Zip Code", "Income"
]

COLUMNS = [f"A{i}" for i in range(1, 16)]
CATEGORICAL_COLS = ["A1", "A4", "A5", "A6", "A7", "A9", "A10", "A12", "A13"]
NUMERICAL_COLS = ["A2", "A3", "A8", "A11", "A14", "A15"]

# Human-readable form values -> raw UCI dataset values
VALUE_MAPPINGS = {
    "A1": {"Male": "b", "Female": "a", "Other": "b"},
    "A4": {"Single": "u", "Married": "y", "Divorced": "l"},
    "A5": {"Yes": "g", "No": "p"},
    "A6": {
        "Graduate": "w", "University": "q", "High School": "c", "Other": "k",
        "c": "c", "d": "d", "cc": "cc", "i": "i", "j": "j", "k": "k",
        "m": "m", "r": "r", "q": "q", "w": "w", "x": "x", "e": "e",
        "aa": "aa", "ff": "ff"
    },
    "A7": {
        "Group A": "v", "Group B": "h", "Group C": "bb", "Other": "ff",
        "v": "v", "h": "h", "bb": "bb", "j": "j", "n": "n",
        "z": "z", "dd": "dd", "ff": "ff", "o": "o"
    },
    "A9": {"Yes": "t", "No": "f", "t": "t", "f": "f"},
    "A10": {"Employed": "t", "Unemployed": "f", "Self-Employed": "t", "t": "t", "f": "f"},
    "A12": {"Yes": "t", "No": "f", "t": "t", "f": "f"},
    "A13": {
        "By Birth": "g", "By Other Means": "p", "Temporary": "s",
        "g": "g", "p": "p", "s": "s"
    },
}

# Alias friendly field names to A1..A15 if passed
FRIENDLY_TO_A = {
    "gender": "A1", "age": "A2", "debt": "A3", "maritalstatus": "A4", "marital_status": "A4",
    "married": "A4", "bankcustomer": "A5", "bank_customer": "A6", "educationlevel": "A6",
    "education_level": "A6", "industry": "A6", "ethnicity": "A7", "yearsemployed": "A8",
    "years_employed": "A8", "priordefault": "A9", "prior_default": "A9", "employmentstatus": "A10",
    "employment_status": "A10", "employed": "A10", "creditscore": "A11", "credit_score": "A11",
    "driverslicense": "A12", "drivers_license": "A12", "citizenship": "A13", "citizen": "A13",
    "zipcode": "A14", "zip_code": "A14", "income": "A15"
}

VALID_MODELS = {"random_forest", "logistic_regression"}


class LoanInput(BaseModel):
    A1: Optional[Any] = "b"
    A2: Optional[Any] = 0.0
    A3: Optional[Any] = 0.0
    A4: Optional[Any] = "u"
    A5: Optional[Any] = "g"
    A6: Optional[Any] = "w"
    A7: Optional[Any] = "v"
    A8: Optional[Any] = 0.0
    A9: Optional[Any] = "t"
    A10: Optional[Any] = "t"
    A11: Optional[Any] = 0.0
    A12: Optional[Any] = "f"
    A13: Optional[Any] = "g"
    A14: Optional[Any] = 0.0
    A15: Optional[Any] = 0.0
    model: Optional[str] = Field(default="random_forest", description="Model identifier: random_forest or logistic_regression")

    class Config:
        extra = "allow"


def normalize_input(raw_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Map friendly field names and value representations to canonical format."""
    normalized: Dict[str, Any] = {}

    # Map friendly key names to A1..A15
    for k, v in raw_dict.items():
        clean_k = k.lower().replace(" ", "").replace("_", "")
        if clean_k in FRIENDLY_TO_A:
            normalized[FRIENDLY_TO_A[clean_k]] = v
        else:
            normalized[k] = v

    # Apply value mappings for human-readable choices
    mapped: Dict[str, Any] = {}
    for col in COLUMNS:
        val = normalized.get(col, "")
        if col in VALUE_MAPPINGS:
            str_val = str(val).strip()
            mapping = VALUE_MAPPINGS[col]
            mapped[col] = mapping.get(str_val, str_val)
        else:
            mapped[col] = val

    return mapped


def preprocess_for_rf(data_dict: Dict[str, Any]) -> pd.DataFrame:
    """Preprocess input using Random Forest's fitted preprocessing pipeline."""
    if rf_preprocessing is None:
        raise RuntimeError("Random Forest preprocessing pipeline is not loaded.")

    df = pd.DataFrame([data_dict])
    df.replace("?", np.nan, inplace=True)

    for col in NUMERICAL_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Apply fitted imputers
    cat_imp = rf_preprocessing["cat_imputer"]
    num_imp = rf_preprocessing["num_imputer"]
    df[CATEGORICAL_COLS] = cat_imp.transform(df[CATEGORICAL_COLS])
    df[NUMERICAL_COLS] = num_imp.transform(df[NUMERICAL_COLS])

    # Apply fitted label encoders with unseen value handling
    for col in CATEGORICAL_COLS:
        le = rf_preprocessing["label_encoders"][col]
        df[col] = df[col].map(lambda s: s if s in le.classes_ else le.classes_[0])
        df[col] = le.transform(df[col])

    # Apply fitted standard scaler
    scaler = rf_preprocessing["scaler"]
    df[NUMERICAL_COLS] = scaler.transform(df[NUMERICAL_COLS].values)

    return df[COLUMNS]


def preprocess_for_lr(data_dict: Dict[str, Any]) -> pd.DataFrame:
    """Prepare raw DataFrame suitable for Logistic Regression's ColumnTransformer Pipeline."""
    df = pd.DataFrame([data_dict])
    df.replace("?", np.nan, inplace=True)
    for col in NUMERICAL_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df[COLUMNS]


def compute_lr_feature_attributions(pipeline_obj: Any, df_input: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Compute exact feature attribution for Logistic Regression:
    Contribution_j = sum_{k in onehot_cols(j)} weight_k * x_k.
    This exactly decomposes the linear log-odds decision function by original feature.
    """
    try:
        preprocessor = pipeline_obj.named_steps["preprocessor"]
        classifier = pipeline_obj.named_steps["classifier"]

        transformed_x = preprocessor.transform(df_input)
        weights = classifier.coef_[0]
        feature_names_out = preprocessor.get_feature_names_out()

        elementwise_contrib = transformed_x[0] * weights

        # Aggregate contributions by original feature column (A1..A15)
        feature_contribs: Dict[str, float] = {col: 0.0 for col in COLUMNS}
        for feat_name, contrib in zip(feature_names_out, elementwise_contrib):
            # feat_name format: 'num__A2' or 'cat__A1_b'
            part = feat_name.split("__")[-1]
            orig_col = part.split("_")[0]
            if orig_col in feature_contribs:
                feature_contribs[orig_col] += float(contrib)

        results = []
        for i, col in enumerate(COLUMNS):
            val = round(feature_contribs.get(col, 0.0), 4)
            pct = abs(round(val * 100, 1))
            action = "increased" if val > 0 else "decreased"
            results.append({
                "feature": FEATURE_NAMES[i],
                "shapValue": val,
                "description": f"{FEATURE_NAMES[i]} {action} approval likelihood (contribution: {val:+.4f})",
            })

        return sorted(results, key=lambda x: abs(x["shapValue"]), reverse=True)
    except Exception as e:
        print(f"Error computing LR feature attribution: {e}")
        return []


@app.post("/predict")
async def predict(data: LoanInput):
    try:
        raw_data = data.model_dump()
        model_name = raw_data.pop("model", "random_forest") or "random_forest"

        # Validate model identifier strictly
        if model_name not in VALID_MODELS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model '{model_name}'. Valid options are: {', '.join(sorted(VALID_MODELS))}",
            )

        # Normalize and map inputs
        mapped_data = normalize_input(raw_data)

        if model_name == "random_forest":
            if rf_model is None or rf_preprocessing is None:
                raise HTTPException(status_code=500, detail="Random Forest model is not available.")

            df_proc = preprocess_for_rf(mapped_data)
            pred = int(rf_model.predict(df_proc)[0])
            proba = rf_model.predict_proba(df_proc)[0]

            prediction_label = "approved" if pred == 1 else "rejected"
            approval_prob = float(proba[1])
            confidence = float(proba[1]) if pred == 1 else float(proba[0])

            # SHAP Explanation for Random Forest
            shap_features = []
            base_value = 0.5
            if rf_explainer is not None:
                try:
                    shap_vals = rf_explainer.shap_values(df_proc)
                    if isinstance(shap_vals, list) and len(shap_vals) > 1:
                        sv = shap_vals[1][0]
                    elif len(np.shape(shap_vals)) == 3:
                        sv = shap_vals[0, :, 1]
                    else:
                        sv = shap_vals[0]

                    bv = rf_explainer.expected_value
                    if isinstance(bv, (list, np.ndarray)):
                        base_value = float(bv[1])
                    elif bv is not None:
                        base_value = float(bv)

                    for i, col in enumerate(COLUMNS):
                        val = float(sv[i])
                        action = "increased" if val > 0 else "decreased"
                        shap_features.append({
                            "feature": FEATURE_NAMES[i],
                            "shapValue": round(val, 4),
                            "description": f"{FEATURE_NAMES[i]} {action} approval chances by {abs(round(val * 100, 1))}%",
                        })
                    shap_features.sort(key=lambda x: abs(x["shapValue"]), reverse=True)
                except Exception as e:
                    print(f"SHAP explanation failed: {e}")

            return {
                "prediction": prediction_label,
                "probability": approval_prob,
                "confidence": confidence,
                "model": "random_forest",
                "shapExplanation": {
                    "baseValue": base_value,
                    "features": shap_features,
                },
            }

        else:  # logistic_regression
            if lr_pipeline is None:
                raise HTTPException(status_code=500, detail="Logistic Regression pipeline is not available.")

            df_proc_lr = preprocess_for_lr(mapped_data)
            pred = int(lr_pipeline.predict(df_proc_lr)[0])
            proba = lr_pipeline.predict_proba(df_proc_lr)[0]

            prediction_label = "approved" if pred == 1 else "rejected"
            approval_prob = float(proba[1])
            confidence = float(proba[1]) if pred == 1 else float(proba[0])

            # Exact linear feature attribution
            lr_features = compute_lr_feature_attributions(lr_pipeline, df_proc_lr)
            base_val = float(lr_pipeline.named_steps["classifier"].intercept_[0])

            return {
                "prediction": prediction_label,
                "probability": approval_prob,
                "confidence": confidence,
                "model": "logistic_regression",
                "shapExplanation": {
                    "baseValue": base_val,
                    "features": lr_features,
                },
            }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain")
async def explain(data: LoanInput):
    """Endpoint for predictions with explanations."""
    return await predict(data)


@app.get("/health")
async def health():
    models_available = []
    if rf_model is not None:
        models_available.append("random_forest")
    if lr_pipeline is not None:
        models_available.append("logistic_regression")
    return {
        "status": "ok",
        "models_available": models_available,
    }


@app.get("/evaluation")
async def get_evaluation():
    if evaluation_results is None:
        # Try loading dynamically if file exists
        if os.path.exists(eval_path):
            with open(eval_path, "r") as f:
                return json.load(f)
        raise HTTPException(status_code=404, detail="Evaluation results not found. Run train.py first.")
    return evaluation_results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

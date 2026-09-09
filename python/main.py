from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import shap
import numpy as np
import os

app = FastAPI()

# Load the pipeline and model on startup
pipeline = joblib.load("./models/preprocessing_pipeline.pkl")
model = joblib.load("./models/rf_model.pkl")

explainer = shap.TreeExplainer(model)

FEATURE_NAMES = [
    'Gender', 'Age', 'Debt', 'Marital Status', 'Bank Customer', 
    'Education Level', 'Ethnicity', 'Years Employed', 'Prior Default', 
    'Employment Status', 'Credit Score', 'Drivers License', 'Citizenship', 
    'Zip Code', 'Income'
]

class LoanApplication(BaseModel):
    A1: str = "?"
    A2: float = 0.0
    A3: float = 0.0
    A4: str = "?"
    A5: str = "?"
    A6: str = "?"
    A7: str = "?"
    A8: float = 0.0
    A9: str = "?"
    A10: str = "?"
    A11: float = 0.0
    A12: str = "?"
    A13: str = "?"
    A14: float = 0.0
    A15: float = 0.0

def preprocess_input(app_data: dict):
    df = pd.DataFrame([app_data])
    df.replace("?", np.nan, inplace=True)
    
    cat_cols = pipeline['categorical_cols']
    num_cols = pipeline['numerical_cols']
    
    df[cat_cols] = pipeline['cat_imputer'].transform(df[cat_cols])
    df[num_cols] = pipeline['num_imputer'].transform(df[num_cols])
    
    for col in cat_cols:
        le = pipeline['label_encoders'][col]
        # Handle unseen labels by defaulting to the first class
        df[col] = df[col].map(lambda s: s if s in le.classes_ else le.classes_[0])
        df[col] = le.transform(df[col])
        
    df[num_cols] = pipeline['scaler'].transform(df[num_cols])
    
    cols = [f"A{i}" for i in range(1, 16)]
    return df[cols]

@app.post("/predict")
def predict(application: LoanApplication):
    try:
        data = application.model_dump()
    except AttributeError:
        data = application.dict()
        
    df_processed = preprocess_input(data)
    pred = model.predict(df_processed)[0]
    prob = model.predict_proba(df_processed)[0][1]
    
    return {
        "prediction": "approved" if pred == 1 else "rejected",
        "probability": float(prob)
    }

@app.post("/explain")
def explain(application: LoanApplication):
    try:
        data = application.model_dump()
    except AttributeError:
        data = application.dict()
        
    df_processed = preprocess_input(data)
    
    pred = model.predict(df_processed)[0]
    prob = model.predict_proba(df_processed)[0][1]
    
    shap_values = explainer.shap_values(df_processed)
    
    # SHAP logic depending on version
    if isinstance(shap_values, list):
        shap_vals_for_class_1 = shap_values[1][0]
    elif len(shap_values.shape) == 3:
        shap_vals_for_class_1 = shap_values[0, :, 1]
    else:
        shap_vals_for_class_1 = shap_values[0]
        
    base_value = explainer.expected_value
    if isinstance(base_value, (list, np.ndarray)):
        base_value = base_value[1]
        
    features_explanation = []
    
    for i, col in enumerate(df_processed.columns):
        val = shap_vals_for_class_1[i]
        direction = "positive" if val > 0 else "negative"
        actionStr = "increased" if val > 0 else "decreased"
        features_explanation.append({
            "feature": FEATURE_NAMES[i],
            "shapValue": round(float(val), 3),
            "description": f"{FEATURE_NAMES[i]} {actionStr} approval chances by {abs(round(val*100, 1))}%"
        })
        
    return {
        "prediction": "approved" if pred == 1 else "rejected",
        "probability": float(prob),
        "shapExplanation": {
            "baseValue": float(base_value),
            "features": sorted(features_explanation, key=lambda x: abs(x["shapValue"]), reverse=True)
        },
        "limeExplanation": {
            "features": [] # Dummy for now
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import os
import argparse
import requests
import pandas as pd
import numpy as np
import joblib
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Hardcoded defaults (overridden by arguments or env variables)
DEFAULT_DATASET_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/credit-screening/crx.data"
DEFAULT_DATASET_PATH = os.environ.get("DATASET_PATH", "./data/credit_approval.csv")
DEFAULT_PROCESSED_PATH = os.environ.get("PROCESSED_DATA_PATH", "./data/processed_credit.csv")
DEFAULT_PIPELINE_PATH = os.environ.get("PIPELINE_PATH", "./models/preprocessing_pipeline.pkl")

# Column definitions
COLUMNS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16"]
CATEGORICAL_COLS = ["A1", "A4", "A5", "A6", "A7", "A9", "A10", "A12", "A13"]
NUMERICAL_COLS = ["A2", "A3", "A8", "A11", "A14", "A15"]
TARGET_COL = "A16"

def download_data(url: str, output_path: str):
    """Downloads the dataset if it doesn't already exist."""
    if os.path.exists(output_path):
        print(f"Dataset already exists at {output_path}. Skipping download.")
        return

    print(f"Downloading dataset from {url}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        with open(output_path, "wb") as f:
            f.write(response.content)
        print("Download successful.")
    except requests.RequestException as e:
        print(f"Error downloading dataset: {e}")
        raise

def preprocess_data(dataset_path: str, output_path: str, pipeline_path: str):
    """Preprocesses the dataset and saves the pipeline."""
    print("Loading data...")
    df = pd.read_csv(dataset_path, header=None, names=COLUMNS)
    
    print("Replacing '?' with NaN...")
    df = df.replace("?", np.nan)
    
    # Convert numerical columns to float (as some might have been read as object due to '?')
    for col in NUMERICAL_COLS:
        df[col] = df[col].astype(float)
        
    print("Imputing missing values...")
    # Initialize imputers
    cat_imputer = SimpleImputer(strategy="most_frequent")
    num_imputer = SimpleImputer(strategy="median")
    
    # Apply imputation
    df[CATEGORICAL_COLS] = cat_imputer.fit_transform(df[CATEGORICAL_COLS])
    df[NUMERICAL_COLS] = num_imputer.fit_transform(df[NUMERICAL_COLS])
    
    print("Encoding categorical features...")
    label_encoders = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
        
    print("Encoding target variable...")
    # Target encoding: '+' -> 1, '-' -> 0
    df[TARGET_COL] = df[TARGET_COL].map({'+': 1, '-': 0})
    
    print("Scaling numerical features...")
    scaler = StandardScaler()
    df[NUMERICAL_COLS] = scaler.fit_transform(df[NUMERICAL_COLS])
    
    # Save the processed data
    print(f"Saving processed data to {output_path}...")
    df.to_csv(output_path, index=False)
    
    # Save the pipeline components
    print(f"Saving preprocessing pipeline to {pipeline_path}...")
    pipeline = {
        "cat_imputer": cat_imputer,
        "num_imputer": num_imputer,
        "label_encoders": label_encoders,
        "scaler": scaler,
        "categorical_cols": CATEGORICAL_COLS,
        "numerical_cols": NUMERICAL_COLS,
        "target_col": TARGET_COL,
        "all_columns": COLUMNS
    }
    joblib.dump(pipeline, pipeline_path)
    print("Preprocessing completed successfully.")

def main():
    parser = argparse.ArgumentParser(description="Preprocess Credit Approval Data")
    parser.add_argument("--dataset-path", type=str, default=DEFAULT_DATASET_PATH,
                        help="Path to save/load the raw dataset")
    parser.add_argument("--output-path", type=str, default=DEFAULT_PROCESSED_PATH,
                        help="Path to save the processed dataset")
    parser.add_argument("--pipeline-path", type=str, default=DEFAULT_PIPELINE_PATH,
                        help="Path to save the preprocessing pipeline")
    parser.add_argument("--dataset-url", type=str, default=DEFAULT_DATASET_URL,
                        help="URL to download the dataset from")
                        
    args = parser.parse_args()
    
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(args.dataset_path), exist_ok=True)
    os.makedirs(os.path.dirname(args.output_path), exist_ok=True)
    os.makedirs(os.path.dirname(args.pipeline_path), exist_ok=True)
    
    try:
        download_data(args.dataset_url, args.dataset_path)
        preprocess_data(args.dataset_path, args.output_path, args.pipeline_path)
    except Exception as e:
        print(f"Pipeline failed: {e}")

if __name__ == "__main__":
    main()

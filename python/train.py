import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)

COLUMNS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16"]
CATEGORICAL_COLS = ["A1", "A4", "A5", "A6", "A7", "A9", "A10", "A12", "A13"]
NUMERICAL_COLS = ["A2", "A3", "A8", "A11", "A14", "A15"]
TARGET_COL = "A16"


def load_raw_dataset(data_path: str):
    """Load the raw Credit Approval dataset and clean basic missing markers."""
    df = pd.read_csv(data_path, header=None, names=COLUMNS)
    df.replace("?", np.nan, inplace=True)
    for col in NUMERICAL_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def build_rf_preprocessing(X_train: pd.DataFrame, X_test: pd.DataFrame):
    """
    Build and fit the Random Forest preprocessing pipeline strictly on training data
    to guarantee no data leakage. Preserves the original dictionary structure
    (cat_imputer, num_imputer, label_encoders, scaler).
    """
    cat_imputer = SimpleImputer(strategy="most_frequent")
    num_imputer = SimpleImputer(strategy="median")

    # Fit imputers on X_train only
    cat_imputer.fit(X_train[CATEGORICAL_COLS])
    num_imputer.fit(X_train[NUMERICAL_COLS])

    X_train_cat = cat_imputer.transform(X_train[CATEGORICAL_COLS])
    X_train_num = num_imputer.transform(X_train[NUMERICAL_COLS])

    X_test_cat = cat_imputer.transform(X_test[CATEGORICAL_COLS])
    X_test_num = num_imputer.transform(X_test[NUMERICAL_COLS])

    # Fit LabelEncoders on X_train only
    label_encoders = {}
    X_train_cat_enc = np.zeros_like(X_train_cat, dtype=float)
    X_test_cat_enc = np.zeros_like(X_test_cat, dtype=float)

    for i, col in enumerate(CATEGORICAL_COLS):
        le = LabelEncoder()
        X_train_cat_enc[:, i] = le.fit_transform(X_train_cat[:, i])
        label_encoders[col] = le

        # Handle unseen values in test data gracefully
        test_series = pd.Series(X_test_cat[:, i]).map(
            lambda s: s if s in le.classes_ else le.classes_[0]
        )
        X_test_cat_enc[:, i] = le.transform(test_series)

    # Fit StandardScaler on X_train only
    scaler = StandardScaler()
    X_train_num_scaled = scaler.fit_transform(X_train_num)
    X_test_num_scaled = scaler.transform(X_test_num)

    # Assemble back in COLUMNS order
    def assemble_df(cat_data, num_data):
        d = {}
        for idx, col in enumerate(CATEGORICAL_COLS):
            d[col] = cat_data[:, idx]
        for idx, col in enumerate(NUMERICAL_COLS):
            d[col] = num_data[:, idx]
        cols_ordered = [f"A{i}" for i in range(1, 16)]
        return pd.DataFrame(d)[cols_ordered]

    X_train_proc = assemble_df(X_train_cat_enc, X_train_num_scaled)
    X_test_proc = assemble_df(X_test_cat_enc, X_test_num_scaled)

    rf_pipeline_dict = {
        "cat_imputer": cat_imputer,
        "num_imputer": num_imputer,
        "label_encoders": label_encoders,
        "scaler": scaler,
        "categorical_cols": CATEGORICAL_COLS,
        "numerical_cols": NUMERICAL_COLS,
        "target_col": TARGET_COL,
        "all_columns": COLUMNS,
    }

    return rf_pipeline_dict, X_train_proc, X_test_proc


def build_lr_pipeline():
    """
    Build a dedicated scikit-learn Pipeline with ColumnTransformer for Logistic Regression.
    - Missing-value imputation: median for continuous, most_frequent for categorical.
    - OneHotEncoder(handle_unknown='ignore') for nominal categorical variables.
    - StandardScaler() for numerical features.
    - LogisticRegression classifier with balanced hyperparameters.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler()),
                ]),
                NUMERICAL_COLS,
            ),
            (
                "cat",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                CATEGORICAL_COLS,
            ),
        ]
    )

    lr_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(max_iter=1000, random_state=42, solver="lbfgs", C=1.0)),
    ])

    return lr_pipeline


def compute_metrics(y_true, y_pred, y_proba):
    """Compute standard classification evaluation metrics."""
    cm = confusion_matrix(y_true, y_pred).tolist()
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred)), 4),
        "recall": round(float(recall_score(y_true, y_pred)), 4),
        "f1_score": round(float(f1_score(y_true, y_pred)), 4),
        "roc_auc": round(float(roc_auc_score(y_true, y_proba)), 4),
        "confusion_matrix": {
            "true_negative": cm[0][0],
            "false_positive": cm[0][1],
            "false_negative": cm[1][0],
            "true_positive": cm[1][1],
        },
    }


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "credit_approval.csv")
    model_dir = os.path.join(base_dir, "models")
    os.makedirs(model_dir, exist_ok=True)

    print("Loading raw dataset from:", data_path)
    df = load_raw_dataset(data_path)

    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL].map({"+": 1, "-": 0})

    # Stratified train/test split (80/20) on raw data BEFORE fitting any preprocessing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Total samples: {len(df)}")
    print(f"Training set:  {len(X_train)} samples")
    print(f"Test set:      {len(X_test)} samples")

    # =========================================================================
    # 1. Random Forest Training (Pipeline Isolation)
    # =========================================================================
    print("\n" + "=" * 60)
    print("Training Random Forest Classifier...")
    rf_pipeline_dict, X_train_rf, X_test_rf = build_rf_preprocessing(X_train, X_test)

    rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf_model.fit(X_train_rf, y_train)

    rf_preds = rf_model.predict(X_test_rf)
    rf_proba = rf_model.predict_proba(X_test_rf)[:, 1]

    rf_metrics = compute_metrics(y_test, rf_preds, rf_proba)
    print("Random Forest Evaluation Results (Held-Out Test Set):")
    print(f"  Accuracy:  {rf_metrics['accuracy'] * 100:.2f}%")
    print(f"  Precision: {rf_metrics['precision'] * 100:.2f}%")
    print(f"  Recall:    {rf_metrics['recall'] * 100:.2f}%")
    print(f"  F1-Score:  {rf_metrics['f1_score'] * 100:.2f}%")
    print(f"  ROC-AUC:   {rf_metrics['roc_auc']:.4f}")
    print("\nClassification Report (Random Forest):")
    print(classification_report(y_test, rf_preds, target_names=["Rejected (-)", "Approved (+)"]))

    # Save RF artifacts
    joblib.dump(rf_model, os.path.join(model_dir, "rf_model.pkl"))
    joblib.dump(rf_pipeline_dict, os.path.join(model_dir, "preprocessing_pipeline.pkl"))
    print("Saved rf_model.pkl and preprocessing_pipeline.pkl")

    # =========================================================================
    # 2. Logistic Regression Training (Pipeline Isolation)
    # =========================================================================
    print("\n" + "=" * 60)
    print("Training Logistic Regression Classifier...")
    lr_pipeline = build_lr_pipeline()

    # Preprocessing is fit strictly on X_train via Pipeline
    lr_pipeline.fit(X_train, y_train)

    lr_preds = lr_pipeline.predict(X_test)
    lr_proba = lr_pipeline.predict_proba(X_test)[:, 1]

    lr_metrics = compute_metrics(y_test, lr_preds, lr_proba)
    print("Logistic Regression Evaluation Results (Held-Out Test Set):")
    print(f"  Accuracy:  {lr_metrics['accuracy'] * 100:.2f}%")
    print(f"  Precision: {lr_metrics['precision'] * 100:.2f}%")
    print(f"  Recall:    {lr_metrics['recall'] * 100:.2f}%")
    print(f"  F1-Score:  {lr_metrics['f1_score'] * 100:.2f}%")
    print(f"  ROC-AUC:   {lr_metrics['roc_auc']:.4f}")
    print("\nClassification Report (Logistic Regression):")
    print(classification_report(y_test, lr_preds, target_names=["Rejected (-)", "Approved (+)"]))

    # Save LR artifacts (both complete pipeline and standalone model pointer)
    joblib.dump(lr_pipeline, os.path.join(model_dir, "lr_pipeline.pkl"))
    joblib.dump(lr_pipeline.named_steps["classifier"], os.path.join(model_dir, "lr_model.pkl"))
    print("Saved lr_pipeline.pkl and lr_model.pkl")

    # =========================================================================
    # 3. Save Comparative Evaluation Results
    # =========================================================================
    evaluation_payload = {
        "dataset": "UCI Credit Approval",
        "train_set_size": int(len(X_train)),
        "test_set_size": int(len(X_test)),
        "random_forest": rf_metrics,
        "logistic_regression": lr_metrics,
    }

    eval_file = os.path.join(model_dir, "evaluation_results.json")
    with open(eval_file, "w") as f:
        json.dump(evaluation_payload, f, indent=2)
    print(f"Saved evaluation metrics to {eval_file}")
    print("\nTraining and evaluation completed successfully!")


if __name__ == "__main__":
    main()

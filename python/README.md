# Credit Approval Data Preprocessing

This module provides a complete preprocessing pipeline for the UCI Credit Approval dataset. It downloads the dataset, handles missing values, encodes categorical variables, scales numerical features, and saves both the processed data and the transformation pipeline for future model training.

## Prerequisites

- Python 3.9+
- pip

## Installation

```bash
cd python
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## Usage

```bash
# Run with defaults (creates ./data/ and ./models/ automatically)
python preprocess_data.py

# Custom paths
python preprocess_data.py \
  --dataset-path data/raw.csv \
  --output-path data/processed.csv \
  --pipeline-path models/pipe.pkl
```

### Command-Line Arguments

| Argument | Default | Description |
|---|---|---|
| `--dataset-path` | `./data/credit_approval.csv` | Where to save/load the raw dataset |
| `--output-path` | `./data/processed_credit.csv` | Where to save the processed CSV |
| `--pipeline-path` | `./models/preprocessing_pipeline.pkl` | Where to save the serialized pipeline |
| `--dataset-url` | UCI repository URL | Where to download the raw data from |

## Preprocessing Steps

1. **Data Loading** — Downloads the UCI Credit Approval dataset (690 instances, 15 features + 1 target). No headers in raw file; columns assigned as A1–A16.
2. **Missing Value Handling** — `?` replaced with `NaN`. Numerical columns imputed with **median** (robust to outliers), categorical columns imputed with **mode** (most frequent value).
3. **Categorical Encoding** — Each categorical column encoded using `LabelEncoder`. Encoders stored in pipeline for reuse during inference.
4. **Target Encoding** — `+` → 1 (approved), `-` → 0 (rejected).
5. **Feature Scaling** — Numerical features scaled using `StandardScaler` (mean=0, std=1). Needed for LIME's distance-based perturbation kernel.
6. **Pipeline Serialization** — All fitted transformers saved as a single joblib file for reproducible inference.

## Output Files

| File | Description |
|---|---|
| `data/credit_approval.csv` | Raw dataset (690 rows × 16 columns) |
| `data/processed_credit.csv` | Cleaned, encoded, scaled dataset ready for training |
| `models/preprocessing_pipeline.pkl` | Serialized dict: `cat_imputer`, `num_imputer`, `label_encoders`, `scaler`, column lists |

## Dataset Features

| Feature | Type | Values |
|---|---|---|
| A1 | Categorical | b, a |
| A2 | Continuous | — |
| A3 | Continuous | — |
| A4 | Categorical | u, y, l, t |
| A5 | Categorical | g, p, gg |
| A6 | Categorical | c, d, cc, i, j, k, m, r, q, w, x, e, aa, ff |
| A7 | Categorical | v, h, bb, j, n, z, dd, ff, o |
| A8 | Continuous | — |
| A9 | Categorical | t, f |
| A10 | Categorical | t, f |
| A11 | Continuous | — |
| A12 | Categorical | t, f |
| A13 | Categorical | g, p, s |
| A14 | Continuous | — |
| A15 | Continuous | — |
| A16 | **Target** | `+` (approved), `-` (rejected) |

> **Note:** All feature names are anonymized. See `XAI_RESEARCH.md` for the full research guide covering LIME, SHAP, model training, and integration plans.

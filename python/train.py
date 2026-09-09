import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import os

def train():
    processed_path = "./data/processed_credit.csv"
    model_path = "./models/rf_model.pkl"
    
    if not os.path.exists(processed_path):
        print("Processed data not found. Please run preprocess_data.py first.")
        return

    df = pd.read_csv(processed_path)
    X = df.drop(columns=["A16"])
    y = df["A16"]

    # Simple train test split
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf.fit(X_train, y_train)

    preds = rf.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, preds))
    print(classification_report(y_test, preds))

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(rf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train()

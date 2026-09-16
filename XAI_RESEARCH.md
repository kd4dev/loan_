# 🚀 Explainable AI (XAI) Loan Approval

Welcome to the **Explainable AI (XAI) Loan Approval** project! This document serves as the master guide, explaining the dataset, the AI concepts (LIME vs. SHAP), the project roadmap, and learning resources.

---

## 📊 1. The Dataset Explained

We are using the **[UCI Credit Approval Dataset](https://archive.ics.uci.edu/ml/datasets/credit+approval)**. It contains 690 past loan applications.

**Why does the dataset look weird?**
To https://learner.vierp.in/document-requestprotect customer privacy, the original creators anonymized all the column names. Instead of standard names, they used `A1` through `A15`. `A16` is the final decision. 

Here is the "decoded" translation of what those columns actually mean, which we use in our Frontend UI:

| Column | Actual Meaning | Type | What it looks like |
| :--- | :--- | :--- | :--- |
| **A1** | Gender | Category | `a`, `b` |
| **A2** | Age | Number | `30.83`, `58.67` |
| **A3** | Debt / Loan Amount | Number | `0.00`, `4.46` |
| **A4 & A5** | Marital Status / Bank Customer | Category | `u`, `g`, `p` |
| **A6 & A7** | Education & Ethnicity | Category | `w`, `v`, `h` |
| **A8** | Years Employed | Number | `1.25`, `3.04` |
| **A9** | Prior Default? | Category | `t` (True), `f` (False) |
| **A10** | Employed? | Category | `t` (True), `f` (False) |
| **A11** | Credit Score | Number | `1`, `6`, `0` |
| **A12** | Driver's License? | Category | `t` (True), `f` (False) |
| **A13** | Citizenship | Category | `g`, `p`, `s` |
| **A14** | Zip Code | Number | `202`, `43` |
| **A15** | Income | Number | `0`, `560`, `824` |
| **A16 (Target)** | **Approval Decision** | **Category** | `+` (Approved), `-` (Rejected) |

*(Note: The dataset has about 5% missing values marked as `?`, which our `preprocess_data.py` script automatically cleans up and fixes).*

---

## 🧠 2. What is Explainable AI (XAI)?

Normally, powerful Machine Learning models (like Neural Networks or Random Forests) act as **"Black Boxes"**. You feed them applicant data, and they spit out "Rejected." If the applicant asks *why* they were rejected, the bank doesn't know. 

**Explainable AI (XAI)** solves this. It forces the AI to provide a receipt for its decision. 

In lending, XAI is legally required (by laws like ECOA in the US and GDPR in Europe) to ensure models aren't biased against race, gender, or age, and to give applicants actionable feedback.

---

## ⚖️ 3. LIME vs. SHAP (The Explainers)

We use two different algorithms to explain our model's decisions. Here is the simple difference between them:

| Feature | LIME (Local Interpretable Model-agnostic Explanations) | SHAP (SHapley Additive exPlanations) |
| :--- | :--- | :--- |
| **How it works** | It creates a tiny, simple fake model just for *one specific applicant* to see what rules apply to them locally. | It uses Game Theory to calculate exactly how much "credit" or "blame" each feature deserves for the final score. |
| **Math Rule** | Doesn't always add up perfectly. | **Always adds up perfectly.** (Base Score + SHAP values = Final Prediction). |
| **Speed** | Fast for single predictions. | Very Fast for Tree models (TreeSHAP). |
| **Best For** | Showing a quick, simple summary to a non-technical loan officer. | Deep audits, regulatory compliance, and finding global model trends. |
| **Our System Uses** | Secondary explanation view. | Primary explanation engine. |

---

## 🗺️ 4. Project Roadmap

Here is the step-by-step plan for building this entire system.

### ✅ Phase 1: Scaffolding & Preprocessing (Completed)
- [x] Download and clean the UCI dataset (`preprocess_data.py`).
- [x] Build the Node.js/Express Backend (with mock ML responses).
- [x] Build the React/Vite Frontend UI.
- [x] Setup MongoDB to log all predictions.

### ⏳ Phase 2: Model Training (Next Step)
- [ ] Train a **Random Forest** Classifier on the processed data.
- [ ] Tune hyperparameters for the best accuracy/recall.
- [ ] Save the trained model (`.pkl` file).

### ⏳ Phase 3: Python API (FastAPI)
- [ ] Create a Python FastAPI server.
- [ ] Add `/predict` endpoint (loads model, makes prediction).
- [ ] Add `/explain` endpoint (runs LIME and SHAP algorithms).

### ⏳ Phase 4: Full Integration
- [ ] Turn off `MOCK_MODE=true` in the Node backend.
- [ ] Connect the Node Backend to the Python FastAPI server.
- [ ] Watch real SHAP/LIME data flow into the React frontend!

---

## 📚 5. Resources & Repositories to Study

If you want to dive deeper into the code and theory behind XAI, check out these resources:

### Open Source Repositories
*   **[shap/shap](https://github.com/shap/shap)**: The official SHAP library. Look at their README for visual examples of Waterfall and Beeswarm plots.
*   **[marcotcr/lime](https://github.com/marcotcr/lime)**: The official LIME repository. 
*   **[Trusted-AI/AIF360](https://github.com/Trusted-AI/AIF360)**: IBM's open-source toolkit for detecting and fixing bias in machine learning models.
*   **[fairlearn/fairlearn](https://github.com/fairlearn/fairlearn)**: Microsoft's library to assess AI fairness.

### Easy-to-Understand Videos
*   📺 **[SHAP Explained in 5 Minutes (StatQuest)](https://www.youtube.com/watch?v=VB9uV-x0veo)** - The absolute best visual explanation of SHAP values.
*   📺 **[LIME Explained (StatQuest)](https://www.youtube.com/watch?v=d6j6bofhj2M)** - Great visual explanation of how LIME draws its local boundaries.

### Articles & Books
*   📖 **[Interpretable Machine Learning Book](https://christophm.github.io/interpretable-ml-book/)** - A free, incredible online book by Christoph Molnar. (Read the chapters on LIME and Shapley Values).
*   📄 **[SHAP Official Tutorials](https://shap.readthedocs.io/en/latest/)** - Look at their tabular data examples to see how we will code our model.

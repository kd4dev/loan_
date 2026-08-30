# Why Did It Say That? — Loan AI Explainer

An Explainable AI (XAI) loan approval system built with React, Node.js/Express, MongoDB, and Python. The application allows users to input loan applicant data, receive predictions with LIME and SHAP explanations, and understand the reasoning behind each decision.

> **Current Status:** The system is fully scaffolded with mock predictions and explanations. The Python preprocessing pipeline is complete. The ML model (Random Forest) and real LIME/SHAP explanations will be integrated in the next phase. See [XAI_RESEARCH.md](./XAI_RESEARCH.md) for the full roadmap.

---

## Architecture

```
┌──────────────────┐     REST API     ┌──────────────────────┐     Mongoose     ┌─────────────┐
│  React Frontend  │ ◄──────────────► │  Node/Express Backend │ ◄──────────────► │ MongoDB Atlas│
│  (Vite + Tailwind)│                  │  (Mock/Real Service)  │                  │             │
└──────────────────┘                  └──────────────────────┘                  └─────────────┘
                                               ▲
                                               │ (future)
                                               ▼
                                      ┌──────────────────┐
                                      │  Python ML Service │
                                      │  (FastAPI - future)│
                                      └──────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Python Preprocessing Script (standalone, runs independently) │
│  preprocess_data.py → processed_credit.csv + pipeline.pkl    │
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
loan_/
├── README.md                    # This file
├── XAI_RESEARCH.md              # Comprehensive research document
├── python/                      # Data preprocessing module
│   ├── preprocess_data.py       # Main preprocessing script
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variable template
│   └── README.md                # Python-specific documentation
├── backend/                     # Node.js/Express API server
│   ├── src/
│   │   ├── server.js            # Express app entry point
│   │   ├── config/db.js         # MongoDB connection
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Validation & error handling
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Mock & future Python service
│   │   └── utils/               # Logger utility
│   ├── package.json
│   └── .env.example
└── frontend/                    # React + Vite application
    ├── src/
    │   ├── App.jsx              # Main application component
    │   ├── components/
    │   │   ├── ui/              # Custom UI components (shadcn-like)
    │   │   ├── Header.jsx       # App header
    │   │   ├── LoanForm.jsx     # Applicant data form
    │   │   └── ResultSection.jsx # Prediction & explanation display
    │   └── lib/api.js           # Axios API client
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **MongoDB Atlas** account (free tier works) — or a local MongoDB instance

### 1. Python Preprocessing (Optional — Run First If You Want Processed Data)

```bash
cd python

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the preprocessing script
python preprocess_data.py
```

This will:
- Download the UCI Credit Approval dataset
- Clean, encode, and scale the data
- Save `data/processed_credit.csv` and `models/preprocessing_pipeline.pkl`

> **Note:** The backend does NOT depend on this script. It runs independently and prepares data for the future ML model.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file from the template
cp .env.example .env
```

Edit `.env` and fill in your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/loan_explainer?retryWrites=true&w=majority
MOCK_MODE=true
PYTHON_SERVICE_URL=http://localhost:8000
```

> **Tip:** You can get a free MongoDB Atlas connection string at [mongodb.com/atlas](https://www.mongodb.com/atlas). If you don't have MongoDB set up yet, the backend will still work — it just won't persist queries.

Start the server:

```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create your .env file from the template
cp .env.example .env
```

The default `.env` should work out of the box:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Testing the Full Flow

1. **Start the backend** (`cd backend && npm run dev`)
2. **Start the frontend** (`cd frontend && npm run dev`)
3. **Open** `http://localhost:5173` in your browser
4. **Fill out** the loan application form with any values
5. **Click** "Analyze Application"
6. **View** the mock prediction (Approved/Rejected) with probability
7. **Toggle** between LIME and SHAP explanation tabs
8. **Notice** the amber badge: "⚠ Placeholder result — model not yet integrated"

### API Endpoints (Test with curl)

```bash
# Get a mock prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"A1":"Male","A2":30,"A3":2.5,"A15":5000}'

# Get a mock explanation (LIME + SHAP)
curl -X POST http://localhost:5000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"A1":"Male","A2":30,"A3":2.5,"A15":5000}'

# Get all stored queries (requires MongoDB)
curl http://localhost:5000/api/queries

# Get a specific query by ID
curl http://localhost:5000/api/queries/<query_id>
```

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | *required* |
| `MOCK_MODE` | Use mock predictions (`true`/`false`) | `true` |
| `PYTHON_SERVICE_URL` | Future Python ML service URL | `http://localhost:8000` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

### Python (`python/.env.example`)

| Variable | Description | Default |
|---|---|---|
| `DATASET_PATH` | Path to raw dataset | `./data/credit_approval.csv` |
| `PROCESSED_DATA_PATH` | Path to save processed data | `./data/processed_credit.csv` |
| `PIPELINE_PATH` | Path to save pipeline pickle | `./models/preprocessing_pipeline.pkl` |

---

## What Changes When the Real Model Is Added

When the ML model (Random Forest + LIME/SHAP) is implemented:

1. **Python Service**: A new FastAPI application will be created with `/predict` and `/explain` endpoints that load the trained model and preprocessing pipeline.

2. **Backend Change**: Set `MOCK_MODE=false` in `.env` and set `PYTHON_SERVICE_URL` to the FastAPI server's address. The `pythonService.js` file already has the skeleton code — it will call the Python endpoints instead of the mock service.

3. **Frontend**: **No changes needed.** The response format from the backend remains identical. The only difference is that `isMock` will be `false`, and the placeholder badge will disappear.

4. **Data Flow**:
   ```
   Before (current):  Frontend → Express → mockService → MongoDB → Response
   After  (future):   Frontend → Express → Python FastAPI → MongoDB → Response
   ```

See [XAI_RESEARCH.md](./XAI_RESEARCH.md) for the complete integration plan, model training strategy, and explainability implementation details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Axios |
| Backend | Node.js, Express 4, Mongoose 7, CORS, dotenv |
| Database | MongoDB Atlas |
| Python | Python 3.9+, pandas, numpy, scikit-learn, joblib |
| UI Components | Custom (shadcn-like styling, no library dependency) |

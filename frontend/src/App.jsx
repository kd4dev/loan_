import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoanForm, { INITIAL_FORM_STATE } from './components/LoanForm';
import ResultSection from './components/ResultSection';
import ModelEvaluation from './components/ModelEvaluation';
import { getExplanation, getEvaluation } from './lib/api';

const App = () => {
  // Single source of truth for form state
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [selectedModel, setSelectedModel] = useState('random_forest');

  // Prediction and UI states
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Model evaluation metrics state
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Fetch model evaluation metrics on initial load
  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const data = await getEvaluation();
        setEvaluation(data);
      } catch (err) {
        console.warn('Could not fetch model evaluation metrics:', err.message);
      }
    };
    fetchEvaluation();
  }, []);

  const handleSubmit = async (submissionPayload) => {
    setLoading(true);
    setError(null);
    try {
      // Send selected model and all inputs to backend
      const data = await getExplanation(submissionPayload);
      setResult(data);
      // NOTE: Form values in formData are strictly preserved and NEVER reset!
    } catch (err) {
      console.error('Prediction request error:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to fetch prediction. Please verify the backend and ML services are running.';
      setError(errorMsg);
      // NOTE: Form values in formData are strictly preserved and NEVER reset on error!
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...INITIAL_FORM_STATE });
    setSelectedModel('random_forest');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      <main className="container mx-auto px-4 max-w-4xl">
        {/* Navigation & Controls Bar */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setShowEvaluation((prev) => !prev)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-gray-100 text-gray-700 transition-colors shadow-sm"
          >
            {showEvaluation ? 'Hide Model Evaluation' : '📊 View Model Evaluation Metrics'}
          </button>
        </div>

        {/* Model Evaluation Section (if toggled or available) */}
        {showEvaluation && evaluation && (
          <div className="mb-8">
            <ModelEvaluation evaluation={evaluation} />
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/30 px-4 py-3 rounded-lg mb-6 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-destructive font-bold text-xs ml-4 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Application Form - Persistent state */}
        <LoanForm
          formData={formData}
          setFormData={setFormData}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
        />

        {/* Prediction & Explanation Results - Displayed alongside the form */}
        <ResultSection result={result} loading={loading} />

        {/* Always visible Model Evaluation at bottom if not toggled on top */}
        {!showEvaluation && evaluation && (
          <ModelEvaluation evaluation={evaluation} />
        )}
      </main>
    </div>
  );
};

export default App;

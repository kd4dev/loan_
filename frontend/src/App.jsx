import React, { useState } from 'react';
import Header from './components/Header';
import LoanForm from './components/LoanForm';
import ResultSection from './components/ResultSection';
import { getExplanation } from './lib/api';

const App = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Typically, one might fetch getPrediction first or it might all be returned in getExplanation
      // Depending on the backend API we send the form data to `/explain` endpoint.
      const data = await getExplanation(formData);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch prediction or explanation. Please check the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header />
      <main className="container mx-auto px-4 max-w-4xl">
        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/30 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        <LoanForm onSubmit={handleSubmit} loading={loading} />
        <ResultSection result={result} loading={loading} />
      </main>
    </div>
  );
};

export default App;

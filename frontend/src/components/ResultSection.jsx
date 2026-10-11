import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ExplanationTable } from './ui/ExplanationTable';

const MODEL_DISPLAY_NAMES = {
  random_forest: 'Random Forest',
  logistic_regression: 'Logistic Regression',
};

const ResultSection = ({ result, loading }) => {
  if (loading) {
    return (
      <Card className="w-full flex items-center justify-center p-12">
        <Spinner text="Analyzing application with AI models..." className="w-8 h-8" />
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const isApproved = result.prediction?.toLowerCase() === 'approved';
  const confidence = result.probability ? (result.probability * 100).toFixed(1) : '0';
  const modelName = MODEL_DISPLAY_NAMES[result.model] || result.model || 'Unknown Model';
  const isRF = result.model === 'random_forest';
  
  const explanationFeatures = result.shapExplanation?.features || [];
  const explanationLabel = isRF ? 'SHAP Feature Impact' : 'Feature Coefficients';

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>AI Decision Summary</CardTitle>
            <CardDescription>Prediction from <strong>{modelName}</strong></CardDescription>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Model: {modelName}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="flex-shrink-0">
            <div className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 ${isApproved ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}`}>
              <span className={`text-2xl font-bold ${isApproved ? 'text-success' : 'text-destructive'}`}>
                {isApproved ? 'Approved' : 'Rejected'}
              </span>
              <span className="text-sm font-medium text-muted-foreground mt-1">
                {confidence}% sure
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium">Prediction Analysis</h3>
            <p className="text-muted-foreground text-sm mt-1">
              The <strong>{modelName}</strong> model is {confidence}% confident in this {isApproved ? 'approval' : 'rejection'}.
              Below is a breakdown of which features influenced the model's decision the most.
            </p>
          </div>
        </div>

        {explanationFeatures.length > 0 && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-semibold text-foreground">{explanationLabel}</h4>
            </div>
            <div className="pt-2">
              <ExplanationTable features={explanationFeatures} type={isRF ? 'shap' : 'coefficients'} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultSection;

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Tabs } from './ui/Tabs';
import { ExplanationTable } from './ui/ExplanationTable';

const ResultSection = ({ result, loading }) => {
  const [activeTab, setActiveTab] = useState('lime');

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

  const isApproved = result.prediction.toLowerCase() === 'approved';
  const confidence = result.probability ? (result.probability * 100).toFixed(1) : 0;
  
  // The API returns limeExplanation and shapExplanation, nested with { features: [...] }
  const limeFeatures = result.limeExplanation?.features || result.lime_explanation || [];
  const shapFeatures = result.shapExplanation?.features || result.shap_explanation || [];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>AI Decision Summary</CardTitle>
            <CardDescription>How the model evaluated the application.</CardDescription>
          </div>
          {result.isMock && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              ⚠ Placeholder result — model not yet integrated
            </span>
          )}
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
              The AI model is {confidence}% confident in this {isApproved ? 'approval' : 'rejection'}. 
              Below is a breakdown of which features influenced the model's decision the most.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-sm font-semibold text-foreground">Feature Impact Explanation</h4>
            <Tabs 
              tabs={[
                { id: 'lime', label: 'LIME Analysis' },
                { id: 'shap', label: 'SHAP Values' }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          
          <div className="pt-2">
            <ExplanationTable 
              features={activeTab === 'lime' ? limeFeatures : shapFeatures} 
              type={activeTab} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultSection;

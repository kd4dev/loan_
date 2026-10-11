import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';

const ModelEvaluation = ({ evaluation }) => {
  if (!evaluation || !evaluation.random_forest || !evaluation.logistic_regression) {
    return null;
  }

  const { random_forest: rf, logistic_regression: lr, test_set_size, train_set_size } = evaluation;

  const metrics = [
    { label: 'Accuracy', rf: (rf.accuracy * 100).toFixed(2) + '%', lr: (lr.accuracy * 100).toFixed(2) + '%' },
    { label: 'Precision', rf: (rf.precision * 100).toFixed(2) + '%', lr: (lr.precision * 100).toFixed(2) + '%' },
    { label: 'Recall', rf: (rf.recall * 100).toFixed(2) + '%', lr: (lr.recall * 100).toFixed(2) + '%' },
    { label: 'F1-Score', rf: (rf.f1_score * 100).toFixed(2) + '%', lr: (lr.f1_score * 100).toFixed(2) + '%' },
    { label: 'ROC-AUC', rf: rf.roc_auc.toFixed(4), lr: lr.roc_auc.toFixed(4) },
  ];

  return (
    <Card className="w-full mt-8">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle>Model Performance & Evaluation</CardTitle>
            <CardDescription>
              Evaluated on held-out test set ({test_set_size} samples, train set: {train_set_size} samples)
            </CardDescription>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Verified Test Set
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Metric Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Metric</th>
                <th className="px-4 py-3 font-medium text-center">Random Forest</th>
                <th className="px-4 py-3 font-medium text-center rounded-tr-lg">Logistic Regression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.map((row, idx) => {
                const rfVal = parseFloat(row.rf);
                const lrVal = parseFloat(row.lr);
                const rfBetter = rfVal > lrVal;
                const lrBetter = lrVal > rfVal;
                return (
                  <tr key={idx} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                    <td className={`px-4 py-3 text-center font-mono font-semibold ${rfBetter ? 'text-emerald-600' : 'text-foreground'}`}>
                      {row.rf} {rfBetter && '★'}
                    </td>
                    <td className={`px-4 py-3 text-center font-mono font-semibold ${lrBetter ? 'text-emerald-600' : 'text-foreground'}`}>
                      {row.lr} {lrBetter && '★'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Confusion Matrices Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* RF Matrix */}
          <div className="p-4 border rounded-lg bg-gray-50/50">
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center justify-between">
              <span>Random Forest Confusion Matrix</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="block text-muted-foreground">True Negative</span>
                <span className="font-bold text-base text-emerald-800">{rf.confusion_matrix.true_negative}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                <span className="block text-muted-foreground">False Positive</span>
                <span className="font-bold text-base text-rose-800">{rf.confusion_matrix.false_positive}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                <span className="block text-muted-foreground">False Negative</span>
                <span className="font-bold text-base text-rose-800">{rf.confusion_matrix.false_negative}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="block text-muted-foreground">True Positive</span>
                <span className="font-bold text-base text-emerald-800">{rf.confusion_matrix.true_positive}</span>
              </div>
            </div>
          </div>

          {/* LR Matrix */}
          <div className="p-4 border rounded-lg bg-gray-50/50">
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center justify-between">
              <span>Logistic Regression Confusion Matrix</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="block text-muted-foreground">True Negative</span>
                <span className="font-bold text-base text-emerald-800">{lr.confusion_matrix.true_negative}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                <span className="block text-muted-foreground">False Positive</span>
                <span className="font-bold text-base text-rose-800">{lr.confusion_matrix.false_positive}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                <span className="block text-muted-foreground">False Negative</span>
                <span className="font-bold text-base text-rose-800">{lr.confusion_matrix.false_negative}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="block text-muted-foreground">True Positive</span>
                <span className="font-bold text-base text-emerald-800">{lr.confusion_matrix.true_positive}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelEvaluation;

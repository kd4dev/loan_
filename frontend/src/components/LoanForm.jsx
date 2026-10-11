import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';

export const INITIAL_FORM_STATE = {
  A1: 'Male',
  A2: 25,
  A3: 0.0,
  A4: 'Single',
  A5: 'Yes',
  A6: 'University',
  A7: 'Group A',
  A8: 0.0,
  A9: 'No',
  A10: 'Employed',
  A11: 0,
  A12: 'No',
  A13: 'By Birth',
  A14: '00000',
  A15: 0,
};

export const MODEL_OPTIONS = [
  { value: 'random_forest', label: 'Random Forest' },
  { value: 'logistic_regression', label: 'Logistic Regression' },
];

const LoanForm = ({
  formData: controlledFormData,
  setFormData: controlledSetFormData,
  selectedModel: controlledSelectedModel,
  setSelectedModel: controlledSetSelectedModel,
  onSubmit,
  onReset,
  loading,
}) => {
  // Support both controlled mode (from parent App) and uncontrolled fallback
  const [internalFormData, setInternalFormData] = useState({ ...INITIAL_FORM_STATE });
  const [internalModel, setInternalModel] = useState('random_forest');
  const [errors, setErrors] = useState({});

  const formData = controlledFormData !== undefined ? controlledFormData : internalFormData;
  const setFormData = controlledSetFormData !== undefined ? controlledSetFormData : setInternalFormData;
  const selectedModel = controlledSelectedModel !== undefined ? controlledSelectedModel : internalModel;
  const setSelectedModel = controlledSetSelectedModel !== undefined ? controlledSetSelectedModel : setInternalModel;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = value !== '' ? Number(value) : '';
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    // Explicitly preserve all form inputs when switching models
  };

  const validate = () => {
    const newErrors = {};
    if (formData.A2 <= 0) newErrors.A2 = 'Age must be > 0';
    if (formData.A15 < 0) newErrors.A15 = 'Income cannot be negative';
    if (formData.A11 < 0) newErrors.A11 = 'Credit Score cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, model: selectedModel });
    }
  };

  const handleReset = () => {
    setFormData({ ...INITIAL_FORM_STATE });
    setSelectedModel('random_forest');
    setErrors({});
    if (onReset) {
      onReset();
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 border-b pb-2">Model Selection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Prediction Model</Label>
                <select
                  id="model"
                  name="model"
                  value={selectedModel}
                  onChange={handleModelChange}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground">
                  {selectedModel === 'random_forest'
                    ? 'Random Forest: Non-linear ensemble model with SHAP explanations.'
                    : 'Logistic Regression: Scaled linear model with feature coefficients.'}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 border-b pb-2">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="A1">Gender</Label>
                <select id="A1" name="A1" value={formData.A1} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A2">Age</Label>
                <Input id="A2" name="A2" type="number" step="1" value={formData.A2} onChange={handleChange} />
                {errors.A2 && <p className="text-xs text-destructive">{errors.A2}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="A4">Marital Status</Label>
                <select id="A4" name="A4" value={formData.A4} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A7">Ethnicity</Label>
                <select id="A7" name="A7" value={formData.A7} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Group A">Group A</option>
                  <option value="Group B">Group B</option>
                  <option value="Group C">Group C</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 border-b pb-2">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="A15">Income</Label>
                <Input id="A15" name="A15" type="number" step="1" value={formData.A15} onChange={handleChange} />
                {errors.A15 && <p className="text-xs text-destructive">{errors.A15}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="A3">Debt</Label>
                <Input id="A3" name="A3" type="number" step="0.01" value={formData.A3} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="A5">Bank Customer</Label>
                <select id="A5" name="A5" value={formData.A5} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A9">Prior Default</Label>
                <select id="A9" name="A9" value={formData.A9} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A11">Credit Score</Label>
                <Input id="A11" name="A11" type="number" step="1" value={formData.A11} onChange={handleChange} />
                {errors.A11 && <p className="text-xs text-destructive">{errors.A11}</p>}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 border-b pb-2">Additional Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="A6">Education Level</Label>
                <select id="A6" name="A6" value={formData.A6} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Graduate">Graduate</option>
                  <option value="University">University</option>
                  <option value="High School">High School</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A10">Employment Status</Label>
                <select id="A10" name="A10" value={formData.A10} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Self-Employed">Self-Employed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A8">Years Employed</Label>
                <Input id="A8" name="A8" type="number" step="0.01" value={formData.A8} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="A12">Drivers License</Label>
                <select id="A12" name="A12" value={formData.A12} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A13">Citizenship</Label>
                <select id="A13" name="A13" value={formData.A13} onChange={handleChange} className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                  <option value="By Birth">By Birth</option>
                  <option value="By Other Means">By Other Means</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="A14">Zip Code</Label>
                <Input id="A14" name="A14" type="text" value={formData.A14} onChange={handleChange} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            Reset Form
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 md:flex-none md:w-auto">
            {loading ? 'Analyzing...' : 'Predict Loan Approval'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoanForm;

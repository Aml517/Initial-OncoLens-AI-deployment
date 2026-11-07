'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  RotateCcw, 
  HelpCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Loader2,
  Info,
  Sliders
} from 'lucide-react';
import { FEATURES } from '@/lib/constants';
import { PredictionResult } from '@/lib/types';

export default function ModelSandboxPage() {
  const [formData, setFormData] = useState<Record<string, number | ''>>({
    Clump_Thickness: 5,
    Uniformity_of_Cell_Size: 1,
    Uniformity_of_Cell_Shape: 1,
    Marginal_Adhesion: 1,
    Single_Epithelial_Cell_Size: 2,
    Bare_Nuclei: 1,
    Bland_Chromatin: 3,
    Normal_Nucleoli: 1,
    Mitoses: 1
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleInputChange = (field: string, val: string) => {
    if (val === '') {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      setFormData(prev => ({ ...prev, [field]: num }));
    }
  };

  const resetForm = () => {
    const defaults: Record<string, number> = {};
    FEATURES.forEach(f => {
      defaults[f.field] = f.defaultValue;
    });
    setFormData(defaults);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, number | null> = {};
    for (const f of FEATURES) {
      const val = formData[f.field];
      if (f.field === 'Bare_Nuclei' && (val === '' || val === null || val === undefined)) {
        payload[f.field] = null;
      } else if (val === '' || typeof val !== 'number') {
        setError(`Please specify a valid value (1-10) for ${f.name}.`);
        setLoading(false);
        return;
      } else {
        payload[f.field] = Number(val);
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    try {
      const res = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `API responded with status ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(
        err.message || 
        "Unable to reach the Python FastAPI inference server at " + apiUrl + ". Ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <Sliders className="w-3.5 h-3.5" />
          <span>Secondary Experimental Interface</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Model Prediction Sandbox</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          An exploratory sandbox for inspecting how the trained Artificial Neural Network (MLP) responds to arbitrary cytological feature vectors. These 9 inputs represent ordinal pathologist scores (1 to 10), not patient symptoms.
        </p>
      </div>

      {/* Methodological Context Alert */}
      <div className="p-4 rounded-xl bg-canvas border border-slate-light/40 text-xs text-slate space-y-1">
        <div className="flex items-center space-x-2 text-navy font-bold">
          <Info className="w-4 h-4 text-teal" />
          <span>Research Context &amp; Operational Boundary</span>
        </div>
        <p className="leading-relaxed">
          The pipeline processes inputs through the frozen Scikit-learn Pipeline (median imputation &rarr; standard scaling &rarr; forward pass through 8 ReLU hidden neurons). Predictions reflect the decision surface learned from the historical 1992 dataset and must not be interpreted as clinical diagnoses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-light/30 pb-4">
            <h2 className="text-base font-bold text-navy">Cytological Feature Vector (9 Scores)</h2>
            <button
              type="button"
              onClick={resetForm}
              className="px-2.5 py-1 rounded text-xs font-medium text-slate hover:text-navy hover:bg-canvas transition-colors inline-flex items-center gap-1"
              title="Reset to dataset medians"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {FEATURES.map((feature, idx) => {
                const val = formData[feature.field];
                const numericVal = typeof val === 'number' ? val : 1;

                return (
                  <div key={feature.id} className="space-y-1.5 p-3 rounded-lg hover:bg-canvas/60 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-slate-light font-bold">0{idx+1}.</span>
                        <label htmlFor={feature.id} className="font-semibold text-navy cursor-pointer">
                          {feature.name}
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTooltip(activeTooltip === feature.id ? null : feature.id)}
                          className="text-slate hover:text-teal focus:outline-none"
                          title="View cytology explanation"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          id={feature.id}
                          min={1}
                          max={10}
                          step={1}
                          value={val}
                          onChange={(e) => handleInputChange(feature.field, e.target.value)}
                          className="w-14 h-7 text-center font-mono font-semibold text-xs border border-slate-light/50 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal"
                        />
                      </div>
                    </div>

                    {/* Slider Control */}
                    <div className="flex items-center space-x-3 pt-1">
                      <span className="text-[10px] font-mono text-slate">1</span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={numericVal}
                        onChange={(e) => handleInputChange(feature.field, e.target.value)}
                        className="w-full h-1.5 bg-slate-light/30 rounded-lg appearance-none cursor-pointer accent-teal"
                      />
                      <span className="text-[10px] font-mono text-slate">10</span>
                    </div>

                    {/* Explanatory Tooltip Box */}
                    {activeTooltip === feature.id && (
                      <div className="mt-2 p-3 rounded-md bg-canvas text-xs text-slate border border-slate-light/40 space-y-1">
                        <p className="font-medium text-navy">{feature.description}</p>
                        <p className="text-[11px] text-teal-dark">{feature.cytologyContext}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-light/30 flex items-center justify-between">
              <span className="text-xs text-slate">
                * If Bare Nuclei is left empty, the pipeline applies median imputation (1.0).
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-teal hover:bg-teal-light text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-mint" />
                    <span>Evaluating Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-mint" />
                    <span>Evaluate ANN Prediction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Inference Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-light/30 pb-4">
              <h2 className="text-base font-bold text-navy">Prediction Output</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-light/10 text-navy font-semibold">
                MLPClassifier (8,)
              </span>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-light text-rose border border-rose/30 space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Inference Notice</span>
                </div>
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-canvas mx-auto flex items-center justify-center text-slate">
                  <Info className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-navy">Awaiting Test Input</p>
                <p className="text-xs text-slate max-w-xs mx-auto">
                  Set the 9 cytological scores on the left, then click &quot;Evaluate ANN Prediction&quot;.
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal" />
                <p className="text-sm font-semibold text-navy">Evaluating Trained Pipeline...</p>
                <p className="text-xs text-slate">SimpleImputer &rarr; StandardScaler &rarr; MLP Forward Pass</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* Result Card Banner */}
                <div className={`p-6 rounded-xl border text-center space-y-2 ${
                  result.predicted_label === 'Malignant' 
                    ? 'bg-rose-light/50 border-rose/30 text-rose-dark' 
                    : 'bg-mint-light/50 border-mint-dark/40 text-teal-dark'
                }`}>
                  <p className="text-xs uppercase font-mono font-bold tracking-wider">Experimental Assignment</p>
                  <p className="text-3xl font-extrabold tracking-tight">
                    {result.predicted_label}
                  </p>
                  <p className="text-xs opacity-80 font-mono">
                    Class {result.predicted_class === 1 ? '4 (Malignant positive class)' : '2 (Benign)'}
                  </p>
                </div>

                {/* Probability Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-navy">
                    <span>Model Estimated Probability (Malignant)</span>
                    <span className="font-mono text-sm">{(result.probability_malignant * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full h-3 bg-canvas rounded-full overflow-hidden flex border border-slate-light/30">
                    <div 
                      className="h-full bg-teal transition-all duration-500" 
                      style={{ width: `${result.probability_benign * 100}%` }}
                      title={`Benign: ${(result.probability_benign * 100).toFixed(1)}%`}
                    />
                    <div 
                      className="h-full bg-rose transition-all duration-500" 
                      style={{ width: `${result.probability_malignant * 100}%` }}
                      title={`Malignant: ${(result.probability_malignant * 100).toFixed(1)}%`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate pt-1">
                    <span>Benign: {(result.probability_benign * 100).toFixed(1)}%</span>
                    <span>Malignant: {(result.probability_malignant * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Technical Audit Checklist */}
                <div className="p-4 rounded-lg bg-canvas text-xs space-y-2 border border-slate-light/30">
                  <div className="flex justify-between text-slate">
                    <span>Imputation Applied:</span>
                    <span className="font-mono text-navy font-semibold">{result.imputation_applied ? 'Yes (Bare Nuclei)' : 'No (Complete Input)'}</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>Model Backbone:</span>
                    <span className="font-mono text-navy">{result.model_name}</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>Operating Threshold:</span>
                    <span className="font-mono text-navy">0.50 (Standard Decision Boundary)</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start space-x-2 text-xs text-slate-dark bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Experimental Sandbox:</strong> This output demonstrates the mathematical mapping learned by the model from the historical 1992 Wisconsin dataset. It is not an FDA-cleared diagnostic result.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

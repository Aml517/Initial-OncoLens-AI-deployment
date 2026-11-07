'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Sliders, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  Info,
  Scale,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import evalData from '@/lib/data/evaluation_analysis.json';
import { MODEL_RESULTS } from '@/lib/constants';

export default function PerformanceLabPage() {
  const [threshold, setThreshold] = useState<number>(0.50);

  const { 
    summary_metrics_default_threshold: defaultMetrics, 
    roc_curve, 
    precision_recall_curve, 
    threshold_sweep 
  } = evalData;

  // Find the threshold sweep item closest to current threshold slider
  const targetSweep = threshold_sweep.find(s => Math.abs(s.threshold - threshold) < 0.005) || threshold_sweep[49];

  const tn = targetSweep.tn;
  const fp = targetSweep.fp;
  const fn = targetSweep.fn;
  const tp = targetSweep.tp;

  // Format ROC curve data with baseline
  const rocChartData = roc_curve.map((p, idx) => ({
    ...p,
    baseline: p.fpr
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Hold-Out Test Benchmarking &amp; Decision Curves</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Model Evaluation &amp; Threshold Analysis</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          Rigorous experimental evaluation of the Artificial Neural Network (MLP) on the 139-sample hold-out test set (91 benign, 48 malignant). Positive class is strictly defined as Malignant.
        </p>
      </div>

      {/* Primary Verification Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-slate">Accuracy</p>
          <p className="text-2xl font-extrabold text-navy">{(defaultMetrics.accuracy * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate">135 / 139 correct</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-teal-dark font-bold">Sensitivity (Recall)</p>
          <p className="text-2xl font-extrabold text-teal">{(defaultMetrics.sensitivity_recall * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate">46 / 48 cancers caught</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-slate">Specificity</p>
          <p className="text-2xl font-extrabold text-navy">{(defaultMetrics.specificity * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate">89 / 91 benign correct</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-slate">Precision</p>
          <p className="text-2xl font-extrabold text-navy">{(defaultMetrics.precision * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate">46 / 48 positive calls</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-slate">F1-Score</p>
          <p className="text-2xl font-extrabold text-navy">{(defaultMetrics.f1_score * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate">Harmonic mean P &amp; R</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-rose font-bold">ROC-AUC / PR-AUC</p>
          <p className="text-2xl font-extrabold text-rose">{defaultMetrics.roc_auc.toFixed(3)}</p>
          <p className="text-[10px] text-slate">PR-AUC: {defaultMetrics.pr_auc.toFixed(3)}</p>
        </div>
      </div>

      {/* Dynamic Classification Threshold Simulator */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-teal mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Decision Boundary Simulator</span>
            </div>
            <h2 className="text-lg font-bold text-navy">Classification Threshold Analysis</h2>
            <p className="text-xs text-slate">Adjust the decision threshold (&theta;) to observe real-time trade-offs between missed cancers (FN) and false alarms (FP)</p>
          </div>

          <div className="flex items-center space-x-3 bg-canvas px-4 py-2 rounded-xl border border-slate-light/40">
            <span className="text-xs text-slate font-mono">Current &theta;:</span>
            <span className="text-xl font-bold font-mono text-navy">{threshold.toFixed(2)}</span>
            <button
              onClick={() => setThreshold(0.50)}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-white hover:bg-slate-light/20 text-slate border border-slate-light/40"
            >
              Default (0.50)
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex justify-between text-xs font-mono text-slate">
            <span>Aggressive Screening (&theta; = 0.01)</span>
            <span>Balanced (&theta; = 0.50)</span>
            <span>Conservative (&theta; = 0.99)</span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.99}
            step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-light/30 rounded-lg appearance-none cursor-pointer accent-teal"
          />
        </div>

        {/* Threshold Metrics Grid & Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* Metrics at Theta */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Performance at &theta; = {threshold.toFixed(2)}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 flex justify-between items-center">
                <span className="text-slate">Sensitivity (Recall):</span>
                <span className="font-mono font-bold text-teal text-sm">{(targetSweep.sensitivity * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 flex justify-between items-center">
                <span className="text-slate">Specificity:</span>
                <span className="font-mono font-bold text-navy text-sm">{(targetSweep.specificity * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 flex justify-between items-center">
                <span className="text-slate">Precision:</span>
                <span className="font-mono font-bold text-navy text-sm">{(targetSweep.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 flex justify-between items-center">
                <span className="text-slate">F1-Score:</span>
                <span className="font-mono font-bold text-navy text-sm">{(targetSweep.f1_score * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-slate space-y-1">
              <p className="font-bold text-amber-900">Trade-Off Axiom</p>
              <p>
                Lowering &theta; from 0.50 to 0.20 raises Sensitivity by catching borderline malignant cases, but increases False Alarms (FP). Raising &theta; to 0.80 purifies Precision at the expense of dangerous missed cancers (FN).
              </p>
            </div>
          </div>

          {/* Resulting Confusion Matrix at Theta */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Resulting Confusion Matrix (N = 139)</h3>
            <div className="grid grid-cols-2 gap-3 max-w-sm text-center font-mono">
              <div className="p-3.5 rounded-xl bg-teal/10 border border-teal/30 space-y-0.5">
                <span className="text-[9px] text-teal-dark font-bold uppercase block">True Negative (TN)</span>
                <span className="text-2xl font-extrabold text-teal-dark">{tn}</span>
                <span className="text-[10px] text-slate block font-sans">Benign Correct</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
                <span className="text-[9px] text-amber-700 font-bold uppercase block">False Positive (FP)</span>
                <span className="text-2xl font-extrabold text-amber-700">{fp}</span>
                <span className="text-[10px] text-slate block font-sans">False Alarm</span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-light border border-rose/30 space-y-0.5">
                <span className="text-[9px] text-rose font-bold uppercase block">False Negative (FN)</span>
                <span className="text-2xl font-extrabold text-rose">{fn}</span>
                <span className="text-[10px] text-slate block font-sans">Missed Cancer</span>
              </div>
              <div className="p-3.5 rounded-xl bg-mint border border-mint-dark/40 space-y-0.5">
                <span className="text-[9px] text-teal-dark font-bold uppercase block">True Positive (TP)</span>
                <span className="text-2xl font-extrabold text-teal-dark">{tp}</span>
                <span className="text-[10px] text-slate block font-sans">Malignant Caught</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* True ROC and Precision-Recall Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* True ROC Curve */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-4">
          <div className="border-b border-slate-light/30 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy">Empirical ROC Curve</h3>
              <p className="text-xs text-slate">FPR vs. TPR across all continuous probability thresholds</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose px-2 py-0.5 rounded bg-rose-light">
              AUC = {defaultMetrics.roc_auc.toFixed(4)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="fpr" tick={{ fontSize: 10 }} label={{ value: 'FPR (1 - Specificity)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} label={{ value: 'TPR (Recall)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip />
                <Line type="stepAfter" dataKey="tpr" stroke="#D6336C" strokeWidth={2.5} dot={false} name="ANN Classifier" />
                <Line type="linear" dataKey="baseline" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Chance Line" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate italic text-center">
            Steep ascent near the origin confirms strong ranking power, with high true-positive detection at low false-alarm rates.
          </p>
        </div>

        {/* True Precision-Recall Curve */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-4">
          <div className="border-b border-slate-light/30 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy">Precision-Recall Curve</h3>
              <p className="text-xs text-slate">Informative under class imbalance (34.5% malignant)</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal px-2 py-0.5 rounded bg-mint">
              PR-AUC = {defaultMetrics.pr_auc.toFixed(4)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={precision_recall_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="recall" tick={{ fontSize: 10 }} label={{ value: 'Recall (Sensitivity)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                <YAxis domain={[0.8, 1.0]} tick={{ fontSize: 10 }} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip />
                <Line type="stepAfter" dataKey="precision" stroke="#176B67" strokeWidth={2.5} dot={false} name="ANN Precision" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate italic text-center">
            Precision remains above 90% across recalls up to 95.8%, verifying reliable malignant identification.
          </p>
        </div>
      </div>

      {/* Benchmark Across All Five Algorithms */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="border-b border-slate-light/30 pb-4">
          <h2 className="text-lg font-bold text-navy">Five-Algorithm Comparative Benchmark Table</h2>
          <p className="text-xs text-slate">Evaluated on identical stratified test set (test size = 0.20, n = 139) with default threshold &theta; = 0.50</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall (Malignant)</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">ROC-AUC</th>
                <th className="py-3 px-3">CV F1 (Train)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-light/20">
              {MODEL_RESULTS.map((m) => (
                <tr 
                  key={m.name} 
                  className={`hover:bg-canvas/60 transition-colors ${m.is_best ? 'bg-mint-light/30' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy text-sm">{m.name}</span>
                      {m.is_best && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal text-white font-mono font-bold">
                          Selected Best
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate font-mono">{m.architecture}</p>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-navy">{(m.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-slate-dark">{(m.precision * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono font-bold text-teal">{(m.recall * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono font-bold text-navy">{(m.f1 * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-slate-dark">{(m.roc_auc * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono text-slate">{(m.cv_f1 * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate">
                    {m.badge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

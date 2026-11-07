'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  HelpCircle, 
  ArrowUpDown, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  Info,
  Scale,
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ErrorBar
} from 'recharts';
import interpData from '@/lib/data/interpretability_analysis.json';
import { FEATURES } from '@/lib/constants';

type MetricKey = 'f1' | 'recall' | 'roc_auc';

export default function InterpretabilityPage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('f1');

  const { methodology, metrics } = interpData;
  const currentRankings = (metrics as any)[selectedMetric] || [];

  // Format data for bar chart
  const chartData = currentRankings.map((r: any) => ({
    name: r.feature_name.replace('Uniformity of ', 'Unif. ').replace('Single Epithelial ', 'Epi. '),
    fullName: r.feature_name,
    'Mean Drop': r.mean_drop,
    error: r.std_error
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Model-Agnostic Permutation Sensitivity</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">ANN Feature Interpretability</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          Which cytological features contribute most to the predictive decisions of the trained Artificial Neural Network (MLP)? Evaluated exclusively on the 139 held-out test samples over 50 repeated shuffles per feature.
        </p>
      </div>

      {/* Methodological Context Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-light/40 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
          <Info className="w-4 h-4 text-teal" /> Permutation Importance Protocol
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate">
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Held-Out Test Cohort Only (N = 139)</p>
            <p className="leading-relaxed">
              Evaluating feature importance on training data overestimates the impact of memorized features. Here, importance is computed strictly on the untouched hold-out test set.
            </p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Repeated Shuffles (B = 50 Repeats)</p>
            <p className="leading-relaxed">
              Each feature column is shuffled 50 times independently. The performance degradation (&Delta;Metric) is recorded, yielding empirical standard error (&plusmn;SE) and 95% confidence intervals.
            </p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Non-Causal Interpretation</p>
            <p className="leading-relaxed">
              A large drop indicates that the neural network heavily relies on that feature&apos;s weights to maintain classification accuracy. It does not prove that the feature causes tumor malignancy.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Metric Drop Selector & Bar Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Mean Performance Degradation (&Delta;Metric)</h2>
            <p className="text-xs text-slate">Higher bar = greater performance loss when that feature is randomly permuted</p>
          </div>

          <div className="flex items-center space-x-1 border border-slate-light/40 rounded-lg p-0.5 bg-canvas">
            <button
              onClick={() => setSelectedMetric('f1')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedMetric === 'f1' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              &Delta; F1-Score
            </button>
            <button
              onClick={() => setSelectedMetric('recall')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedMetric === 'recall' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              &Delta; Recall (Sensitivity)
            </button>
            <button
              onClick={() => setSelectedMetric('roc_auc')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedMetric === 'roc_auc' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              &Delta; ROC-AUC
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} label={{ value: `Drop in ${selectedMetric.toUpperCase()}`, angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip formatter={(val: any) => [val, `Mean ${selectedMetric.toUpperCase()} Drop`]} />
              <Bar dataKey="Mean Drop" fill="#176B67" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Importance Table with Standard Error & Uncertainty */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
          <div className="border-b border-slate-light/30 pb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-navy">Permutation Importance Table ({selectedMetric.toUpperCase()})</h3>
            <span className="text-xs font-mono text-slate">B = 50 Repeats</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-4">Cytological Feature</th>
                  <th className="py-2.5 px-3 text-right">Mean Drop</th>
                  <th className="py-2.5 px-3 text-right">Std Error (&plusmn;SE)</th>
                  <th className="py-2.5 px-4 text-right">95% Confidence Interval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-light/20">
                {currentRankings.map((r: any, idx: number) => (
                  <tr key={r.feature} className="hover:bg-canvas/50">
                    <td className="py-2.5 px-3 font-mono text-slate font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-navy">{r.feature_name}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal text-right">
                      {r.mean_drop.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate text-right">
                      &plusmn;{r.std_error.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-navy text-right font-semibold">
                      [{r.ci_lower.toFixed(4)}, {r.ci_upper.toFixed(4)}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Clump Thickness Leads & Multicollinearity Nuance */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-navy border-b border-slate-light/30 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Multicollinearity Caveat
          </h3>

          <div className="space-y-4 text-xs text-slate leading-relaxed">
            <div className="p-3.5 rounded-lg bg-mint-light/40 border border-teal/20 space-y-1.5">
              <p className="font-bold text-teal-dark text-xs">Why Clump Thickness Leads the Permutation Drop</p>
              <p>
                In Module Two, <em>Uniformity of Cell Size</em> had the highest bivariate statistical separation (r&#x2082; = 0.9475). Yet in this ANN permutation test, <strong>Clump Thickness</strong> causes the largest performance drop (&Delta;F1 = 0.0416, &Delta;Recall = 0.0608).
              </p>
              <p className="text-[11px] text-slate-dark pt-1">
                Reason: <em>Cell Size</em> and <em>Cell Shape</em> correlate at r = 0.91. When Cell Size is permuted, the network still extracts cellular pleomorphism from Cell Shape. In contrast, <em>Clump Thickness</em> captures unique architectural layering that cannot be compensated by other features.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
              <p className="font-bold text-navy text-xs">Mutual Information Dilution</p>
              <p>
                Permutation importance measures how much performance degrades when one feature is removed in isolation. Collinear feature sets dilute each other&apos;s individual scores, meaning low individual permutation importance does not imply that cell size/shape are unimportant to the network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

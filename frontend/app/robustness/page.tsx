'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ErrorBar, Cell, ReferenceLine, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import robustnessData from '../../lib/data/robustness_analysis.json';

const METRICS = ['accuracy', 'recall', 'precision', 'f1'] as const;
type Metric = typeof METRICS[number];

const METRIC_LABELS: Record<Metric, string> = {
  accuracy: 'Accuracy',
  recall: 'Recall',
  precision: 'Precision',
  f1: 'F1-Score',
};

const METRIC_COLORS: Record<Metric, string> = {
  accuracy: '#0F4C75',
  recall: '#1B9AAA',
  precision: '#06D6A0',
  f1: '#118AB2',
};

const FLAG_COLORS: Record<string, string> = {
  stable: '#06D6A0',
  variable: '#EF476F',
};

export default function RobustnessPage() {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('accuracy');

  const meta = robustnessData.meta;
  const cv = robustnessData.cv_summary;
  const boot = robustnessData.bootstrap_cis;
  const point = robustnessData.point_estimates;
  const flags = robustnessData.stability_flags as Record<Metric, string>;
  const folds = robustnessData.fold_breakdown as any[];
  const foldMetrics = robustnessData.cv_fold_metrics as Record<Metric, number[]>;

  // Fold bar chart data
  const foldBarData = useMemo(() => {
    return folds.map((f: any) => ({
      label: f.label,
      value: f[selectedMetric] as number,
      repeat: f.repeat,
    }));
  }, [selectedMetric, folds]);

  // CV summary comparison (grouped bar)
  const cvComparisonData = useMemo(() => {
    return METRICS.map(m => ({
      metric: METRIC_LABELS[m],
      mean: parseFloat(((cv as any)[m].mean * 100).toFixed(2)),
      min: parseFloat(((cv as any)[m].min * 100).toFixed(2)),
      max: parseFloat(((cv as any)[m].max * 100).toFixed(2)),
      std: parseFloat(((cv as any)[m].std * 100).toFixed(2)),
    }));
  }, [cv]);

  // Bootstrap CI data
  const bootstrapData = useMemo(() => {
    return METRICS.map(m => {
      const b = (boot as any)[m];
      return {
        metric: METRIC_LABELS[m],
        mean: parseFloat((b.mean * 100).toFixed(2)),
        lower: parseFloat((b.lower * 100).toFixed(2)),
        upper: parseFloat((b.upper * 100).toFixed(2)),
        ci_width: parseFloat(((b.upper - b.lower) * 100).toFixed(2)),
        point_est: parseFloat(((point as any)[m] * 100).toFixed(2)),
      };
    });
  }, [boot, point]);

  // Per-repeat aggregation
  const repeatData = useMemo(() => {
    const repeats: Record<number, number[]> = {};
    folds.forEach((f: any) => {
      if (!repeats[f.repeat]) repeats[f.repeat] = [];
      repeats[f.repeat].push(f[selectedMetric] as number);
    });
    return Object.entries(repeats).map(([r, vals]) => {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / (vals.length - 1));
      return {
        repeat: `Repeat ${r}`,
        mean: parseFloat((mean * 100).toFixed(2)),
        std: parseFloat((std * 100).toFixed(2)),
        min: parseFloat((Math.min(...vals) * 100).toFixed(2)),
        max: parseFloat((Math.max(...vals) * 100).toFixed(2)),
      };
    });
  }, [selectedMetric, folds]);

  // Distribution histogram
  const histData = useMemo(() => {
    const values = foldMetrics[selectedMetric].map(v => v * 100);
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    const binWidth = 1.0;
    const bins: { range: string; count: number; mid: number }[] = [];
    for (let start = min; start < max + binWidth; start += binWidth) {
      const end = start + binWidth;
      const count = values.filter(v => v >= start && v < end).length;
      bins.push({
        range: `${start.toFixed(0)}-${end.toFixed(0)}`,
        count,
        mid: (start + end) / 2,
      });
    }
    return bins.filter(b => b.count > 0);
  }, [selectedMetric, foldMetrics]);

  const selCv = (cv as any)[selectedMetric];
  const selBoot = (boot as any)[selectedMetric];
  const selFlag = flags[selectedMetric];

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-navy text-white py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono tracking-widest text-teal-light/70 uppercase mb-2">Module 7</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Model Robustness &amp; Uncertainty</h1>
          <p className="text-sm text-slate-light/80 mt-2 max-w-3xl leading-relaxed">
            How stable is the ANN across resampled training sets? This module applies 25-fold repeated
            stratified cross-validation (5 repeats &times; 5 folds) and 1,000-iteration bootstrap
            confidence intervals to quantify the uncertainty around reported performance metrics.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ── Research Question ── */}
        <div className="p-4 bg-canvas rounded-lg border border-slate-light/30">
          <p className="text-xs font-mono text-teal-dark tracking-wide uppercase mb-1">Research Question</p>
          <p className="text-sm text-navy font-medium">
            Are the reported ANN metrics stable under repeated resampling, or do they depend on a
            lucky train/test partition?
          </p>
        </div>

        {/* ── Metric Selector ── */}
        <div className="flex flex-wrap gap-2">
          {METRICS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                selectedMetric === m
                  ? 'bg-navy text-white border-navy shadow-sm'
                  : 'bg-white text-navy border-slate-light/40 hover:border-navy/30'
              }`}
            >
              {METRIC_LABELS[m]}
              <span
                className="ml-2 inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: FLAG_COLORS[flags[m]] }}
              />
            </button>
          ))}
          <div className="flex items-center gap-3 ml-auto text-[10px] text-slate">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor:'#06D6A0'}} /> Stable (CV% &lt; 2.5)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor:'#EF476F'}} /> Variable (CV% &ge; 2.5)</span>
          </div>
        </div>

        {/* ── Summary Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'CV Mean', value: `${(selCv.mean * 100).toFixed(2)}%` },
            { label: 'CV Std', value: `${(selCv.std * 100).toFixed(2)}%` },
            { label: 'CV%', value: `${selCv.cv_pct.toFixed(2)}%` },
            { label: 'Min Fold', value: `${(selCv.min * 100).toFixed(2)}%` },
            { label: 'Max Fold', value: `${(selCv.max * 100).toFixed(2)}%` },
            { label: 'Boot 95% CI', value: `[${(selBoot.lower * 100).toFixed(1)}, ${(selBoot.upper * 100).toFixed(1)}]%` },
            { label: 'Stability', value: selFlag.charAt(0).toUpperCase() + selFlag.slice(1) },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg bg-canvas border border-slate-light/20 text-center">
              <p className="text-[10px] text-slate uppercase tracking-wider">{s.label}</p>
              <p className={`text-sm font-bold mt-1 ${s.label === 'Stability' ? (selFlag === 'stable' ? 'text-teal' : 'text-red-500') : 'text-navy'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Chart Row 1: Fold Performance + Distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fold Bar Chart */}
          <div className="lg:col-span-2 bg-canvas rounded-lg border border-slate-light/20 p-4">
            <h3 className="text-xs font-bold text-navy mb-1">Per-Fold {METRIC_LABELS[selectedMetric]}</h3>
            <p className="text-[10px] text-slate mb-3">25 folds (5 repeats &times; 5 folds). Bar color encodes repeat group.</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={foldBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF1" />
                <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={0} angle={-45} textAnchor="end" height={40} />
                <YAxis domain={['auto', 'auto']} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(2)}%`} labelStyle={{ fontSize: 11 }} />
                <ReferenceLine y={selCv.mean} stroke="#EF476F" strokeDasharray="4 4" label={{ value: 'Mean', position: 'right', fontSize: 9, fill: '#EF476F' }} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {foldBarData.map((entry, i) => {
                    const repeatColors = ['#0F4C75', '#1B9AAA', '#06D6A0', '#118AB2', '#073B4C'];
                    return <Cell key={i} fill={repeatColors[(entry.repeat - 1) % 5]} opacity={0.8} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Histogram */}
          <div className="bg-canvas rounded-lg border border-slate-light/20 p-4">
            <h3 className="text-xs font-bold text-navy mb-1">Fold Score Distribution</h3>
            <p className="text-[10px] text-slate mb-3">Histogram of {METRIC_LABELS[selectedMetric]} across 25 folds.</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={histData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF1" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} label={{ value: `${METRIC_LABELS[selectedMetric]} %`, position: 'insideBottom', offset: -2, fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: 'Folds', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="count" fill={METRIC_COLORS[selectedMetric]} radius={[2, 2, 0, 0]} opacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Chart Row 2: Per-Repeat Summary ── */}
        <div className="bg-canvas rounded-lg border border-slate-light/20 p-4">
          <h3 className="text-xs font-bold text-navy mb-1">Per-Repeat {METRIC_LABELS[selectedMetric]} (Mean &plusmn; Std)</h3>
          <p className="text-[10px] text-slate mb-3">Each repeat contains 5 folds. Consistent repeat means indicate low partition dependence.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-light/30 text-left text-[10px] text-slate uppercase tracking-wider">
                  <th className="py-2 px-3">Repeat</th>
                  <th className="py-2 px-3 text-right">Mean</th>
                  <th className="py-2 px-3 text-right">Std</th>
                  <th className="py-2 px-3 text-right">Min</th>
                  <th className="py-2 px-3 text-right">Max</th>
                  <th className="py-2 px-3 text-right">Range</th>
                </tr>
              </thead>
              <tbody>
                {repeatData.map(r => (
                  <tr key={r.repeat} className="border-b border-slate-light/10 hover:bg-white/50">
                    <td className="py-2 px-3 font-medium text-navy">{r.repeat}</td>
                    <td className="py-2 px-3 text-right font-mono">{r.mean.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{r.std.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{r.min.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{r.max.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{(r.max - r.min).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Bootstrap CIs ── */}
        <div className="bg-canvas rounded-lg border border-slate-light/20 p-4">
          <h3 className="text-xs font-bold text-navy mb-1">Bootstrap 95% Confidence Intervals ({meta.n_bootstrap.toLocaleString()} iterations)</h3>
          <p className="text-[10px] text-slate mb-3">
            Resampling with replacement from the {meta.test_size}-sample test set. Point estimate shown as diamond.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={bootstrapData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF1" horizontal={false} />
              <XAxis type="number" domain={[88, 102]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="metric" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Bar dataKey="lower" stackId="ci" fill="transparent" />
              <Bar dataKey="ci_width" stackId="ci" fill="#1B9AAA" opacity={0.35} radius={[2, 2, 2, 2]} />
              {bootstrapData.map((entry, i) => (
                <ReferenceLine
                  key={i}
                  x={entry.point_est}
                  stroke="#0F4C75"
                  strokeWidth={0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-light/30 text-left text-[10px] text-slate uppercase tracking-wider">
                  <th className="py-2 px-3">Metric</th>
                  <th className="py-2 px-3 text-right">Point Est.</th>
                  <th className="py-2 px-3 text-right">Boot Mean</th>
                  <th className="py-2 px-3 text-right">95% CI Lower</th>
                  <th className="py-2 px-3 text-right">95% CI Upper</th>
                  <th className="py-2 px-3 text-right">CI Width</th>
                </tr>
              </thead>
              <tbody>
                {bootstrapData.map(b => (
                  <tr key={b.metric} className="border-b border-slate-light/10 hover:bg-white/50">
                    <td className="py-2 px-3 font-medium text-navy">{b.metric}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{b.point_est.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{b.mean.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{b.lower.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{b.upper.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{b.ci_width.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Cross-Validation Summary Comparison ── */}
        <div className="bg-canvas rounded-lg border border-slate-light/20 p-4">
          <h3 className="text-xs font-bold text-navy mb-1">Cross-Validation Summary: All Metrics</h3>
          <p className="text-[10px] text-slate mb-3">
            Mean performance across 25 folds with standard deviation error bars.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cvComparisonData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF1" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis domain={[88, 102]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Bar dataKey="mean" fill="#0F4C75" radius={[3, 3, 0, 0]} opacity={0.8}>
                <ErrorBar dataKey="std" width={8} strokeWidth={1.5} stroke="#EF476F" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Interpretation Panel ── */}
        <div className="space-y-4 text-xs text-slate leading-relaxed">
          <div className="p-3.5 rounded-lg bg-mint-light/40 border border-teal/20 space-y-1.5">
            <p className="font-bold text-teal-dark text-xs">Stability Verdict</p>
            <p>
              The ANN achieves a <strong>25-fold CV accuracy</strong> of {(cv.accuracy.mean * 100).toFixed(2)}% with
              a coefficient of variation of {cv.accuracy.cv_pct.toFixed(2)}%, indicating the model is
              {cv.accuracy.cv_pct < 2.5 ? ' highly stable' : ' moderately variable'} across resampled partitions.
              The worst single fold scored {(cv.accuracy.min * 100).toFixed(2)}% and the best {(cv.accuracy.max * 100).toFixed(2)}%.
            </p>
            <p className="text-[11px] text-slate-dark pt-1">
              <strong>Recall</strong> shows higher variability (CV% = {cv.recall.cv_pct.toFixed(2)}%) because the
              malignant class has fewer samples per fold (~{Math.round(meta.total_samples * 0.345 / 5)} per fold).
              A single misclassified malignant case in a 5-fold split can shift recall by ~2 percentage points.
              This is a known limitation of evaluating on small class-imbalanced partitions.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
            <p className="font-bold text-navy text-xs">Bootstrap vs. Cross-Validation</p>
            <p>
              The bootstrap 95% CI for F1 is [{(boot.f1.lower * 100).toFixed(1)}%, {(boot.f1.upper * 100).toFixed(1)}%],
              spanning {((boot.f1.upper - boot.f1.lower) * 100).toFixed(1)} percentage points.
              The bootstrap operates on a fixed {meta.test_size}-sample test set and measures
              <em> evaluation uncertainty</em> (sensitivity to which test samples are drawn).
              Cross-validation measures <em>training uncertainty</em> (sensitivity to training partition).
              Both must be narrow for reliable reported performance.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
            <p className="font-bold text-navy text-xs">Methodological Notes</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Repeated Stratified K-Fold preserves class proportions in every fold.</li>
              <li>Each repeat uses a different random partition (random_state varies across repeats).</li>
              <li>The full preprocessing pipeline (imputation + scaling + MLP) is re-fit inside each fold.</li>
              <li>Bootstrap resamples with replacement from the {meta.test_size}-sample held-out test set.</li>
              <li>The 95% CI uses the percentile method (2.5th and 97.5th percentiles of the bootstrap distribution).</li>
            </ul>
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="py-4 border-t border-slate-light/20">
          <p className="text-[10px] text-slate text-center">
            All results computed on the Breast Cancer Wisconsin (Original) dataset ({meta.total_samples} samples).
            These are reported research metrics, not clinically validated diagnostic performance.
          </p>
        </div>
      </div>
    </main>
  );
}
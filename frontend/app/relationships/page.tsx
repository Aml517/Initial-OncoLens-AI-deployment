'use client';

import React, { useState } from 'react';
import { 
  Network, 
  HelpCircle, 
  ArrowUpDown, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  Info,
  Scale
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import relData from '@/lib/data/relationships_analysis.json';
import { FEATURES } from '@/lib/constants';

export default function RelationshipsPage() {
  const [metricType, setMetricType] = useState<'spearman' | 'pearson'>('spearman');
  const [featureX, setFeatureX] = useState<string>('Uniformity_of_Cell_Size');
  const [featureY, setFeatureY] = useState<string>('Uniformity_of_Cell_Shape');

  const { features, pearson_matrix, spearman_matrix, pairwise_ranked, bivariate_samples } = relData;

  const currentMatrix = metricType === 'spearman' ? spearman_matrix : pearson_matrix;

  // Find pairwise correlation for active pair
  const activePair = pairwise_ranked.find(
    (p: any) => (p.feature_1 === featureX && p.feature_2 === featureY) || (p.feature_1 === featureY && p.feature_2 === featureX)
  ) || {
    spearman_rho: 1.0,
    pearson_r: 1.0,
    spearman_p: 0,
    pearson_p: 0
  };

  // Filter and format bivariate scatter data
  const benignPoints = bivariate_samples
    .filter((s: any) => s.diagnosis === 'Benign' && s[featureX] !== null && s[featureY] !== null)
    .map((s: any) => ({
      x: s[featureX],
      y: s[featureY],
      id: s.id,
      diagnosis: 'Benign'
    }));

  const malignantPoints = bivariate_samples
    .filter((s: any) => s.diagnosis === 'Malignant' && s[featureX] !== null && s[featureY] !== null)
    .map((s: any) => ({
      x: s[featureX],
      y: s[featureY],
      id: s.id,
      diagnosis: 'Malignant'
    }));

  const featureXDef = FEATURES.find(f => f.field === featureX);
  const featureYDef = FEATURES.find(f => f.field === featureY);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <Network className="w-3.5 h-3.5" />
          <span>Multivariate Correlation &amp; Collinearity</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Feature Relationships &amp; Multicollinearity</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          How do the nine cytological features interact? Quantified via non-parametric Spearman rank correlation (&rho;_s) for monotonic ordinal relationships and Pearson correlation (r), with bivariate distribution mapping.
        </p>
      </div>

      {/* Methodological Context Alert */}
      <div className="p-6 rounded-2xl bg-white border border-slate-light/40 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
          <Info className="w-4 h-4 text-teal" /> Analytical Primer: Spearman vs. Pearson
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate">
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Spearman Rank Correlation (&rho;_s) &mdash; Recommended</p>
            <p className="leading-relaxed">
              Cytological scores are discrete ordinal ratings (1 to 10). Spearman evaluates monotonic rank relationships without assuming normality or equal intervals between scores.
            </p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Correlation &ne; Causation &amp; Multicollinearity Warning</p>
            <p className="leading-relaxed">
              Strong positive correlation between features (e.g., Cell Size &amp; Cell Shape &rho;_s = 0.89) reflects mutual manifestation of cellular dysmorphology, not causal inter-dependence.
            </p>
          </div>
        </div>
      </div>

      {/* Correlation Matrix Heatmap */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy">9&times;9 Correlation Matrix</h2>
            <p className="text-xs text-slate">Select correlation method to update matrix coefficients</p>
          </div>

          <div className="flex items-center space-x-1 border border-slate-light/40 rounded-lg p-0.5 bg-canvas">
            <button
              onClick={() => setMetricType('spearman')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                metricType === 'spearman' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              Spearman Rank (&rho;_s)
            </button>
            <button
              onClick={() => setMetricType('pearson')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                metricType === 'pearson' ? 'bg-white text-navy shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              Pearson (r)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-canvas">
                <th className="p-2.5 text-left font-bold text-navy border border-slate-light/30">Feature</th>
                {FEATURES.map(f => (
                  <th key={f.id} className="p-2 font-mono text-[10px] text-slate border border-slate-light/30 max-w-[75px] truncate" title={f.name}>
                    {f.name.split(' ').map(w => w[0]).join('')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(rowF => (
                <tr key={rowF.id} className="hover:bg-canvas/50">
                  <td className="p-2.5 text-left font-semibold text-navy border border-slate-light/30 truncate max-w-[180px]">
                    {rowF.name}
                  </td>
                  {FEATURES.map(colF => {
                    const val = (currentMatrix as any)[rowF.field]?.[colF.field] ?? 0;
                    let bg = '#FFFFFF';
                    let textCol = '#101C2C';
                    if (val === 1.0) {
                      bg = '#DDF2EC';
                      textCol = '#11524F';
                    } else if (val >= 0.75) {
                      bg = '#BFE4D9';
                      textCol = '#11524F';
                    } else if (val >= 0.5) {
                      bg = '#EDFAF6';
                    }

                    return (
                      <td 
                        key={colF.id} 
                        style={{ backgroundColor: bg, color: textCol }}
                        className="p-2 font-mono text-[11px] border border-slate-light/30 font-semibold"
                        title={`${rowF.name} vs ${colF.name}: ${metricType} = ${val}`}
                      >
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bivariate Pairwise Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scatter Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
          <div className="border-b border-slate-light/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-teal font-bold tracking-wider">Pairwise Explorer</span>
              <h3 className="text-base font-bold text-navy">Bivariate Cytological Scatter</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-teal font-bold">&rho;_s = {activePair.spearman_rho.toFixed(4)}</span>
              <span className="text-slate">|</span>
              <span className="text-slate-dark">r = {activePair.pearson_r.toFixed(4)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <label htmlFor="feature-x" className="font-semibold text-slate">X-Axis:</label>
              <select
                id="feature-x"
                value={featureX}
                onChange={(e) => setFeatureX(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-light/60 bg-canvas text-navy font-semibold focus:outline-none"
              >
                {FEATURES.map(f => (
                  <option key={f.field} value={f.field}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="feature-y" className="font-semibold text-slate">Y-Axis:</label>
              <select
                id="feature-y"
                value={featureY}
                onChange={(e) => setFeatureY(e.target.value)}
                className="px-2.5 py-1 rounded border border-slate-light/60 bg-canvas text-navy font-semibold focus:outline-none"
              >
                {FEATURES.map(f => (
                  <option key={f.field} value={f.field}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="x" type="number" domain={[0, 10.5]} tick={{ fontSize: 10 }} label={{ value: featureXDef?.name, position: 'insideBottom', offset: -2, fontSize: 10 }} />
                <YAxis dataKey="y" type="number" domain={[0, 10.5]} tick={{ fontSize: 10 }} label={{ value: featureYDef?.name, angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Scatter name="Benign (n=453)" data={benignPoints} fill="#176B67" opacity={0.6} />
                <Scatter name="Malignant (n=238)" data={malignantPoints} fill="#D6336C" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highest Multicollinear Pairs Table */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-navy border-b border-slate-light/30 pb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal" /> Top Multicollinear Pairs
          </h3>

          <p className="text-xs text-slate leading-relaxed">
            Pairs exhibiting strong coupling (&rho;_s &gt; 0.70). These features convey shared morphological signals to the neural network:
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                  <th className="py-2 px-2.5">Feature Pair</th>
                  <th className="py-2 px-2 font-mono text-right">Spearman &rho;</th>
                  <th className="py-2 px-2 font-mono text-right">Pearson r</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-light/20">
                {pairwise_ranked.slice(0, 6).map((pair: any, idx: number) => (
                  <tr 
                    key={idx}
                    onClick={() => { setFeatureX(pair.feature_1); setFeatureY(pair.feature_2); }}
                    className="hover:bg-canvas/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2.5 font-semibold text-navy">
                      {pair.feature_1_name} &amp; {pair.feature_2_name}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-teal text-right">
                      {pair.spearman_rho.toFixed(3)}
                    </td>
                    <td className="py-2 px-2 font-mono text-slate text-right">
                      {pair.pearson_r.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 text-xs text-slate space-y-1">
            <p className="font-bold text-navy">Network Collinearity Implication</p>
            <p className="leading-relaxed">
              When features share strong correlation, permuting one feature during sensitivity tests causes the model to rely on its collinear counterpart, resulting in smaller individual feature importance drops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

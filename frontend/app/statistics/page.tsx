'use client';

import React, { useState } from 'react';
import { 
  BarChart2, 
  HelpCircle, 
  ArrowUpDown, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  ChevronDown,
  Info,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import statData from '@/lib/data/statistical_analysis.json';
import { FEATURES } from '@/lib/constants';

type SortKey = 'rank_biserial_r' | 'adjusted_p_value' | 'median_difference' | 'u_statistic';

export default function StatisticalAnalysisPage() {
  const [sortKey, setSortKey] = useState<SortKey>('rank_biserial_r');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('Uniformity_of_Cell_Size');

  const { methodology, features_ranked } = statData;

  // Sorting logic
  const sortedFeatures = [...features_ranked].sort((a: any, b: any) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === 'adjusted_p_value') {
      return sortAsc ? bVal - aVal : aVal - bVal;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const activeFeatureData = features_ranked.find((f: any) => f.feature === selectedFeature) || features_ranked[0];
  const activeFeatureDef = FEATURES.find(f => f.field === selectedFeature);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'adjusted_p_value');
    }
  };

  // Bar chart data for active feature
  const comparisonData = [
    {
      Cohort: 'Benign (n=453)',
      Median: activeFeatureData.median_benign,
      'Q1 (25th)': activeFeatureData.iqr_benign[0],
      'Q3 (75th)': activeFeatureData.iqr_benign[1],
      Mean: activeFeatureData.mean_benign
    },
    {
      Cohort: 'Malignant (n=238)',
      Median: activeFeatureData.median_malignant,
      'Q1 (25th)': activeFeatureData.iqr_malignant[0],
      'Q3 (75th)': activeFeatureData.iqr_malignant[1],
      Mean: activeFeatureData.mean_malignant
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <Scale className="w-3.5 h-3.5" />
          <span>Non-Parametric Hypothesis Testing Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Statistical Feature Analysis</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          Which cytological features demonstrate the strongest statistical separation between benign and malignant aspirates? Evaluated via two-sided Mann&ndash;Whitney U tests with rank-biserial effect sizes and Benjamini&ndash;Hochberg False Discovery Rate (FDR) control.
        </p>
      </div>

      {/* Methodological Context & Null Hypothesis Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-light/40 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
          <Info className="w-4 h-4 text-teal" /> Statistical Testing Framework
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate">
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Null Hypothesis (H₀)</p>
            <p className="leading-relaxed">
              The distribution of cytological scores in the malignant cohort is stochastically identical to that of the benign cohort: 
              <span className="font-mono block mt-1 text-[11px] text-slate-dark">P(X_mal &gt; X_ben) = P(X_ben &gt; X_mal)</span>
            </p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Effect Size: Rank-Biserial Correlation (r_rb)</p>
            <p className="leading-relaxed">
              A non-parametric effect size bounded on [-1, 1]. r_rb = +1 indicates complete stochastic dominance of malignant over benign; 0 denotes equal distribution.
            </p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-lg bg-canvas border border-slate-light/30">
            <p className="font-bold text-navy">Multiple-Testing Correction (FDR)</p>
            <p className="leading-relaxed">
              To prevent false discovery inflation across all 9 hypothesis tests, adjusted q-values are computed using the Benjamini&ndash;Hochberg step-up procedure (Q = 0.05).
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Ranking Table */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Non-Parametric Feature Separation Ranking</h2>
            <p className="text-xs text-slate">Click column headers to sort by effect size (r_rb), adjusted p-value (q), or median difference</p>
          </div>
          <div className="text-xs font-mono text-slate">
            Cohort: n_benign={methodology.sample_sizes.benign_total}, n_malignant={methodology.sample_sizes.malignant_total}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-4">Cytological Feature</th>
                <th 
                  onClick={() => handleSort('rank_biserial_r')}
                  className="py-3 px-3 cursor-pointer hover:text-navy hover:bg-slate-light/20 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Rank-Biserial (r_rb)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('median_difference')}
                  className="py-3 px-3 cursor-pointer hover:text-navy hover:bg-slate-light/20 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Median Diff (95% CI)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Benign (Med / IQR)</th>
                <th className="py-3 px-3">Malignant (Med / IQR)</th>
                <th 
                  onClick={() => handleSort('u_statistic')}
                  className="py-3 px-3 cursor-pointer hover:text-navy hover:bg-slate-light/20 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Mann-Whitney U</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('adjusted_p_value')}
                  className="py-3 px-3 cursor-pointer hover:text-navy hover:bg-slate-light/20 transition-colors text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>FDR Adjusted q</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-light/20">
              {sortedFeatures.map((f: any, idx: number) => {
                const isSelected = f.feature === selectedFeature;
                return (
                  <tr 
                    key={f.feature} 
                    onClick={() => setSelectedFeature(f.feature)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-mint-light/40 border-l-4 border-teal' : 'hover:bg-canvas/60'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-slate font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-navy">
                      <div className="flex items-center space-x-1.5">
                        <span>{f.feature_name}</span>
                        {f.feature === 'Bare_Nuclei' && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800" title="16 missing values excluded from pair ranking">
                            n=675
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-teal text-sm">
                      {f.rank_biserial_r.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 font-mono text-navy font-semibold">
                      +{f.median_difference.toFixed(1)} <span className="text-slate text-[10px] font-normal">[{f.ci_95_median_diff[0]}-{f.ci_95_median_diff[1]}]</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate">
                      {f.median_benign} <span className="text-[10px]">[{f.iqr_benign[0]}-{f.iqr_benign[1]}]</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-rose font-semibold">
                      {f.median_malignant} <span className="text-[10px]">[{f.iqr_malignant[0]}-{f.iqr_malignant[1]}]</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-dark">
                      {f.u_statistic.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-right text-navy">
                      {f.q_val_display}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Feature Deep Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
          <div className="border-b border-slate-light/30 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-teal font-bold">Selected Feature Profile</span>
              <h3 className="text-xl font-extrabold text-navy">{activeFeatureData.feature_name}</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-canvas border border-slate-light/40 text-navy">
              Rank-Biserial r_rb = {activeFeatureData.rank_biserial_r.toFixed(4)}
            </span>
          </div>

          {activeFeatureDef && (
            <p className="text-xs text-slate leading-relaxed">
              {activeFeatureDef.description} <strong className="text-teal-dark">{activeFeatureDef.cytologyContext}</strong>
            </p>
          )}

          {/* Quartiles & Means Visualization */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="Cohort" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: 'Score (1-10)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Median" fill="#176B67" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Q1 (25th)" fill="#687586" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Q3 (75th)" fill="#D6336C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center p-3 rounded-xl bg-canvas border border-slate-light/30">
            <div>
              <span className="text-slate block text-[10px]">Benign Median</span>
              <span className="text-base font-bold text-navy">{activeFeatureData.median_benign}</span>
            </div>
            <div>
              <span className="text-slate block text-[10px]">Malignant Median</span>
              <span className="text-base font-bold text-rose">{activeFeatureData.median_malignant}</span>
            </div>
            <div>
              <span className="text-slate block text-[10px]">Median Shift</span>
              <span className="text-base font-bold text-teal">+{activeFeatureData.median_difference}</span>
            </div>
            <div>
              <span className="text-slate block text-[10px]">Adjusted q</span>
              <span className="text-xs font-bold text-navy block mt-1">{activeFeatureData.q_val_display}</span>
            </div>
          </div>
        </div>

        {/* Biostatistical Principles & Limitations Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-navy border-b border-slate-light/30 pb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Biostatistical Caveats
          </h3>

          <div className="space-y-4 text-xs text-slate leading-relaxed">
            <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
              <p className="font-bold text-navy text-xs">Statistical Significance &ne; Biological Causation</p>
              <p>
                Extremely small p-values (p &lt; 10&minus;40) arise because the sample size is moderate (N=691) and the morphological score distributions between benign and malignant groups have substantial separation. A high rank-biserial correlation does not prove that a feature causes neoplasia; it reflects pathologist diagnostic association.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
              <p className="font-bold text-navy text-xs">Multicollinearity &amp; Ranking Caveat</p>
              <p>
                Features ranked 1 and 2 (<em>Uniformity of Cell Size</em> and <em>Uniformity of Cell Shape</em>) share a Pearson correlation of r = 0.91. Because they capture nearly identical underlying cellular dysmorphology, differences between their effect sizes (0.9475 vs 0.9460) are negligible and should not be interpreted as biological hierarchy.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
              <p className="font-bold text-navy text-xs">The Mitoses Outlier (r_rb = 0.4214)</p>
              <p>
                <em>Mitoses</em> is the lowest-ranked feature because the vast majority of both benign and malignant samples receive a score of 1 (median difference 0.0). However, when mitotic figures are observed (scores 3 to 10), they almost exclusively belong to high-grade malignant lesions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

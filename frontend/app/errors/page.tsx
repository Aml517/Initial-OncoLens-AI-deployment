'use client';

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  HelpCircle, 
  Search, 
  Filter, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  Info,
  Microscope,
  FileSearch
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
import evalData from '@/lib/data/evaluation_analysis.json';
import { FEATURES } from '@/lib/constants';

export default function ErrorAnalysisPage() {
  const { error_analysis: errorAnalysis } = evalData;
  const { category_counts, feature_means_by_category, error_cases } = errorAnalysis;

  const [selectedCaseId, setSelectedCaseId] = useState<number>(error_cases[0]?.sample_id || 1041801);

  const activeCase = error_cases.find(c => c.sample_id === selectedCaseId) || error_cases[0];

  // Compare active error case features to the mean of True Benign (TN) and True Malignant (TP)
  const tnMeans = feature_means_by_category['True Negative'] || {};
  const tpMeans = feature_means_by_category['True Positive'] || {};

  const comparisonData = FEATURES.map(f => ({
    feature: f.name.replace('Uniformity of ', 'Unif. ').replace('Single Epithelial ', 'Epi. '),
    fullName: f.name,
    'Case Score': activeCase ? (activeCase.features as any)[f.field] : 0,
    'Benign Baseline Mean': (tnMeans as any)[f.field] || 0,
    'Malignant Baseline Mean': (tpMeans as any)[f.field] || 0
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-rose-light text-rose text-xs font-mono font-semibold">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Failure Mode &amp; Boundary Autopsy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Diagnostic Error Analysis</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          What kinds of cytological observations cause the Artificial Neural Network to fail? Detailed autopsy of the 4 misclassified test cases (2 False Positives, 2 False Negatives) out of 139 hold-out samples.
        </p>
      </div>

      {/* Cohort Classification Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-teal/30 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-teal-dark font-bold">True Negatives (TN)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-teal">{category_counts['True Negative']}</span>
            <span className="text-xs text-slate font-mono">(64.0% of test)</span>
          </div>
          <p className="text-[10px] text-slate">Benign correctly identified</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-mint-dark/40 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-teal-dark font-bold">True Positives (TP)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-teal">{category_counts['True Positive']}</span>
            <span className="text-xs text-slate font-mono">(33.1% of test)</span>
          </div>
          <p className="text-[10px] text-slate">Malignant correctly caught</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-amber-800 font-bold">False Positives (FP)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-700">{category_counts['False Positive']}</span>
            <span className="text-xs text-amber-800 font-mono">(1.4% of test)</span>
          </div>
          <p className="text-[10px] text-slate">Benign mislabeled malignant (False Alarm)</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-light border border-rose/30 shadow-sm space-y-1">
          <p className="text-[10px] font-mono uppercase text-rose font-bold">False Negatives (FN)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-rose">{category_counts['False Negative']}</span>
            <span className="text-xs text-rose font-mono">(1.4% of test)</span>
          </div>
          <p className="text-[10px] text-slate">Malignant missed (Critical Failure)</p>
        </div>
      </div>

      {/* Case-Level Autopsy Table */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy">The 4 Misclassified Hold-Out Cases</h2>
            <p className="text-xs text-slate">Click any row below to inspect its exact 9-dimensional cytological profile against baseline class means</p>
          </div>
          <span className="text-xs font-mono text-slate">Hold-Out Test Error Rate: 2.88% (4 / 139)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                <th className="py-2.5 px-3">Dataset ID</th>
                <th className="py-2.5 px-3">Error Classification</th>
                <th className="py-2.5 px-3">True Histology</th>
                <th className="py-2.5 px-3">Model Predicted</th>
                <th className="py-2.5 px-3 font-mono">P(Malignant)</th>
                <th className="py-2.5 px-4 text-right">Failure Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-light/20">
              {error_cases.map((ec) => {
                const isSelected = ec.sample_id === selectedCaseId;
                const isFN = ec.error_category === 'False Negative';
                return (
                  <tr 
                    key={ec.sample_id}
                    onClick={() => setSelectedCaseId(ec.sample_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-mint-light/40 border-l-4 border-teal' 
                        : 'hover:bg-canvas/60'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-navy">{ec.sample_id}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFN ? 'bg-rose-light text-rose' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ec.error_category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-navy">{ec.true_label}</td>
                    <td className="py-3 px-3 text-slate">{ec.predicted_label}</td>
                    <td className="py-3 px-3 font-mono font-bold text-navy">
                      {(ec.probability_malignant * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate">
                      {isFN 
                        ? (ec.sample_id === 1226012 ? 'Severe cytological atypia absence' : 'Intermediate ambiguous score profile')
                        : (ec.sample_id === 1002945 ? 'Elevated bare nuclei mimicry (10)' : 'Atypical epithelial enlargement & nucleoli')
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Autopsy Profile Card */}
      {activeCase && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Feature Comparison Chart */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
            <div className="border-b border-slate-light/30 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-teal font-bold tracking-wider">
                  Case Autopsy: Dataset ID #{activeCase.sample_id}
                </span>
                <h3 className="text-xl font-extrabold text-navy">
                  {activeCase.error_category} (P = {(activeCase.probability_malignant * 100).toFixed(1)}%)
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                activeCase.error_category === 'False Negative' ? 'bg-rose-light text-rose' : 'bg-amber-100 text-amber-800'
              }`}>
                Ground Truth: {activeCase.true_label}
              </span>
            </div>

            <p className="text-xs text-slate leading-relaxed">
              Comparing case score against empirical means of True Benign (green) and True Malignant (red) test cases across all 9 cytological features:
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="feature" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                  <Bar dataKey="Case Score" fill="#101C2C" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Benign Baseline Mean" fill="#176B67" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Malignant Baseline Mean" fill="#D6336C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Qualitative Clinical/Statistical Explanation */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-navy border-b border-slate-light/30 pb-3 flex items-center gap-2">
              <Microscope className="w-4 h-4 text-teal" /> Cytological Mechanism
            </h3>

            <div className="space-y-4 text-xs text-slate leading-relaxed">
              {activeCase.sample_id === 1226012 && (
                <div className="p-3.5 rounded-lg bg-rose-light/50 border border-rose/20 space-y-2">
                  <p className="font-bold text-rose-dark text-xs">False Negative (ID #1226012, P = 3.7%)</p>
                  <p>
                    <strong>Extreme False Reassurance:</strong> This malignant case exhibits almost perfectly benign cytology: Cell Size = 1, Cell Shape = 1, Epithelial Size = 1, Chromatin = 2, Nucleoli = 1, and Mitoses = 1. Only Clump Thickness (4) and Bare Nuclei (5) are mildly elevated.
                  </p>
                  <p className="italic text-[11px] text-slate-dark">
                    Pathological Insight: Tubular carcinoma or low-grade lobular carcinoma can present with monomorphic, small, regular cells that completely evade standard cytological suspicion.
                  </p>
                </div>
              )}

              {activeCase.sample_id === 1041801 && (
                <div className="p-3.5 rounded-lg bg-rose-light/50 border border-rose/20 space-y-2">
                  <p className="font-bold text-rose-dark text-xs">False Negative (ID #1041801, P = 30.6%)</p>
                  <p>
                    <strong>Intermediate Score Profile:</strong> Scored between 2 and 5 on all features (Clump: 5, Size: 3, Shape: 3, Adhesion: 3, Epithelial: 2, Bare Nuclei: 3, Chromatin: 4, Nucleoli: 4, Mitoses: 1).
                  </p>
                  <p className="italic text-[11px] text-slate-dark">
                    Pathological Insight: Lacks marked pleomorphism or high mitotic frequency; lies directly in the ambiguous transition region of the decision boundary.
                  </p>
                </div>
              )}

              {activeCase.sample_id === 1002945 && (
                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/60 space-y-2">
                  <p className="font-bold text-amber-900 text-xs">False Positive (ID #1002945, P = 87.7%)</p>
                  <p>
                    <strong>Severe Nuclear Abnormality Mimicry:</strong> Although biopsy confirmed a benign lesion, the pathologist scored Bare Nuclei = 10 and Single Epithelial Cell Size = 7 (both characteristic of high-grade carcinoma).
                  </p>
                  <p className="italic text-[11px] text-slate-dark">
                    Pathological Insight: Atypical ductal hyperplasia or active fibroadenoma with stripped myoepithelial nuclei can yield deceptive microscopy scores that force a high malignant probability.
                  </p>
                </div>
              )}

              {activeCase.sample_id === 846832 && (
                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/60 space-y-2">
                  <p className="font-bold text-amber-900 text-xs">False Positive (ID #846832, P = 67.9%)</p>
                  <p>
                    <strong>Nucleolar Hypertrophy:</strong> Benign specimen displaying elevated Single Epithelial Cell Size (7), Normal Nucleoli (6), and Cell Shape (5).
                  </p>
                  <p className="italic text-[11px] text-slate-dark">
                    Pathological Insight: Hyperplastic or inflammatory reparative changes can induce macronucleoli and cellular enlargement, mimicking malignancy.
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
                <p className="font-bold text-navy text-xs">Dataset Identity Privacy</p>
                <p>
                  The identifiers listed above (`1041801`, `1226012`, `1002945`, `846832`) are anonymized sample code numbers from the 1992 UCI repository, not active patient health records.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

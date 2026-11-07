'use client';

import React, { useState } from 'react';
import { 
  Database, 
  BarChart2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  Table as TableIcon,
  Layers,
  ArrowUpDown
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import datasetAnalysisData from '@/lib/data/dataset_analysis.json';
import { FEATURES } from '@/lib/constants';

const PIE_COLORS = ['#176B67', '#D6336C'];

export default function DatasetExplorerPage() {
  const [selectedFeature, setSelectedFeature] = useState<string>('Clump_Thickness');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'All' | 'Benign' | 'Malignant'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Real data from dataset_analysis.json
  const totalRaw = datasetAnalysisData.total_instances; // 699
  const totalClean = datasetAnalysisData.deduplicated_instances; // 691
  const benignCount = datasetAnalysisData.class_distribution.Benign; // 453 (cleaned) or 458 (raw)
  const malignantCount = datasetAnalysisData.class_distribution.Malignant; // 238 (cleaned) or 241 (raw)
  
  const pieData = [
    { name: 'Benign (2)', value: 458, percent: '65.5%' },
    { name: 'Malignant (4)', value: 241, percent: '34.5%' },
  ];

  // Distribution data for selected feature
  const histData = (datasetAnalysisData.histogram_data as any)[selectedFeature] || [];

  // Boxplot/Comparative means
  const boxplotData = (datasetAnalysisData.boxplot_data as any)[selectedFeature] || {
    Benign: { mean: 0, median: 0, min: 1, max: 10 },
    Malignant: { mean: 0, median: 0, min: 1, max: 10 }
  };

  const comparisonBarData = [
    {
      group: 'Benign Cells',
      Median: boxplotData.Benign.median,
      Mean: boxplotData.Benign.mean,
      Q1: boxplotData.Benign.q1,
      Q3: boxplotData.Benign.q3
    },
    {
      group: 'Malignant Cells',
      Median: boxplotData.Malignant.median,
      Mean: boxplotData.Malignant.mean,
      Q1: boxplotData.Malignant.q1,
      Q3: boxplotData.Malignant.q3
    }
  ];

  // Correlation matrix
  const corrMatrix = datasetAnalysisData.correlation_matrix as Record<string, Record<string, number>>;

  // Filter sample records
  const allRecords = datasetAnalysisData.sample_records || [];
  const filteredRecords = allRecords.filter((row: any) => {
    const matchesSearch = row.id.toString().includes(searchQuery);
    const matchesClass = classFilter === 'All' ? true : row.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRows = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const activeFeatureDef = FEATURES.find(f => f.field === selectedFeature);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <Database className="w-3.5 h-3.5" />
          <span>FNA Biopsy Clinical Repository</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Dataset Explorer</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          Comprehensive exploration of the Breast Cancer Wisconsin (Original) cytological dataset. Investigate class balance, feature distributions, missingness patterns, and inter-feature correlations.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-2">
          <p className="text-xs uppercase font-mono text-slate">Total Records</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy">{totalRaw}</span>
            <span className="text-xs text-slate font-mono">({totalClean} unique)</span>
          </div>
          <p className="text-[11px] text-slate">8 exact duplicates dropped during preprocessing</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-2">
          <p className="text-xs uppercase font-mono text-slate">Benign Cases (Class 2)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-teal">458</span>
            <span className="text-xs font-bold text-teal font-mono">65.5%</span>
          </div>
          <p className="text-[11px] text-slate">Controlled growth, uniform cellular morphology</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-2">
          <p className="text-xs uppercase font-mono text-slate">Malignant Cases (Class 4)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose">241</span>
            <span className="text-xs font-bold text-rose font-mono">34.5%</span>
          </div>
          <p className="text-[11px] text-slate">Positive class for recall & sensitivity metrics</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-2">
          <p className="text-xs uppercase font-mono text-slate">Missing Values</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy">16</span>
            <span className="text-xs font-bold text-slate font-mono">2.29%</span>
          </div>
          <p className="text-[11px] text-slate">Isolated solely to Bare Nuclei (imputed via median)</p>
        </div>
      </div>

      {/* Feature Distributions & Comparative Boxplot Analysis */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Cytological Feature Distribution Analysis</h2>
            <p className="text-xs text-slate">Examine individual feature score frequencies (1-10) and compare benign vs. malignant populations</p>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="feature-select" className="text-xs font-semibold text-slate">Feature:</label>
            <select
              id="feature-select"
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-light/60 bg-canvas text-navy focus:outline-none focus:ring-1 focus:ring-teal"
            >
              {FEATURES.map(f => (
                <option key={f.field} value={f.field}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {activeFeatureDef && (
          <div className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 text-xs text-slate space-y-1">
            <span className="font-bold text-navy">{activeFeatureDef.name}: </span>
            <span>{activeFeatureDef.description} </span>
            <span className="text-teal-dark font-medium">{activeFeatureDef.cytologyContext}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          {/* Histogram Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Sample Frequency Histogram</h3>
              <span className="text-[11px] font-mono text-slate">Scores 1 to 10</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any) => [`${val} samples`, 'Count']}
                    labelFormatter={(bin) => `Score: ${bin}`}
                  />
                  <Bar dataKey="count" fill="#176B67" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate italic text-center">
              Most cytological scores exhibit pronounced right-skewness, clustering at score 1 with malignant samples extending into the 7-10 tail.
            </p>
          </div>

          {/* Comparative Scores Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy">Benign vs. Malignant Quartile Comparison</h3>
              <span className="text-[11px] font-mono text-slate">Median & Mean Scores</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Median" fill="#101C2C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Mean" fill="#218F8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono p-2 bg-canvas rounded border border-slate-light/30">
              <div>
                <span className="text-teal font-bold">Benign:</span> Median {boxplotData.Benign.median} | Mean {boxplotData.Benign.mean}
              </div>
              <div>
                <span className="text-rose font-bold">Malignant:</span> Median {boxplotData.Malignant.median} | Mean {boxplotData.Malignant.mean}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix & Multicollinearity Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="border-b border-slate-light/30 pb-4">
          <h2 className="text-lg font-bold text-navy">Feature Correlation Heatmap</h2>
          <p className="text-xs text-slate">Pearson correlation coefficients among the 9 predictive features. Notice strong redundancy between Uniformity of Cell Size and Uniformity of Cell Shape (r = 0.91).</p>
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
                    const r = corrMatrix[rowF.field]?.[colF.field] ?? 0;
                    // Color scale based on magnitude
                    let bg = '#FFFFFF';
                    let textCol = '#101C2C';
                    if (r === 1.0) {
                      bg = '#DDF2EC';
                      textCol = '#11524F';
                    } else if (r >= 0.75) {
                      bg = '#BFE4D9';
                      textCol = '#11524F';
                    } else if (r >= 0.5) {
                      bg = '#EDFAF6';
                    }

                    return (
                      <td 
                        key={colF.id} 
                        style={{ backgroundColor: bg, color: textCol }}
                        className="p-2 font-mono text-[11px] border border-slate-light/30 font-semibold"
                        title={`${rowF.name} vs ${colF.name}: r = ${r}`}
                      >
                        {r.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Data Table with Filters & Search */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy">Clinical Dataset Records</h2>
            <p className="text-xs text-slate">Displaying curated FNA patient sample records with cytological grading</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate" />
              <input
                type="text"
                placeholder="Search sample ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-light/60 bg-canvas text-navy focus:outline-none focus:ring-1 focus:ring-teal w-40 sm:w-48"
              />
            </div>

            {/* Class Filter */}
            <div className="flex items-center space-x-1 border border-slate-light/40 rounded-lg p-0.5 bg-canvas">
              {(['All', 'Benign', 'Malignant'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setClassFilter(tab); setCurrentPage(1); }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    classFilter === tab 
                      ? 'bg-white text-navy shadow-sm' 
                      : 'text-slate hover:text-navy'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-2">Clump</th>
                <th className="py-2.5 px-2">Cell Size</th>
                <th className="py-2.5 px-2">Cell Shape</th>
                <th className="py-2.5 px-2">Adhesion</th>
                <th className="py-2.5 px-2">Epi Size</th>
                <th className="py-2.5 px-2">Bare Nuc</th>
                <th className="py-2.5 px-2">Chromatin</th>
                <th className="py-2.5 px-2">Nucleoli</th>
                <th className="py-2.5 px-2">Mitoses</th>
                <th className="py-2.5 px-3 text-right">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-light/20">
              {paginatedRows.map((row: any) => (
                <tr key={row.id} className="hover:bg-canvas/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-navy">{row.id}</td>
                  <td className="py-2.5 px-2 font-mono">{row.clump_thickness}</td>
                  <td className="py-2.5 px-2 font-mono">{row.uniformity_cell_size}</td>
                  <td className="py-2.5 px-2 font-mono">{row.uniformity_cell_shape}</td>
                  <td className="py-2.5 px-2 font-mono">{row.marginal_adhesion}</td>
                  <td className="py-2.5 px-2 font-mono">{row.single_epithelial_cell_size}</td>
                  <td className="py-2.5 px-2 font-mono">
                    {row.bare_nuclei === null ? (
                      <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-[10px]">NaN</span>
                    ) : (
                      row.bare_nuclei
                    )}
                  </td>
                  <td className="py-2.5 px-2 font-mono">{row.bland_chromatin}</td>
                  <td className="py-2.5 px-2 font-mono">{row.normal_nucleoli}</td>
                  <td className="py-2.5 px-2 font-mono">{row.mitoses}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.class === 'Malignant' 
                        ? 'bg-rose-light text-rose' 
                        : 'bg-mint text-teal-dark'
                    }`}>
                      {row.class}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-light/30 text-xs text-slate">
          <span>Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredRecords.length)} of {filteredRecords.length} records</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-light/40 hover:bg-canvas disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-navy font-semibold">{currentPage} / {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-slate-light/40 hover:bg-canvas disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

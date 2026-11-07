'use client';

import React, { useState, useRef } from 'react';
import { 
  Binary, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { BatchResponseData, BatchItemResult } from '@/lib/types';
import { FEATURES, RESEARCH_DISCLAIMER } from '@/lib/constants';

export default function WorkbenchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<BatchResponseData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rowsPerPage = 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Only valid CSV files (.csv) are accepted.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Only valid CSV files (.csv) are accepted.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setError('Please select or drag a CSV file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setBatchData(null);

    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/batch-predict`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || `Server responded with error status ${res.status}`);
      }

      const data: BatchResponseData = await res.json();
      setBatchData(data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV file on backend.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = (type: 'prediction' | 'evaluation') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.open(`${apiUrl}/api/sample-csv/${type}`, '_blank');
  };

  const downloadResultsCSV = () => {
    if (!batchData || !batchData.results.length) return;

    let csvContent = 'row_index,predicted_class,predicted_label,probability_benign,probability_malignant';
    if (batchData.mode === 'evaluation') {
      csvContent += ',ground_truth,is_correct\n';
    } else {
      csvContent += '\n';
    }

    batchData.results.forEach(r => {
      let row = `${r.row_index},${r.predicted_class},${r.predicted_label},${r.probability_benign},${r.probability_malignant}`;
      if (batchData.mode === 'evaluation') {
        row += `,${r.ground_truth || ''},${r.is_correct ?? ''}`;
      }
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `oncolens_batch_${batchData.mode}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows for results table
  const resultsList = batchData?.results || [];
  const filteredRows = resultsList.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchLabel = r.predicted_label.toLowerCase().includes(q);
    const matchGT = r.ground_truth ? r.ground_truth.toLowerCase().includes(q) : false;
    const matchIdx = r.row_index.toString().includes(q);
    return matchLabel || matchGT || matchIdx;
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-light/30 pb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-mono font-semibold">
          <Binary className="w-3.5 h-3.5" />
          <span>Batch Cytology Research Workbench</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Research Workbench</h1>
        <p className="text-slate text-sm max-w-3xl leading-relaxed">
          Upload custom cytology datasets for automated schema validation, batch inference via the trained ANN pipeline, or automated evaluation benchmarking if ground-truth diagnosis labels are included.
        </p>
      </div>

      {/* Two Supported Workflows Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-navy font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs">1</span>
            <span>Workflow 1: Batch Prediction</span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            Upload CSV containing the 9 feature columns. The model performs imputation, scaling, and forward passes to output predicted classifications and confidence scores.
          </p>
          <button
            onClick={() => downloadSample('prediction')}
            className="text-xs font-semibold text-teal hover:text-teal-dark inline-flex items-center gap-1 pt-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Prediction Template CSV
          </button>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-light/40 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-navy font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs">2</span>
            <span>Workflow 2: Batch Evaluation</span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            If your CSV also provides ground truth (named <code>Diagnosis</code> or <code>Class</code>), the platform automatically calculates cohort Accuracy, Precision, Recall, and Confusion Matrix.
          </p>
          <button
            onClick={() => downloadSample('evaluation')}
            className="text-xs font-semibold text-teal hover:text-teal-dark inline-flex items-center gap-1 pt-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Evaluation Template CSV
          </button>
        </div>
      </div>

      {/* CSV Dropzone / Uploader */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
        <div className="border-b border-slate-light/30 pb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-navy">CSV Dataset Upload</h2>
          <span className="text-xs font-mono text-slate">Strict 9-Feature Schema Validation</span>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-light/60 hover:border-teal rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-canvas/40 hover:bg-canvas space-y-3"
        >
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-teal/10 mx-auto flex items-center justify-center text-teal">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy">
              {file ? file.name : "Click to select or drag and drop your CSV file"}
            </p>
            <p className="text-xs text-slate mt-1">
              Supports standard CSV format with comma delimiters. Max file size: 10MB.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-light text-rose border border-rose/30 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate font-mono">
            {file ? `Selected file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'No file currently loaded.'}
          </span>
          <button
            onClick={handleUploadSubmit}
            disabled={!file || loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-teal hover:bg-teal-light text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-mint" />
                <span>Validating & Running Model...</span>
              </>
            ) : (
              <>
                <Binary className="w-4 h-4 text-mint" />
                <span>Process Batch CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Batch Processing Results */}
      {batchData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Mode Badge & Metrics Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                    batchData.mode === 'evaluation' 
                      ? 'bg-teal text-white' 
                      : 'bg-navy text-white'
                  }`}>
                    {batchData.mode === 'evaluation' ? 'Ground-Truth Evaluation Mode' : 'Inference Mode'}
                  </span>
                  <span className="text-xs font-mono text-slate">({batchData.metrics.total_samples} samples)</span>
                </div>
                <h2 className="text-lg font-bold text-navy">Batch Pipeline Execution Summary</h2>
              </div>

              <button
                onClick={downloadResultsCSV}
                className="px-4 py-2 rounded-lg bg-canvas hover:bg-mint text-navy border border-slate-light/40 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-teal" />
                <span>Export Predictions CSV</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-canvas border border-slate-light/30">
                <p className="text-[10px] font-mono uppercase text-slate">Total Samples</p>
                <p className="text-2xl font-bold text-navy mt-1">{batchData.metrics.total_samples}</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-slate-light/30">
                <p className="text-[10px] font-mono uppercase text-slate">Predicted Benign</p>
                <p className="text-2xl font-bold text-teal mt-1">{batchData.metrics.benign_count}</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-slate-light/30">
                <p className="text-[10px] font-mono uppercase text-slate">Predicted Malignant</p>
                <p className="text-2xl font-bold text-rose mt-1">{batchData.metrics.malignant_count}</p>
              </div>
              
              {batchData.mode === 'evaluation' && batchData.metrics.accuracy !== undefined ? (
                <div className="p-4 rounded-xl bg-mint-light/60 border border-teal/30">
                  <p className="text-[10px] font-mono uppercase text-teal-dark font-bold">Batch Accuracy</p>
                  <p className="text-2xl font-bold text-teal-dark mt-1">{(batchData.metrics.accuracy! * 100).toFixed(1)}%</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-canvas border border-slate-light/30">
                  <p className="text-[10px] font-mono uppercase text-slate">Decision Boundary</p>
                  <p className="text-sm font-mono font-bold text-navy mt-2">p ≥ 0.50 Malignant</p>
                </div>
              )}
            </div>

            {/* Evaluation Scoreboard if GT present */}
            {batchData.mode === 'evaluation' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-canvas text-xs border border-slate-light/30 flex justify-between">
                  <span className="text-slate">Precision (Malignant):</span>
                  <span className="font-mono font-bold text-navy">{(batchData.metrics.precision! * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3.5 rounded-lg bg-canvas text-xs border border-slate-light/30 flex justify-between">
                  <span className="text-slate">Recall (Sensitivity):</span>
                  <span className="font-mono font-bold text-teal">{(batchData.metrics.recall! * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3.5 rounded-lg bg-canvas text-xs border border-slate-light/30 flex justify-between">
                  <span className="text-slate">F1-Score:</span>
                  <span className="font-mono font-bold text-navy">{(batchData.metrics.f1_score! * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Batch Prediction Table */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-light/40 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-light/30 pb-4">
              <div>
                <h3 className="text-base font-bold text-navy">Individual Batch Record Predictions</h3>
                <p className="text-xs text-slate">Review per-sample class assignments and probabilities</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-light/60 bg-canvas text-navy focus:outline-none focus:ring-1 focus:ring-teal w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-canvas border-b border-slate-light/40 text-slate font-mono">
                    <th className="py-2.5 px-3">Row #</th>
                    <th className="py-2.5 px-3">Predicted Label</th>
                    <th className="py-2.5 px-3">Malignant Probability</th>
                    <th className="py-2.5 px-3">Benign Probability</th>
                    {batchData.mode === 'evaluation' && (
                      <>
                        <th className="py-2.5 px-3">Ground Truth</th>
                        <th className="py-2.5 px-3 text-right">Result</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-light/20">
                  {paginatedRows.map((r) => (
                    <tr key={r.row_index} className="hover:bg-canvas/50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-navy">{r.row_index}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.predicted_label === 'Malignant' ? 'bg-rose-light text-rose' : 'bg-mint text-teal-dark'
                        }`}>
                          {r.predicted_label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {(r.probability_malignant * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate">
                        {(r.probability_benign * 100).toFixed(1)}%
                      </td>
                      {batchData.mode === 'evaluation' && (
                        <>
                          <td className="py-2.5 px-3 font-mono font-semibold text-navy">
                            {r.ground_truth}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {r.is_correct ? (
                              <span className="text-teal font-bold text-xs">✓ Correct</span>
                            ) : (
                              <span className="text-rose font-bold text-xs">✗ Mismatch</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-light/30 text-xs text-slate">
              <span>Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} items</span>
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
      )}
    </div>
  );
}

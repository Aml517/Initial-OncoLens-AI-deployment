import React from 'react';
import Link from 'next/link';
import { ShieldAlert, BookOpen, ExternalLink, GitBranch } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-dark border-t border-navy-light/40 text-slate-light text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white">OncoLens AI</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal/20 text-teal-light border border-teal/40">
                Research Edition
              </span>
            </div>
            <p className="text-slate text-sm leading-relaxed max-w-md">
              A production-quality machine learning platform for cytological classification analysis using the historic Breast Cancer Wisconsin (Original) dataset and Scikit-learn neural network pipelines.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-light pt-2">
              <GitBranch className="w-4 h-4 text-teal" />
              <span>Pipeline: SimpleImputer (median) → StandardScaler → MLPClassifier(8,)</span>
            </div>
          </div>

          {/* Scientific Provenance */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Provenance</h4>
            <ul className="space-y-1.5 text-xs text-slate">
              <li>Donor: Dr. William H. Wolberg</li>
              <li>Clinical Site: Univ. of Wisconsin Hospitals</li>
              <li>Samples: 699 FNA biopsy cases</li>
              <li>Features: 9 Cytological scores (1-10)</li>
              <li>
                <a
                  href="https://archive.ics.uci.edu/dataset/15/breast+cancer+wisconsin+original"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-teal-light hover:underline pt-1"
                >
                  <span>UCI Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform Modules</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/predict" className="hover:text-white transition-colors">Interactive Model Explorer</Link></li>
              <li><Link href="/dataset" className="hover:text-white transition-colors">Dataset Distribution Explorer</Link></li>
              <li><Link href="/performance" className="hover:text-white transition-colors">Comparative Model Benchmarks</Link></li>
              <li><Link href="/workbench" className="hover:text-white transition-colors">Batch CSV Research Workbench</Link></li>
            </ul>
          </div>
        </div>

        {/* Rigorous Medical Disclaimer */}
        <div className="mt-8 pt-6 border-t border-navy-light/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate">
          <div className="flex items-start space-x-2 max-w-3xl">
            <ShieldAlert className="w-4 h-4 text-rose flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Strict Academic Notice:</strong> OncoLens AI is engineered solely for computer science education and machine learning research demonstration. It does not possess medical clearance, does not constitute clinical diagnostic software, and must not be used to direct medical care or evaluate patients.
            </p>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-light">
            v1.0.0 • Scikit-learn Pipeline Verified
          </div>
        </div>
      </div>
    </footer>
  );
}

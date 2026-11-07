import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Cpu, 
  Database, 
  BarChart3, 
  Binary, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Microscope,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { FEATURES, MODEL_RESULTS, APP_NAME, TAGLINE } from '@/lib/constants';

export default function HomePage() {
  const annModel = MODEL_RESULTS.find(m => m.name === 'ANN (MLP)')!;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy text-white pt-16 pb-24 border-b border-navy-light/60">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#176B67_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal/20 border border-teal/40 text-xs font-mono text-mint">
              <Microscope className="w-3.5 h-3.5" />
              <span>Cytological Machine Learning Research</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Machine Learning, <br />
              <span className="text-teal-light">Made Explorable.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-light leading-relaxed">
              Explore a real breast cancer dataset, investigate a trained Artificial Neural Network classifier, and understand how predictive machine learning decisions behave on cytological measurements.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/dataset"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-teal hover:bg-teal-light text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <Database className="w-5 h-5 text-mint" />
                <span>Explore the Dataset</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/predict"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-navy-light hover:bg-slate-dark text-white font-semibold transition-all border border-slate/30"
              >
                <Cpu className="w-5 h-5 text-teal-light" />
                <span>Test the Model</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker Banner */}
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-xl bg-navy-dark/80 border border-navy-light/60 backdrop-blur-md">
            <div>
              <p className="text-xs uppercase tracking-wider font-mono text-slate">Dataset Scope</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">699 <span className="text-sm font-normal text-slate-light">samples</span></p>
              <p className="text-[11px] text-slate mt-0.5">Wisconsin Fine-Needle Aspirates</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-mono text-slate">Predictive Features</p>
              <p className="text-2xl sm:text-3xl font-bold text-mint mt-1">9 <span className="text-sm font-normal text-slate-light">cytology scores</span></p>
              <p className="text-[11px] text-slate mt-0.5">Ordinal 1-10 scale</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-mono text-slate">Best Model (ANN)</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">97.1% <span className="text-sm font-normal text-slate-light">accuracy</span></p>
              <p className="text-[11px] text-slate mt-0.5">F1: 95.8% | ROC-AUC: 0.996</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-mono text-slate">Methodology</p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-light mt-1">Zero <span className="text-sm font-normal text-slate-light">leakage</span></p>
              <p className="text-[11px] text-slate mt-0.5">Pipeline CV imputation & scaling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-teal">Capabilities</h2>
          <p className="text-3xl font-bold text-navy mt-1">Engineered for Rigorous Exploration</p>
          <p className="text-slate text-sm mt-2">
            No generic mockups or synthetic numbers. Every tool is wired to the real dataset and Scikit-learn pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-light/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Interactive Model Explorer</h3>
              <p className="text-sm text-slate leading-relaxed">
                Tune the 9 cell features with validated controls, apply real-time median imputation and standardization, and observe neural network probabilities.
              </p>
            </div>
            <Link href="/predict" className="inline-flex items-center text-sm font-semibold text-teal hover:text-teal-dark mt-6">
              Launch Explorer <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-light/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-mint/50 flex items-center justify-center text-teal-dark">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Dataset Explorer</h3>
              <p className="text-sm text-slate leading-relaxed">
                Investigate class distributions (65.5% benign vs 34.5% malignant), correlation matrices, outliers, and search through all 699 clinical records.
              </p>
            </div>
            <Link href="/dataset" className="inline-flex items-center text-sm font-semibold text-teal hover:text-teal-dark mt-6">
              Explore Data <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-light/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Performance Lab</h3>
              <p className="text-sm text-slate leading-relaxed">
                Inspect experimental evaluations across KNN, Decision Tree, Random Forest, ANN, and SVM with confusion matrices, ROC curves, and CV stability.
              </p>
            </div>
            <Link href="/performance" className="inline-flex items-center text-sm font-semibold text-teal hover:text-teal-dark mt-6">
              Compare Models <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-light/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-rose-light/50 flex items-center justify-center text-rose">
                <Binary className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Research Workbench</h3>
              <p className="text-sm text-slate leading-relaxed">
                Upload CSV files for batch inference or automated batch validation if ground-truth diagnosis labels are included, with CSV report exports.
              </p>
            </div>
            <Link href="/workbench" className="inline-flex items-center text-sm font-semibold text-teal hover:text-teal-dark mt-6">
              Open Workbench <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dataset & Cytology Science Primer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-light/40 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal">Dataset Provenance</span>
              <h3 className="text-2xl font-bold text-navy">Understanding Fine-Needle Aspirate Cytology</h3>
              <p className="text-sm text-slate leading-relaxed">
                Collected by Dr. William H. Wolberg at the University of Wisconsin Hospitals (Madison), each instance represents microscopic examination of cells extracted via fine-needle aspiration.
              </p>
              <div className="p-4 rounded-lg bg-canvas text-xs space-y-2 border border-slate-light/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-navy">Target Class 2:</span>
                  <span className="text-teal font-medium">Benign (458 cases, 65.5%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-navy">Target Class 4:</span>
                  <span className="text-rose font-medium">Malignant (241 cases, 34.5%)</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-light/20">
                  <span className="font-semibold text-navy">Missing Values:</span>
                  <span className="text-slate font-mono">16 in Bare Nuclei (imputed via median)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-navy mb-4">The 9 Cytological Feature Dimensions (1-10 Scale)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {FEATURES.map((f, i) => (
                  <div key={f.id} className="p-3.5 rounded-lg bg-canvas border border-slate-light/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal">0{i+1}</span>
                      <span className="text-[10px] text-slate font-mono">1 to 10</span>
                    </div>
                    <p className="text-xs font-bold text-navy">{f.name}</p>
                    <p className="text-[11px] text-slate line-clamp-2">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Selection Transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-navy text-white border border-navy-light">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-mint">Model Justification</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Why Artificial Neural Network (MLP)?</h3>
              <p className="text-sm text-slate-light leading-relaxed">
                In our experimental benchmarking across 5 distinct classification algorithms using 5-fold cross-validation and a stratified 80:20 hold-out test set:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-light">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                  <span><strong>Highest ROC-AUC (0.9961):</strong> Demonstrates superior ranking ability across varied probability thresholds.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                  <span><strong>Top F1 & Recall (95.83%):</strong> Missed only 2 of 48 malignant cases on the hold-out test set, tying Random Forest while maintaining smoother decision surfaces.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                  <span><strong>Training Stability:</strong> Achieved mean cross-validation F1 of 0.9559 with small variance (±0.024) across repeated splits.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/performance"
                  className="inline-flex items-center space-x-2 text-sm font-semibold text-mint hover:text-white"
                >
                  <span>Review full comparative benchmark metrics</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-navy-dark border border-navy-light/80 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">ANN Architecture Specs</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-navy-light/50">
                  <span className="text-slate">Hidden Layers:</span>
                  <span className="text-mint">1 layer (8 neurons)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-navy-light/50">
                  <span className="text-slate">Activation Function:</span>
                  <span className="text-white">ReLU</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-navy-light/50">
                  <span className="text-slate">Optimization:</span>
                  <span className="text-white">Adam (lr = 0.001)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-navy-light/50">
                  <span className="text-slate">L2 Regularization (α):</span>
                  <span className="text-white">0.0001</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate">Hold-out Confusion Matrix:</span>
                  <span className="text-mint font-bold">TN: 89 | FP: 2 | FN: 2 | TP: 46</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Use Cases & Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-light/40 space-y-4">
          <div className="flex items-center space-x-2 text-teal">
            <AlertCircle className="w-5 h-5" />
            <h4 className="text-base font-bold text-navy">Research & Academic Use Cases</h4>
          </div>
          <p className="text-sm text-slate leading-relaxed">
            OncoLens AI serves students, data scientists, and instructors investigating cytological classification datasets. It illustrates best practices in preventing data leakage, standardizing ordinal features, handling medical class imbalances, and analyzing false negatives versus false positives in clinical ML settings.
          </p>
        </div>
      </section>
    </div>
  );
}

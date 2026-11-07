import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-navy-dark/95 border-b border-navy-light/80 px-4 py-2.5 text-xs text-slate-light">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-white font-medium">Research Demonstration:</strong> Input features reflect FNA cellular microscopy scores (1-10), not patient symptoms. All outputs represent experimental model evaluations.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-mono text-slate border border-slate/30 px-2 py-0.5 rounded">
          UCI Wisconsin Dataset
        </span>
      </div>
    </div>
  );
}

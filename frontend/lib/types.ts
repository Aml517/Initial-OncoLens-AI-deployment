export interface FeatureDefinition {
  id: string;
  name: string;
  field: string;
  description: string;
  cytologyContext: string;
  min: number;
  max: number;
  defaultValue: number;
  medianTrain: number;
}

export interface ModelMetric {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  cm: number[][]; // [[TN, FP], [FN, TP]]
}

export interface PredictionResult {
  predicted_class: number;
  predicted_label: 'Benign' | 'Malignant';
  probability_malignant: number;
  probability_benign: number;
  confidence_score: number;
  model_name: string;
  imputation_applied: boolean;
  disclaimer: string;
}

export interface BatchItemResult {
  row_index: number;
  predicted_class: number;
  predicted_label: 'Benign' | 'Malignant';
  probability_malignant: number;
  probability_benign: number;
  ground_truth?: 'Benign' | 'Malignant' | null;
  is_correct?: boolean | null;
}

export interface BatchMetricsData {
  total_samples: number;
  benign_count: number;
  malignant_count: number;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  confusion_matrix?: number[][] | null;
}

export interface BatchResponseData {
  mode: 'prediction' | 'evaluation';
  metrics: BatchMetricsData;
  results: BatchItemResult[];
}

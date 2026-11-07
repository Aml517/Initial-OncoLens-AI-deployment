import { FeatureDefinition } from './types';

export const APP_NAME = "OncoLens AI";
export const TAGLINE = "Explore the data. Understand the model. Investigate the predictions.";

export const FEATURES: FeatureDefinition[] = [
  {
    id: "clump_thickness",
    field: "Clump_Thickness",
    name: "Clump Thickness",
    description: "Evaluates whether cells are grouped in monolayers or multilayered clusters.",
    cytologyContext: "Benign cells typically form flat single layers (1-3). Malignant cells frequently pile up into irregular multilayer clumps (7-10).",
    min: 1,
    max: 10,
    defaultValue: 5,
    medianTrain: 4.0
  },
  {
    id: "uniformity_cell_size",
    field: "Uniformity_of_Cell_Size",
    name: "Uniformity of Cell Size",
    description: "Measures consistency in the physical dimensions of epithelial cells.",
    cytologyContext: "Uniform cell sizes reflect controlled biological growth. Severe variability (anisocytosis) strongly indicates malignant transformation.",
    min: 1,
    max: 10,
    defaultValue: 1,
    medianTrain: 1.0
  },
  {
    id: "uniformity_cell_shape",
    field: "Uniformity_of_Cell_Shape",
    name: "Uniformity of Cell Shape",
    description: "Measures regularity and consistency of nuclear/cellular morphology.",
    cytologyContext: "Normal cells maintain regular rounded or oval contours. High pleomorphism and irregular angular borders mark malignant cells.",
    min: 1,
    max: 10,
    defaultValue: 1,
    medianTrain: 1.0
  },
  {
    id: "marginal_adhesion",
    field: "Marginal_Adhesion",
    name: "Marginal Adhesion",
    description: "Quantifies the cohesion and stickiness between adjacent cells.",
    cytologyContext: "Normal epithelial cells adhere tightly. Metastatic and aggressive malignant cells downregulate adhesion molecules, showing low adhesion (scored high on abnormality).",
    min: 1,
    max: 10,
    defaultValue: 1,
    medianTrain: 1.0
  },
  {
    id: "single_epithelial_cell_size",
    field: "Single_Epithelial_Cell_Size",
    name: "Single Epithelial Cell Size",
    description: "Relates to cell enlargement relative to normal mammary duct epithelial cells.",
    cytologyContext: "Significantly enlarged isolated epithelial cells often result from dysregulated metabolic synthesis in carcinoma cells.",
    min: 1,
    max: 10,
    defaultValue: 2,
    medianTrain: 2.0
  },
  {
    id: "bare_nuclei",
    field: "Bare_Nuclei",
    name: "Bare Nuclei",
    description: "Nuclei not surrounded by cytoplasm, commonly observed in aspirates.",
    cytologyContext: "The only feature with missing values (16 in original dataset). High counts of large bare nuclei correlate with aggressive tumours (median 1 in benign, 10 in malignant).",
    min: 1,
    max: 10,
    defaultValue: 1,
    medianTrain: 1.0
  },
  {
    id: "bland_chromatin",
    field: "Bland_Chromatin",
    name: "Bland Chromatin",
    description: "Evaluates the nuclear chromatin texture and staining uniformity.",
    cytologyContext: "Benign nuclei show fine, uniform, bland chromatin. Coarse clumping, hyperchromasia, and irregular heterochromatin aggregates mark malignancy.",
    min: 1,
    max: 10,
    defaultValue: 3,
    medianTrain: 3.0
  },
  {
    id: "normal_nucleoli",
    field: "Normal_Nucleoli",
    name: "Normal Nucleoli",
    description: "Evaluates the size, number, and prominence of nucleolar structures.",
    cytologyContext: "Normal cells have tiny, barely discernible nucleoli (1). Hyperactive ribosome synthesis in cancer produces multiple prominent macronucleoli (7-10).",
    min: 1,
    max: 10,
    defaultValue: 1,
    medianTrain: 1.0
  },
  {
    id: "mitoses",
    field: "Mitoses",
    name: "Mitoses",
    description: "Relative frequency of mitotic figures (actively dividing cells).",
    cytologyContext: "Extremely right-skewed; most samples have score 1. Elevated mitotic figures indicate rapid, uncontrolled cellular proliferation.",
    min: 1,
    max: 10,
    defaultValue: 1,
    medianTrain: 1.0
  }
];



export const MODEL_RESULTS = [
  {
    name: "ANN (MLP)",
    architecture: "Multi-Layer Perceptron (8 hidden units, ReLU, L2 α=1e-4)",
    accuracy: 0.9712,
    precision: 0.9583,
    recall: 0.9583,
    f1: 0.9583,
    roc_auc: 0.9961,
    cv_f1: 0.9559,
    is_best: true,
    cm: [[89, 2], [2, 46]],
    badge: "Selected Best Model"
  },
  {
    name: "Random Forest",
    architecture: "400 Trees, Max Depth 5, Sqrt features, Min Leaf 2",
    accuracy: 0.9712,
    precision: 0.9583,
    recall: 0.9583,
    f1: 0.9583,
    roc_auc: 0.9940,
    cv_f1: 0.9537,
    is_best: false,
    cm: [[89, 2], [2, 46]],
    badge: "Top Contender"
  },
  {
    name: "SVM",
    architecture: "Linear Kernel, C=0.1, Gamma=scale",
    accuracy: 0.9640,
    precision: 0.9574,
    recall: 0.9375,
    f1: 0.9474,
    roc_auc: 0.9968,
    cv_f1: 0.9503,
    is_best: false,
    cm: [[89, 2], [3, 45]],
    badge: "High ROC-AUC"
  },
  {
    name: "K-Nearest Neighbors",
    architecture: "k=7, Uniform weights, Euclidean distance",
    accuracy: 0.9640,
    precision: 0.9778,
    recall: 0.9167,
    f1: 0.9462,
    roc_auc: 0.9823,
    cv_f1: 0.9555,
    is_best: false,
    cm: [[90, 1], [4, 44]],
    badge: "Highest Precision"
  },
  {
    name: "Decision Tree",
    architecture: "Gini criterion, Max Depth 4, Min Split 2, Min Leaf 2",
    accuracy: 0.9281,
    precision: 0.8958,
    recall: 0.8958,
    f1: 0.8958,
    roc_auc: 0.9755,
    cv_f1: 0.9297,
    is_best: false,
    cm: [[86, 5], [5, 43]],
    badge: "Baseline Tree"
  }
];

export const ROC_CURVES_DATA = [
  { fpr: 0.0, 'ANN (MLP)': 0.0, 'Random Forest': 0.0, 'SVM': 0.0, 'KNN': 0.0, 'Decision Tree': 0.0, 'Random Baseline': 0.0 },
  { fpr: 0.011, 'ANN (MLP)': 0.938, 'Random Forest': 0.938, 'SVM': 0.938, 'KNN': 0.896, 'Decision Tree': 0.854, 'Random Baseline': 0.011 },
  { fpr: 0.022, 'ANN (MLP)': 0.958, 'Random Forest': 0.958, 'SVM': 0.938, 'KNN': 0.917, 'Decision Tree': 0.896, 'Random Baseline': 0.022 },
  { fpr: 0.044, 'ANN (MLP)': 0.979, 'Random Forest': 0.979, 'SVM': 0.979, 'KNN': 0.938, 'Decision Tree': 0.896, 'Random Baseline': 0.044 },
  { fpr: 0.055, 'ANN (MLP)': 0.979, 'Random Forest': 0.979, 'SVM': 1.0, 'KNN': 0.958, 'Decision Tree': 0.917, 'Random Baseline': 0.055 },
  { fpr: 0.10, 'ANN (MLP)': 1.0, 'Random Forest': 1.0, 'SVM': 1.0, 'KNN': 0.979, 'Decision Tree': 0.938, 'Random Baseline': 0.10 },
  { fpr: 0.20, 'ANN (MLP)': 1.0, 'Random Forest': 1.0, 'SVM': 1.0, 'KNN': 1.0, 'Decision Tree': 0.958, 'Random Baseline': 0.20 },
  { fpr: 1.0, 'ANN (MLP)': 1.0, 'Random Forest': 1.0, 'SVM': 1.0, 'KNN': 1.0, 'Decision Tree': 1.0, 'Random Baseline': 1.0 }
];

export const RESEARCH_DISCLAIMER =
  "OncoLens AI is an educational and machine learning research demonstration built upon the Breast Cancer Wisconsin (Original) dataset. It is not an FDA-cleared diagnostic device and must not be used for medical decisions, clinical screening, or patient care.";

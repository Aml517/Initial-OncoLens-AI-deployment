# OncoLens AI — Breast Cancer Cytology Research Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML%20Pipeline-Scikit--Learn-F7931E?logo=scikitlearn)](https://scikit-learn.org/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-white?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> *"Explore the data. Understand the model. Investigate the predictions."*

**OncoLens AI** is a production-quality, educational and research-oriented machine learning platform built on the historic **Breast Cancer Wisconsin (Original)** dataset. It enables researchers, data scientists, and students to explore cytological biopsy distributions, investigate the behavior of a trained Scikit-learn **Artificial Neural Network (MLP)** classifier, inspect comparative benchmark evaluations across 5 algorithms, and validate custom cohorts via automated CSV batch processing.

---

## 1. Project Provenance & Dataset Science

### Dataset Background
* **Origin:** Donated in 1992 by **Dr. William H. Wolberg**, University of Wisconsin Hospitals, Madison.
* **Source:** [UCI Machine Learning Repository — Breast Cancer Wisconsin (Original)](https://archive.ics.uci.edu/dataset/15/breast+cancer+wisconsin+original).
* **Sample Size:** 699 clinical Fine-Needle Aspirate (FNA) biopsy instances (691 unique rows after exact duplicate removal).
* **Class Distribution:** 458 Benign ($65.5\%$) vs. 241 Malignant ($34.5\%$).

### The 9 Cytological Measurements (1–10 Scale)
Every feature is an ordinal cytological score assigned by a pathologist upon microscopic examination:

| # | Feature Name | Description | Cytological Significance |
|---|---|---|---|
| 1 | `Clump_Thickness` | Cell monolayer vs. multilayering | Malignant cells tend to pile up into multilayered clusters. |
| 2 | `Uniformity_of_Cell_Size` | Consistency of cell dimensions | High size variation (anisocytosis) marks malignant change. |
| 3 | `Uniformity_of_Cell_Shape` | Consistency of cell morphology | Pleomorphism and irregular contours indicate carcinoma. |
| 4 | `Marginal_Adhesion` | Cohesion between neighboring cells | Invasive cancer cells lose adhesion molecules (score 7-10). |
| 5 | `Single_Epithelial_Cell_Size` | Cell enlargement relative to normal | Enlarged isolated epithelial cells occur in carcinomas. |
| 6 | `Bare_Nuclei` | Nuclei without surrounding cytoplasm | Strongly separates benign (median 1) from malignant (median 10). |
| 7 | `Bland_Chromatin` | Nuclear chromatin texture & staining | Coarse clumping & hyperchromasia indicate malignancy. |
| 8 | `Normal_Nucleoli` | Nucleolar prominence & number | Prominent macronucleoli reflect elevated protein synthesis. |
| 9 | `Mitoses` | Relative rate of active cell division | Extremely skewed; elevated scores signal aggressive tumors. |

---

## 2. Machine Learning Pipeline & Rigorous Methodology

### Zero Data Leakage Guarantee
The preprocessing pipeline is strictly isolated using Scikit-learn `Pipeline`:
1. **Target Encoding:** `Class` 2 $\to$ 0 (Benign), `Class` 4 $\to$ 1 (Malignant, positive class).
2. **Identifier Removal:** `Sample_code_number` is removed; it is never exposed as an input feature.
3. **Train / Test Split:** Stratified 80:20 split (`random_state=42`) executed **before** fitting transformations:
   * Training set: 552 instances (362 benign, 190 malignant)
   * Hold-out test set: 139 instances (91 benign, 48 malignant)
4. **Median Imputation:** Missing values in `Bare_Nuclei` (16 instances in raw data) are imputed with training median ($1.0$).
5. **Standardization:** `StandardScaler` calculates mean and variance on training folds only; test sets receive identical parameter transforms without refitting.

### Model Architecture
* **Selected Best Model:** Multi-Layer Perceptron (`MLPClassifier`)
* **Hidden Layers:** 1 hidden layer with 8 ReLU neurons `(8,)`
* **Regularization:** L2 penalty $\alpha = 0.0001$
* **Optimization:** Adam solver, initial learning rate $0.001$, `max_iter=2000`
* **Artifact:** Serialized Scikit-learn pipeline saved in `artifacts/ann_pipeline.joblib`.

---

## 3. Experimental Evaluation Results

Evaluated on the untouched hold-out test set ($N = 139$):

| Algorithm | Accuracy | Precision | Recall (Malignant) | F1-Score | ROC-AUC | 5-Fold CV F1 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **ANN (MLP)** | **97.12%** | **95.83%** | **95.83%** | **95.83%** | **0.9961** | **0.9559** |
| Random Forest | 97.12% | 95.83% | 95.83% | 95.83% | 0.9940 | 0.9537 |
| Support Vector Machine (SVM) | 96.40% | 95.74% | 93.75% | 94.74% | 0.9968 | 0.9503 |
| K-Nearest Neighbors (KNN) | 96.40% | 97.78% | 91.67% | 0.9462 | 0.9823 | 0.9555 |
| Decision Tree (DT) | 92.81% | 89.58% | 89.58% | 0.8958 | 0.9755 | 0.9297 |

### Confusion Matrix on Test Set (Positive Class = Malignant)
$$\begin{bmatrix} \text{True Benign (TN): } 89 & \text{False Alarm (FP): } 2 \\ \text{Missed Cancer (FN): } 2 & \text{True Malignant (TP): } 46 \end{bmatrix}$$

* **Clinical Error Breakdown:**
  * **False Negatives:** 2 missed out of 48 malignant cases (Recall = $95.83\%$).
  * **False Positives:** 2 false alarms out of 91 benign cases (Precision = $95.83\%$).

---

## 4. Platform Modules

1. **Landing Page (`/`):** Overview of cytological machine learning, feature primers, and model selection transparency.
2. **Model Explorer (`/predict`):** Interactive cytological feature sliders (1–10) with preset profiles, real-time median imputation, and ANN probability inference.
3. **Dataset Explorer (`/dataset`):** Frequency histograms, class quartile comparisons, correlation heatmap (identifying $r = 0.91$ size/shape collinearity), and searchable paginated table.
4. **Performance Lab (`/performance`):** Benchmark charts, multi-model ROC curves, interactive confusion matrices, and 25-fold cross-validation stability audits.
5. **Research Workbench (`/workbench`):** CSV upload module supporting both **Inference Mode** (features only) and **Evaluation Mode** (features + ground truth), with downloadable prediction CSV reports.

---

## 5. Technology Stack & Directory Structure

```
adv ai/
├── artifacts/
│   ├── ann_pipeline.joblib         # Serialized Scikit-learn imputer + scaler + ANN
│   ├── rf_pipeline.joblib          # Serialized Random Forest pipeline
│   ├── metadata.json               # Full project metrics and model parameters
│   ├── dataset_analysis.json       # Precomputed stats, histograms, and correlations
│   ├── sample_prediction.csv       # Template for inference-only CSV upload
│   └── sample_evaluation.csv       # Template for ground-truth evaluation CSV upload
├── backend/
│   ├── main.py                     # FastAPI REST API endpoints
│   ├── schemas.py                  # Pydantic validation schemas
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Container deployment configuration
├── frontend/
│   ├── app/                        # Next.js 14 App Router routes
│   │   ├── page.tsx                # Landing Page
│   │   ├── predict/page.tsx        # Interactive Model Explorer
│   │   ├── dataset/page.tsx        # Dataset Explorer & Visualizations
│   │   ├── performance/page.tsx    # Model Performance Lab
│   │   └── workbench/page.tsx      # CSV Batch Research Workbench
│   ├── components/                 # Reusable UI components (Navbar, Footer, Banners)
│   ├── lib/                        # Constants, types, and dataset fallbacks
│   ├── package.json
│   └── tailwind.config.ts
├── breast-cancer-wisconsin.data    # Original UCI dataset file
├── breast-cancer-wisconsin.names   # Original UCI dataset documentation
└── Breast_Cancer_Classification.ipynb # The source project notebook
```

---

## 6. Local Development Setup

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm

### Step 1: Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* Interactive API Documentation will be available at: `http://localhost:8001/docs`

### Step 2: Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
* The platform will be live at: `http://localhost:3000`

---

## 7. Deployment Instructions

### Frontend (Vercel)
1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, select **New Project** and choose the repository.
3. Set the **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   * `NEXT_PUBLIC_API_URL`: URL of your deployed FastAPI backend (e.g., `https://oncolens-backend.onrender.com`).
5. Click **Deploy**.

### Backend (Docker / Render / Railway / Hugging Face Spaces)
The backend includes a production-ready `Dockerfile`:
```bash
docker build -f backend/Dockerfile -t oncolens-api .
docker run -p 8000:8001 oncolens-api
```
On services like **Render** or **Railway**:
1. Connect repository and set root to project root.
2. Build command: `pip install -r backend/requirements.txt`
3. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## 8. Responsible AI & Academic Disclaimer

> **Important Notice:** OncoLens AI is an educational and research software platform engineered for computer science and bioinformatics study. It is not an FDA-cleared diagnostic device and must not be used for medical decisions, clinical screening, or patient treatment. All cytological input features represent historical fine-needle aspiration cellular gradings, not patient symptoms.

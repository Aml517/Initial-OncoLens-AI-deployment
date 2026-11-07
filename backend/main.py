import os, io, json
from typing import Optional, List, Dict, Any
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from schemas import FeatureInput, PredictionResponse, BatchResponse, BatchMetrics, BatchPredictionItem

app = FastAPI(
    title="OncoLens AI API",
    description="Research & Educational Inference API for Breast Cancer Wisconsin (Original) ANN Classifier",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "ann_pipeline.joblib")
METADATA_PATH = os.path.join(ARTIFACTS_DIR, "metadata.json")
DATASET_PATH = os.path.join(ARTIFACTS_DIR, "dataset_analysis.json")

# Load model pipeline
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Saved model pipeline not found at {MODEL_PATH}")

pipeline = joblib.load(MODEL_PATH)
with open(METADATA_PATH, "r") as f:
    metadata = json.load(f)

FEATURE_COLUMNS = metadata["features"]
DISCLAIMER = (
    "This platform is an educational and research demonstration using the Breast Cancer Wisconsin (Original) dataset. "
    "It is not a medical device and must not be used for diagnosis, treatment decisions, or clinical care."
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": pipeline is not None,
        "model_type": metadata["model_name"],
        "architecture": metadata["architecture"]
    }

@app.get("/api/model-info")
def get_model_info():
    return {
        "model_metadata": metadata,
        "disclaimer": DISCLAIMER
    }

@app.get("/api/relationships/matrix")
def get_relationships_analysis():
    rel_path = os.path.join(ARTIFACTS_DIR, "relationships_analysis.json")
    if os.path.exists(rel_path):
        with open(rel_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Relationships analysis artifact not found.")

@app.get("/api/interpretability/permutation")
def get_interpretability_analysis():
    interp_path = os.path.join(ARTIFACTS_DIR, "interpretability_analysis.json")
    if os.path.exists(interp_path):
        with open(interp_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Interpretability analysis artifact not found.")

@app.get("/api/evaluation/analysis")
def get_evaluation_analysis():
    eval_path = os.path.join(ARTIFACTS_DIR, "evaluation_analysis.json")
    if os.path.exists(eval_path):
        with open(eval_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Evaluation analysis artifact not found.")

@app.get("/api/stats/feature-tests")
def get_statistical_tests():
    stats_path = os.path.join(ARTIFACTS_DIR, "statistical_analysis.json")
    if os.path.exists(stats_path):
        with open(stats_path, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Statistical analysis artifact not found.")

@app.get("/api/dataset-stats")
def get_dataset_stats():
    if os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Dataset analysis artifact not found.")

@app.post("/api/predict", response_model=PredictionResponse)
def predict_single(features: FeatureInput):
    # Convert input to DataFrame matching exact feature column order
    input_dict = {
        'Clump_Thickness': features.Clump_Thickness,
        'Uniformity_of_Cell_Size': features.Uniformity_of_Cell_Size,
        'Uniformity_of_Cell_Shape': features.Uniformity_of_Cell_Shape,
        'Marginal_Adhesion': features.Marginal_Adhesion,
        'Single_Epithelial_Cell_Size': features.Single_Epithelial_Cell_Size,
        'Bare_Nuclei': np.nan if features.Bare_Nuclei is None else features.Bare_Nuclei,
        'Bland_Chromatin': features.Bland_Chromatin,
        'Normal_Nucleoli': features.Normal_Nucleoli,
        'Mitoses': features.Mitoses
    }
    input_df = pd.DataFrame([input_dict], columns=FEATURE_COLUMNS)
    
    # Check if imputation will be needed
    imputation_applied = input_df['Bare_Nuclei'].isna().any()
    
    # Run exact pipeline
    try:
        pred_class = int(pipeline.predict(input_df)[0])
        probabilities = pipeline.predict_proba(input_df)[0]
        prob_benign = float(probabilities[0])
        prob_malignant = float(probabilities[1])
        conf = prob_malignant if pred_class == 1 else prob_benign
        
        return PredictionResponse(
            predicted_class=pred_class,
            predicted_label="Malignant" if pred_class == 1 else "Benign",
            probability_malignant=round(prob_malignant, 4),
            probability_benign=round(prob_benign, 4),
            confidence_score=round(conf, 4),
            model_name=metadata["model_name"],
            imputation_applied=bool(imputation_applied),
            disclaimer=DISCLAIMER
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/batch-predict")
async def batch_predict(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
    
    # Check for required feature columns
    # Match flexibly (case-insensitive and spaces replaced by underscores)
    normalized_cols = {c.strip().replace(' ', '_').lower(): c for c in df.columns}
    col_mapping = {}
    missing_cols = []
    
    for f in FEATURE_COLUMNS:
        f_norm = f.lower()
        if f_norm in normalized_cols:
            col_mapping[f] = normalized_cols[f_norm]
        else:
            missing_cols.append(f)
            
    if missing_cols:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required feature columns: {missing_cols}. Expected features: {FEATURE_COLUMNS}"
        )
    
    # Extract features in exact order
    feat_df = pd.DataFrame()
    for f in FEATURE_COLUMNS:
        feat_df[f] = pd.to_numeric(df[col_mapping[f]], errors='coerce')
    
    # Validate feature range
    invalid_rows = []
    for f in FEATURE_COLUMNS:
        # Bare_Nuclei can be NaN (handled by imputer), other columns must be 1-10
        if f == 'Bare_Nuclei':
            bad = (feat_df[f].notna()) & ((feat_df[f] < 1) | (feat_df[f] > 10))
        else:
            bad = (feat_df[f].isna()) | (feat_df[f] < 1) | (feat_df[f] > 10)
        if bad.any():
            invalid_rows.extend(feat_df[bad].index.tolist())
    
    if invalid_rows:
        unique_invalid = sorted(list(set(invalid_rows)))[:5]
        raise HTTPException(
            status_code=422,
            detail=f"Values outside valid range [1, 10] or unexpected NaNs detected in rows: {unique_invalid}"
        )
    
    # Run predictions
    preds = pipeline.predict(feat_df)
    probs = pipeline.predict_proba(feat_df)
    
    # Check if ground truth is provided
    gt_col = None
    for cand in ['diagnosis', 'class', 'target', 'ground_truth', 'label']:
        if cand in normalized_cols:
            gt_col = normalized_cols[cand]
            break
            
    is_evaluation = False
    metrics = BatchMetrics(
        total_samples=len(df),
        benign_count=int((preds == 0).sum()),
        malignant_count=int((preds == 1).sum())
    )
    
    results_list = []
    
    if gt_col:
        # Standardize ground truth
        raw_gt = df[gt_col].astype(str).str.strip().str.lower()
        # Accept 2/4, 0/1, benign/malignant
        y_true = []
        valid_gt = True
        for val in raw_gt:
            if val in ['2', '0', 'benign', 'b']:
                y_true.append(0)
            elif val in ['4', '1', 'malignant', 'm']:
                y_true.append(1)
            else:
                valid_gt = False
                break
                
        if valid_gt:
            is_evaluation = True
            y_true = np.array(y_true)
            acc = accuracy_score(y_true, preds)
            prec = precision_score(y_true, preds, zero_division=0)
            rec = recall_score(y_true, preds, zero_division=0)
            f1 = f1_score(y_true, preds, zero_division=0)
            cm = confusion_matrix(y_true, preds, labels=[0, 1]).tolist()
            
            metrics.accuracy = round(float(acc), 4)
            metrics.precision = round(float(prec), 4)
            metrics.recall = round(float(rec), 4)
            metrics.f1_score = round(float(f1), 4)
            metrics.confusion_matrix = cm
            
            for i in range(len(df)):
                results_list.append({
                    "row_index": i + 1,
                    "predicted_class": int(preds[i]),
                    "predicted_label": "Malignant" if preds[i] == 1 else "Benign",
                    "probability_malignant": round(float(probs[i][1]), 4),
                    "probability_benign": round(float(probs[i][0]), 4),
                    "ground_truth": "Malignant" if y_true[i] == 1 else "Benign",
                    "is_correct": bool(preds[i] == y_true[i])
                })
                
    if not is_evaluation:
        for i in range(len(df)):
            results_list.append({
                "row_index": i + 1,
                "predicted_class": int(preds[i]),
                "predicted_label": "Malignant" if preds[i] == 1 else "Benign",
                "probability_malignant": round(float(probs[i][1]), 4),
                "probability_benign": round(float(probs[i][0]), 4),
                "ground_truth": None,
                "is_correct": None
            })
            
    return BatchResponse(
        mode="evaluation" if is_evaluation else "prediction",
        metrics=metrics,
        results=results_list
    )

@app.get("/api/sample-csv/{sample_type}")
def get_sample_csv(sample_type: str):
    filename = "sample_prediction.csv" if sample_type == "prediction" else "sample_evaluation.csv"
    filepath = os.path.join(ARTIFACTS_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            content = f.read()
        return StreamingResponse(
            io.StringIO(content),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    raise HTTPException(status_code=404, detail="Sample file not found.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


@app.get("/api/robustness")
async def robustness_analysis():
    """Module 7: Model Robustness & Uncertainty — repeated CV + bootstrap CIs."""
    import json as _json
    analysis_path = ARTIFACTS / "robustness_analysis.json"
    if not analysis_path.exists():
        raise HTTPException(status_code=404, detail="robustness_analysis.json not found")
    with open(analysis_path) as f:
        return _json.load(f)


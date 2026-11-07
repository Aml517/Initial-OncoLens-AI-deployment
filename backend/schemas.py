from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

class FeatureInput(BaseModel):
    Clump_Thickness: float = Field(..., ge=1, le=10, description="Clump thickness (1-10)")
    Uniformity_of_Cell_Size: float = Field(..., ge=1, le=10, description="Uniformity of cell size (1-10)")
    Uniformity_of_Cell_Shape: float = Field(..., ge=1, le=10, description="Uniformity of cell shape (1-10)")
    Marginal_Adhesion: float = Field(..., ge=1, le=10, description="Marginal adhesion (1-10)")
    Single_Epithelial_Cell_Size: float = Field(..., ge=1, le=10, description="Single epithelial cell size (1-10)")
    Bare_Nuclei: Optional[float] = Field(None, ge=1, le=10, description="Bare nuclei (1-10, can be None for missing value imputation)")
    Bland_Chromatin: float = Field(..., ge=1, le=10, description="Bland chromatin (1-10)")
    Normal_Nucleoli: float = Field(..., ge=1, le=10, description="Normal nucleoli (1-10)")
    Mitoses: float = Field(..., ge=1, le=10, description="Mitoses rate (1-10)")

class PredictionResponse(BaseModel):
    predicted_class: int
    predicted_label: str
    probability_malignant: float
    probability_benign: float
    confidence_score: float
    model_name: str
    imputation_applied: bool
    disclaimer: str

class BatchPredictionItem(BaseModel):
    row_index: int
    predicted_class: int
    predicted_label: str
    probability_malignant: float
    ground_truth: Optional[str] = None
    is_correct: Optional[bool] = None

class BatchMetrics(BaseModel):
    total_samples: int
    benign_count: int
    malignant_count: int
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None

class BatchResponse(BaseModel):
    mode: str  # "prediction" or "evaluation"
    metrics: BatchMetrics
    results: List[Dict[str, Any]]

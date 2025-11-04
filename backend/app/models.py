from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class AnalysisStatus(str, Enum):
    """Analysis status enumeration"""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EmotionData(BaseModel):
    """Single emotion detection result"""
    emotion: str
    confidence: float
    timestamp: float
    frame: int


class TranscriptionSegment(BaseModel):
    """Transcription segment with timing"""
    text: str
    start: float
    end: float
    confidence: float = 0.0


class Transcription(BaseModel):
    """Complete transcription result"""
    text: str
    language: str
    segments: List[TranscriptionSegment] = []


class DominantEmotion(BaseModel):
    """Dominant emotion statistics"""
    emotion: str
    percentage: float


class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    id: str
    status: AnalysisStatus
    transcription: Optional[Transcription] = None
    emotions: Optional[List[EmotionData]] = None
    dominant_emotion: Optional[DominantEmotion] = None
    created_at: datetime
    error: Optional[str] = None


class UploadResponse(BaseModel):
    """Video upload response"""
    id: str
    message: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime = Field(default_factory=datetime.now)

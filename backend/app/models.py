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
    """Single facial emotion detection result"""
    emotion: str
    confidence: float
    timestamp: float
    frame: int
    all_emotions: dict = {}
    frame_image: Optional[str] = None


class SpeechEmotionData(BaseModel):
    """Speech emotion detection result from SenseVoice"""
    emotion: str
    confidence: float
    timestamp: float
    events: List[str] = []  # Audio events like Speech, Laughter, etc.


class TranscriptionSegment(BaseModel):
    """Transcription segment with timing"""
    text: str
    start: float
    end: float


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
    facial_emotions: Optional[List[EmotionData]] = None
    dominant_facial_emotion: Optional[DominantEmotion] = None
    speech_emotions: Optional[List[SpeechEmotionData]] = None
    audio_events: Optional[List[str]] = None
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


class SavedVideo(BaseModel):
    """Saved video metadata"""
    id: str
    filename: str
    size: int
    created_at: datetime
    has_analysis: bool
    analysis_status: Optional[str] = None


class SavedVideosResponse(BaseModel):
    """Response for saved videos list"""
    videos: List[SavedVideo]


class DeleteResponse(BaseModel):
    """Response for delete operation"""
    message: str
    id: str

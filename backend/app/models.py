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


class Theme(BaseModel):
    """A single theme extracted from transcription"""
    name: str


class ThematicAnalysis(BaseModel):
    """Complete thematic analysis result"""
    themes: List[Theme] = []
    summary: str
    success: bool = True
    error: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    id: str
    status: AnalysisStatus
    transcription: Optional[Transcription] = None
    facial_emotions: Optional[List[EmotionData]] = None
    dominant_facial_emotion: Optional[DominantEmotion] = None
    speech_emotions: Optional[List[SpeechEmotionData]] = None
    audio_events: Optional[List[str]] = None
    thematic_analysis: Optional[ThematicAnalysis] = None
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


class UserProfile(BaseModel):
    """User profile information"""
    name: str
    goals: Optional[str] = None
    preferences: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class UserProfileResponse(BaseModel):
    """User profile response"""
    name: str
    goals: Optional[str] = None
    preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_entries: int
    emotions_distribution: dict  # {"happy": 5, "sad": 3, ...}
    recent_entries: List[SavedVideo]
    all_entries: List[SavedVideo]  # All video entries
    total_recording_time: float  # in seconds


class CalendarEntry(BaseModel):
    """Calendar entry for a specific date"""
    date: str  # ISO date format (YYYY-MM-DD)
    count: int  # Number of entries on this date


class CalendarResponse(BaseModel):
    """Calendar data response"""
    entries: List[CalendarEntry]


class EmotionTrend(BaseModel):
    """Emotion trend data point"""
    date: str  # ISO date format (YYYY-MM-DD)
    emotion: str
    average_confidence: float
    count: int


class EmotionTrendsResponse(BaseModel):
    """Emotion trends response"""
    trends: List[EmotionTrend]

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Affective Computing API"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    TEMP_DIR: str = "temp"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # SenseVoice Configuration (replaces Whisper)
    SENSEVOICE_MODEL: str = "iic/SenseVoiceSmall"  # Model from ModelScope
    SENSEVOICE_DEVICE: str = "cpu"  # cuda:0 or cpu (default: cpu for compatibility)
    SENSEVOICE_VAD_MODEL: str = "fsmn-vad"  # Voice Activity Detection model
    SENSEVOICE_MAX_SEGMENT_TIME: int = 30000  # Max segment time in ms
    SENSEVOICE_LANGUAGE: str = "auto"  # auto, zh, en, yue, ja, ko, nospeech
    SENSEVOICE_USE_ITN: bool = True  # Inverse Text Normalization
    
    # DeepFace Configuration (for facial emotion recognition)
    DEEPFACE_BACKEND: str = "opencv"  # opencv, ssd, dlib, mtcnn, retinaface
    DEEPFACE_MODEL: str = "Facenet"  # VGG-Face, Facenet, OpenFace, DeepFace, DeepID, ArcFace
    
    # Processing
    FRAME_SAMPLE_RATE: int = 30  # Analyze every Nth frame
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

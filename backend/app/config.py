from pydantic_settings import BaseSettings
from typing import List, Union
from pathlib import Path
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Affective Computing API"
    
    # CORS - can be either a comma-separated string or a list
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
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
    
    # Ollama Configuration (for thematic coding)
    OLLAMA_BASE_URL: str = "http://localhost:11434"  # Default Ollama endpoint
    OLLAMA_MODEL: str = "llama3.2"  # Default model, can be changed to llama3, mistral, etc.
    OLLAMA_TIMEOUT: float = 120.0  # Timeout in seconds
    
    # Server Configuration (optional, mainly for documentation)
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

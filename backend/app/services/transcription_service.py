import whisper
from pathlib import Path
from typing import Dict, Any, List
import logging

from app.config import settings
from app.utils.audio_extractor import AudioExtractor


logger = logging.getLogger(__name__)


class TranscriptionService:
    """Service for speech-to-text transcription using Whisper"""
    
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        try:
            logger.info(f"Loading Whisper model: {settings.WHISPER_MODEL}")
            self.model = whisper.load_model(
                settings.WHISPER_MODEL,
                device=settings.WHISPER_DEVICE
            )
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise
    
    async def transcribe_video(self, video_path: str) -> Dict[str, Any]:
        """
        Transcribe audio from video file
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with transcription results
        """
        try:
            # Extract audio from video
            logger.info(f"Extracting audio from: {video_path}")
            audio_extractor = AudioExtractor()
            audio_path = await audio_extractor.extract_audio(video_path)
            
            # Transcribe audio
            logger.info(f"Transcribing audio: {audio_path}")
            result = self.model.transcribe(
                audio_path,
                fp16=False,  # Use FP32 for CPU
                verbose=False,
            )
            
            # Format segments
            segments = []
            for segment in result.get("segments", []):
                segments.append({
                    "text": segment["text"].strip(),
                    "start": segment["start"],
                    "end": segment["end"],
                    "confidence": segment.get("no_speech_prob", 0.0),
                })
            
            transcription_result = {
                "text": result["text"].strip(),
                "language": result.get("language", "en"),
                "segments": segments,
            }
            
            logger.info("Transcription completed successfully")
            return transcription_result
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise
        finally:
            # Clean up audio file
            if audio_path and Path(audio_path).exists():
                Path(audio_path).unlink()

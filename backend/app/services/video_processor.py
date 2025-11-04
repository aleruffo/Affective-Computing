from typing import Dict, Any
import logging

from app.services.transcription_service import TranscriptionService
from app.services.emotion_service import EmotionService


logger = logging.getLogger(__name__)


class VideoProcessor:
    """Main video processing orchestrator"""
    
    def __init__(self):
        self.transcription_service = TranscriptionService()
        self.emotion_service = EmotionService()
    
    async def process_video(self, video_path: str) -> Dict[str, Any]:
        """
        Process video file - extract transcription and emotions
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with complete analysis results
        """
        try:
            logger.info(f"Processing video: {video_path}")
            
            result = {}
            
            # Run transcription
            try:
                transcription = await self.transcription_service.transcribe_video(video_path)
                result["transcription"] = transcription
            except Exception as e:
                logger.error(f"Transcription failed: {e}")
                result["transcription"] = None
            
            # Run emotion analysis
            try:
                emotions = await self.emotion_service.analyze_emotions(video_path)
                result["emotions"] = emotions.get("emotions")
                result["dominant_emotion"] = emotions.get("dominant_emotion")
            except Exception as e:
                logger.error(f"Emotion analysis failed: {e}")
                result["emotions"] = None
                result["dominant_emotion"] = None
            
            logger.info("Video processing completed")
            return result
            
        except Exception as e:
            logger.error(f"Video processing failed: {e}")
            raise

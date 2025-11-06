from typing import Dict, Any
import logging

from app.services.sensevoice_service import SenseVoiceService
from app.services.emotion_service import EmotionService


logger = logging.getLogger(__name__)


class VideoProcessor:
    """Main video processing orchestrator"""
    
    def __init__(self):
        self.sensevoice_service = SenseVoiceService()
        self.emotion_service = EmotionService()
    
    async def process_video(self, video_path: str) -> Dict[str, Any]:
        """
        Process video file - extract transcription, speech emotions, and facial emotions
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with complete analysis results
        """
        try:
            logger.info(f"Processing video: {video_path}")
            
            result = {}
            
            # Run SenseVoice for speech recognition and speech emotion recognition
            try:
                logger.info("Starting SenseVoice processing...")
                sensevoice_result = await self.sensevoice_service.process_audio(video_path)
                logger.info(f"SenseVoice result: {sensevoice_result}")
                result["transcription"] = sensevoice_result.get("transcription")
                result["speech_emotions"] = sensevoice_result.get("speech_emotions", [])
                result["audio_events"] = sensevoice_result.get("audio_events", [])
                logger.info(f"Speech emotions detected: {len(result['speech_emotions'])}")
                logger.info(f"Audio events detected: {result['audio_events']}")
            except Exception as e:
                logger.error(f"SenseVoice processing failed: {e}", exc_info=True)
                result["transcription"] = None
                result["speech_emotions"] = []
                result["audio_events"] = []
            
            # Run DeepFace for facial emotion analysis
            try:
                logger.info("Starting DeepFace processing...")
                emotions = await self.emotion_service.analyze_emotions(video_path)
                logger.info(f"DeepFace result: {emotions}")
                result["facial_emotions"] = emotions.get("emotions")
                result["dominant_facial_emotion"] = emotions.get("dominant_emotion")
                if result["facial_emotions"]:
                    logger.info(f"Facial emotions detected: {len(result['facial_emotions'])}")
                else:
                    logger.warning("No facial emotions detected")
            except Exception as e:
                logger.error(f"Facial emotion analysis failed: {e}", exc_info=True)
                result["facial_emotions"] = None
                result["dominant_facial_emotion"] = None
            
            logger.info("Video processing completed")
            logger.info(f"Final result keys: {result.keys()}")
            return result
            
        except Exception as e:
            logger.error(f"Video processing failed: {e}")
            raise

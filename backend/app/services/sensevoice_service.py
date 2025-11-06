from funasr import AutoModel
from funasr.utils.postprocess_utils import rich_transcription_postprocess
from pathlib import Path
from typing import Dict, Any, List
import logging

from app.config import settings
from app.utils.audio_extractor import AudioExtractor


logger = logging.getLogger(__name__)


class SenseVoiceService:
    """
    Unified service for multilingual speech recognition and speech emotion recognition using SenseVoice.
    
    SenseVoice is a speech foundation model that provides:
    - Automatic Speech Recognition (ASR) for 50+ languages
    - Speech Emotion Recognition (SER)
    - Audio Event Detection (AED)
    - Language Identification (LID)
    """
    
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load SenseVoice model with VAD (Voice Activity Detection)"""
        try:
            logger.info(f"Loading SenseVoice model: {settings.SENSEVOICE_MODEL}")
            logger.info(f"Using device: {settings.SENSEVOICE_DEVICE}")
            
            # Load model without remote_code to avoid model.py dependency
            self.model = AutoModel(
                model=settings.SENSEVOICE_MODEL,
                vad_model=settings.SENSEVOICE_VAD_MODEL,
                vad_kwargs={"max_single_segment_time": settings.SENSEVOICE_MAX_SEGMENT_TIME},
                device=settings.SENSEVOICE_DEVICE,
            )
            
            logger.info("SenseVoice model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load SenseVoice model: {e}")
            raise
    
    def _parse_emotion_from_text(self, text: str) -> str:
        """
        Parse emotion tag from SenseVoice output.
        SenseVoice includes emotion tags like <|HAPPY|>, <|ANGRY|>, <|NEUTRAL|>, etc.
        """
        emotion_tags = {
            "<|HAPPY|>": "happy",
            "<|ANGRY|>": "angry",
            "<|NEUTRAL|>": "neutral",
            "<|SAD|>": "sad",
            "<|FEARFUL|>": "fear",
            "<|DISGUSTED|>": "disgust",
            "<|SURPRISED|>": "surprise",
        }
        
        for tag, emotion in emotion_tags.items():
            if tag in text:
                return emotion
        
        return "neutral"  # Default emotion
    
    def _parse_events_from_text(self, text: str) -> List[str]:
        """
        Parse audio event tags from SenseVoice output.
        Events include: <|Speech|>, <|Applause|>, <|Laughter|>, <|Crying|>, <|Coughing|>, <|Sneezing|>, etc.
        """
        event_tags = [
            "<|Speech|>", "<|Applause|>", "<|Laughter|>", "<|Crying|>", 
            "<|Coughing|>", "<|Sneezing|>", "<|BGM|>"
        ]
        
        detected_events = []
        for tag in event_tags:
            if tag in text:
                # Remove angle brackets and pipes
                event_name = tag.replace("<|", "").replace("|>", "")
                detected_events.append(event_name)
        
        return detected_events
    
    def _clean_text(self, text: str) -> str:
        """
        Remove all special tags from text to get clean transcription.
        """
        import re
        # Remove all tags in the format <|...|>
        clean = re.sub(r'<\|[^|]+\|>', '', text)
        return clean.strip()
    
    async def process_audio(self, video_path: str) -> Dict[str, Any]:
        """
        Process audio from video file - performs speech recognition and emotion recognition.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with transcription, speech emotions, and audio events
        """
        try:
            # Extract audio from video
            logger.info(f"Extracting audio from: {video_path}")
            audio_extractor = AudioExtractor()
            audio_path = await audio_extractor.extract_audio(video_path)
            
            # Process with SenseVoice
            logger.info(f"Processing audio with SenseVoice: {audio_path}")
            
            result = self.model.generate(
                input=audio_path,
                cache={},
                language=settings.SENSEVOICE_LANGUAGE,  # auto, zh, en, yue, ja, ko, nospeech
                use_itn=settings.SENSEVOICE_USE_ITN,
                batch_size_s=60,
                merge_vad=True,
                merge_length_s=15,
            )
            
            # Process results
            if not result or len(result) == 0:
                logger.warning("No results from SenseVoice")
                return {
                    "transcription": {
                        "text": "",
                        "language": "unknown",
                        "segments": []
                    },
                    "speech_emotions": [],
                    "audio_events": []
                }
            
            # Get raw text with all tags
            raw_text = result[0]["text"]
            
            # Post-process to get rich transcription
            processed_text = rich_transcription_postprocess(raw_text)
            
            logger.info(f"Raw SenseVoice output: {raw_text}")
            logger.info(f"Processed text: {processed_text}")
            logger.info(f"Full result object: {result[0]}")
            
            # Extract information
            clean_text = self._clean_text(processed_text)
            detected_emotion = self._parse_emotion_from_text(raw_text)
            audio_events = self._parse_events_from_text(raw_text)
            
            # Get language if available
            detected_language = "unknown"
            if "language" in result[0]:
                detected_language = result[0]["language"]
            
            # Format segments if available
            segments = []
            if "timestamp" in result[0] and result[0]["timestamp"]:
                for seg in result[0]["timestamp"]:
                    segments.append({
                        "text": self._clean_text(seg[2]) if len(seg) > 2 else "",
                        "start": seg[0] / 1000.0 if len(seg) > 0 else 0.0,  # Convert ms to seconds
                        "end": seg[1] / 1000.0 if len(seg) > 1 else 0.0,
                    })
            else:
                # If no timestamp available, create single segment
                segments.append({
                    "text": clean_text,
                    "start": 0.0,
                    "end": 0.0,
                })
            
            # Format speech emotions
            speech_emotions = []
            if detected_emotion != "neutral" or audio_events:
                speech_emotions.append({
                    "emotion": detected_emotion,
                    "confidence": 0.8,  # SenseVoice doesn't provide confidence scores
                    "timestamp": 0.0,
                    "events": audio_events,
                })
            
            transcription_result = {
                "transcription": {
                    "text": clean_text,
                    "language": detected_language,
                    "segments": segments,
                },
                "speech_emotions": speech_emotions,
                "audio_events": audio_events,
            }
            
            logger.info("SenseVoice processing completed successfully")
            return transcription_result
            
        except Exception as e:
            logger.error(f"SenseVoice processing failed: {e}")
            raise
        finally:
            # Clean up audio file
            if audio_path and Path(audio_path).exists():
                try:
                    Path(audio_path).unlink()
                except Exception as e:
                    logger.warning(f"Failed to delete audio file: {e}")

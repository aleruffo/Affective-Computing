from deepface import DeepFace
import cv2
from pathlib import Path
from typing import List, Dict, Any
from collections import Counter
import logging
import base64
import numpy as np

from app.config import settings


logger = logging.getLogger(__name__)


class EmotionService:
    """
    Service for facial emotion recognition using DeepFace.
    
    Note: Speech emotion recognition is now handled by SenseVoiceService.
    This service focuses exclusively on visual/facial emotion analysis.
    """
    
    def __init__(self):
        # DeepFace models will be downloaded on first use
        pass
    
    def _frame_to_base64(self, frame: np.ndarray) -> str:
        """Convert frame to base64 encoded JPEG string"""
        try:
            # Resize frame to reduce size (max width 320px)
            height, width = frame.shape[:2]
            if width > 320:
                scale = 320 / width
                new_width = 320
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # Encode to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            # Convert to base64
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            return f"data:image/jpeg;base64,{img_base64}"
        except Exception as e:
            logger.error(f"Failed to encode frame: {e}")
            return None
    
    async def analyze_emotions(self, video_path: str) -> Dict[str, Any]:
        """
        Analyze emotions from video file
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with emotion analysis results
        """
        try:
            logger.info(f"Analyzing emotions from: {video_path}")
            
            # Open video file
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Failed to open video: {video_path}")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            emotions_data: List[Dict[str, Any]] = []
            frame_count = 0
            
            logger.info(f"Video info - FPS: {fps}, Total frames: {total_frames}")
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Sample frames based on FRAME_SAMPLE_RATE
                if frame_count % settings.FRAME_SAMPLE_RATE == 0:
                    try:
                        # Analyze frame for emotions
                        result = DeepFace.analyze(
                            frame,
                            actions=["emotion"],
                            enforce_detection=False,
                            detector_backend=settings.DEEPFACE_BACKEND,
                            silent=True,
                        )
                        
                        # Handle both single face and multiple faces
                        if isinstance(result, list):
                            result = result[0] if result else None
                        
                        if result and "emotion" in result:
                            dominant_emotion = result["dominant_emotion"]
                            emotion_scores = result["emotion"]
                            
                            # Convert all emotion scores to 0-1 range
                            all_emotions = {k: v / 100.0 for k, v in emotion_scores.items()}
                            
                            # Calculate timestamp correctly
                            timestamp = frame_count / fps if fps > 0 else 0
                            
                            # Encode frame to base64
                            frame_image = self._frame_to_base64(frame)
                            
                            emotions_data.append({
                                "emotion": dominant_emotion,
                                "confidence": emotion_scores.get(dominant_emotion, 0) / 100.0,
                                "timestamp": timestamp,
                                "frame": frame_count,
                                "all_emotions": all_emotions,
                                "frame_image": frame_image,
                            })
                    
                    except Exception as e:
                        # No face detected in this frame, skip
                        logger.debug(f"No face detected in frame {frame_count}: {e}")
                        pass
                
                frame_count += 1
            
            cap.release()
            
            # Calculate dominant emotion across video
            dominant_emotion = None
            if emotions_data:
                emotion_counts = Counter([e["emotion"] for e in emotions_data])
                most_common = emotion_counts.most_common(1)[0]
                dominant_emotion = {
                    "emotion": most_common[0],
                    "percentage": (most_common[1] / len(emotions_data)) * 100,
                }
            
            logger.info(f"Emotion analysis completed - {len(emotions_data)} emotions detected")
            
            return {
                "emotions": emotions_data,
                "dominant_emotion": dominant_emotion,
            }
            
        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}")
            raise

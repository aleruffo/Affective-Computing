import ffmpeg
from pathlib import Path
import uuid
import logging

from app.config import settings


logger = logging.getLogger(__name__)


class AudioExtractor:
    """Extract audio from video files using FFmpeg"""
    
    async def extract_audio(self, video_path: str, output_format: str = "wav") -> str:
        """
        Extract audio from video file
        
        Args:
            video_path: Path to input video file
            output_format: Output audio format (wav, mp3, etc.)
            
        Returns:
            Path to extracted audio file
        """
        try:
            # Create temp directory if it doesn't exist
            temp_dir = Path(settings.TEMP_DIR)
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate output path
            audio_filename = f"{uuid.uuid4()}.{output_format}"
            audio_path = temp_dir / audio_filename
            
            logger.info(f"Extracting audio from {video_path} to {audio_path}")
            
            # Extract audio using ffmpeg
            stream = ffmpeg.input(video_path)
            stream = ffmpeg.output(
                stream,
                str(audio_path),
                acodec='pcm_s16le',  # PCM 16-bit little-endian
                ac=1,  # Mono
                ar='16000',  # 16kHz sample rate (good for speech)
                format=output_format,
            )
            
            # Run ffmpeg with overwrite and quiet
            ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
            
            logger.info(f"Audio extraction completed: {audio_path}")
            return str(audio_path)
            
        except ffmpeg.Error as e:
            logger.error(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
            raise Exception(f"Failed to extract audio: {str(e)}")
        except Exception as e:
            logger.error(f"Audio extraction failed: {e}")
            raise

from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import uuid
from pathlib import Path
import aiofiles

from app.models import UploadResponse, AnalysisResponse, AnalysisStatus
from app.services.video_processor import VideoProcessor
from app.config import settings


router = APIRouter()

# In-memory storage for analysis results (use database in production)
analysis_results = {}


@router.post("/upload-video", response_model=UploadResponse)
async def upload_video(video: UploadFile = File(...)):
    """
    Upload a video file for emotion analysis
    """
    try:
        # Validate file
        if not video.content_type.startswith("video/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a video file."
            )
        
        # Generate unique ID
        analysis_id = str(uuid.uuid4())
        
        # Save video file
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / f"{analysis_id}.webm"
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await video.read()
            await out_file.write(content)
        
        # Initialize analysis result
        analysis_results[analysis_id] = {
            "id": analysis_id,
            "status": AnalysisStatus.PROCESSING,
            "created_at": datetime.now(),
            "file_path": str(file_path),
        }
        
        # Start processing in background (in production, use Celery or similar)
        # For now, we'll process synchronously
        try:
            processor = VideoProcessor()
            result = await processor.process_video(str(file_path))
            
            analysis_results[analysis_id].update({
                "status": AnalysisStatus.COMPLETED,
                "transcription": result.get("transcription"),
                "emotions": result.get("emotions"),
                "dominant_emotion": result.get("dominant_emotion"),
            })
        except Exception as e:
            analysis_results[analysis_id].update({
                "status": AnalysisStatus.FAILED,
                "error": str(e),
            })
        
        return UploadResponse(
            id=analysis_id,
            message="Video uploaded successfully and processing started"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    """
    Get analysis results by ID
    """
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    result = analysis_results[analysis_id]
    
    return AnalysisResponse(
        id=result["id"],
        status=result["status"],
        transcription=result.get("transcription"),
        emotions=result.get("emotions"),
        dominant_emotion=result.get("dominant_emotion"),
        created_at=result["created_at"],
        error=result.get("error"),
    )


@router.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

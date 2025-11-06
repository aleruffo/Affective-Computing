from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import uuid
from pathlib import Path
import aiofiles
import os
from typing import List

from app.models import (
    UploadResponse, 
    AnalysisResponse, 
    AnalysisStatus,
    SavedVideosResponse,
    DeleteResponse
)
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
                "facial_emotions": result.get("facial_emotions"),
                "dominant_facial_emotion": result.get("dominant_facial_emotion"),
                "speech_emotions": result.get("speech_emotions"),
                "audio_events": result.get("audio_events"),
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
        facial_emotions=result.get("facial_emotions"),
        dominant_facial_emotion=result.get("dominant_facial_emotion"),
        speech_emotions=result.get("speech_emotions"),
        audio_events=result.get("audio_events"),
        created_at=result["created_at"],
        error=result.get("error"),
    )


@router.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}


@router.get("/saved-videos", response_model=SavedVideosResponse)
async def get_saved_videos():
    """
    Get list of all saved videos in the uploads directory
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        videos = []
        for file_path in upload_dir.glob("*.webm"):
            try:
                stats = file_path.stat()
                video_id = file_path.stem  # filename without extension
                
                # Check if we have analysis results for this video
                analysis = analysis_results.get(video_id)
                
                videos.append({
                    "id": video_id,
                    "filename": file_path.name,
                    "size": stats.st_size,
                    "created_at": datetime.fromtimestamp(stats.st_ctime),
                    "has_analysis": analysis is not None,
                    "analysis_status": analysis.get("status") if analysis else None,
                })
            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
                continue
        
        # Sort by creation time, newest first
        videos.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {"videos": videos}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list videos: {str(e)}")


@router.post("/reanalyze-video/{video_id}", response_model=AnalysisResponse)
async def reanalyze_video(video_id: str):
    """
    Reanalyze an existing video file
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        file_path = upload_dir / f"{video_id}.webm"
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Video file not found")
        
        # Initialize/reset analysis result
        analysis_results[video_id] = {
            "id": video_id,
            "status": AnalysisStatus.PROCESSING,
            "created_at": datetime.now(),
            "file_path": str(file_path),
        }
        
        # Process the video
        try:
            processor = VideoProcessor()
            result = await processor.process_video(str(file_path))
            
            analysis_results[video_id].update({
                "status": AnalysisStatus.COMPLETED,
                "transcription": result.get("transcription"),
                "facial_emotions": result.get("facial_emotions"),
                "dominant_facial_emotion": result.get("dominant_facial_emotion"),
                "speech_emotions": result.get("speech_emotions"),
                "audio_events": result.get("audio_events"),
            })
        except Exception as e:
            analysis_results[video_id].update({
                "status": AnalysisStatus.FAILED,
                "error": str(e),
            })
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
        result = analysis_results[video_id]
        
        return AnalysisResponse(
            id=result["id"],
            status=result["status"],
            transcription=result.get("transcription"),
            facial_emotions=result.get("facial_emotions"),
            dominant_facial_emotion=result.get("dominant_facial_emotion"),
            speech_emotions=result.get("speech_emotions"),
            audio_events=result.get("audio_events"),
            created_at=result["created_at"],
            error=result.get("error"),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reanalysis failed: {str(e)}")


@router.delete("/saved-videos/{video_id}", response_model=DeleteResponse)
async def delete_video(video_id: str):
    """
    Delete a saved video and its analysis results
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        file_path = upload_dir / f"{video_id}.webm"
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Video file not found")
        
        # Delete the file
        file_path.unlink()
        
        # Remove from analysis results if exists
        if video_id in analysis_results:
            del analysis_results[video_id]
        
        return {"message": "Video deleted successfully", "id": video_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete video: {str(e)}")

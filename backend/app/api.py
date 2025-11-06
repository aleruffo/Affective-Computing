from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import uuid
from pathlib import Path
import aiofiles
import os
import json
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


def save_analysis_to_file(analysis_id: str, data: dict):
    """Save analysis results to a JSON file"""
    try:
        results_dir = Path(settings.UPLOAD_DIR) / "results"
        results_dir.mkdir(parents=True, exist_ok=True)
        
        result_file = results_dir / f"{analysis_id}.json"
        
        # Convert datetime objects to ISO format strings
        serializable_data = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                serializable_data[key] = value.isoformat()
            elif key == "file_path":
                continue  # Don't save file path
            else:
                serializable_data[key] = value
        
        with open(result_file, 'w') as f:
            json.dump(serializable_data, f, indent=2)
    except Exception as e:
        print(f"Failed to save analysis to file: {e}")


def load_analysis_from_file(analysis_id: str) -> dict:
    """Load analysis results from a JSON file"""
    try:
        results_dir = Path(settings.UPLOAD_DIR) / "results"
        result_file = results_dir / f"{analysis_id}.json"
        
        if not result_file.exists():
            return None
        
        with open(result_file, 'r') as f:
            data = json.load(f)
        
        # Convert ISO format strings back to datetime
        if "created_at" in data:
            data["created_at"] = datetime.fromisoformat(data["created_at"])
        
        return data
    except Exception as e:
        print(f"Failed to load analysis from file: {e}")
        return None


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
            
            # Save results to file
            save_analysis_to_file(analysis_id, analysis_results[analysis_id])
            
        except Exception as e:
            analysis_results[analysis_id].update({
                "status": AnalysisStatus.FAILED,
                "error": str(e),
            })
            # Save error state to file
            save_analysis_to_file(analysis_id, analysis_results[analysis_id])
        
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
    # Try in-memory first
    if analysis_id in analysis_results:
        result = analysis_results[analysis_id]
    else:
        # Try loading from file
        result = load_analysis_from_file(analysis_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Analysis not found")
        # Cache in memory
        analysis_results[analysis_id] = result
    
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
                if analysis is None:
                    # Try loading from file
                    analysis = load_analysis_from_file(video_id)
                    if analysis:
                        analysis_results[video_id] = analysis
                
                videos.append({
                    "id": video_id,
                    "filename": file_path.name,
                    "size": stats.st_size,
                    "created_at": datetime.fromtimestamp(stats.st_ctime),
                    "has_analysis": analysis is not None and analysis.get("status") == AnalysisStatus.COMPLETED,
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
            
            # Save results to file
            save_analysis_to_file(video_id, analysis_results[video_id])
            
        except Exception as e:
            analysis_results[video_id].update({
                "status": AnalysisStatus.FAILED,
                "error": str(e),
            })
            # Save error state to file
            save_analysis_to_file(video_id, analysis_results[video_id])
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


@router.put("/saved-videos/{video_id}/rename")
async def rename_video(video_id: str, new_filename: dict):
    """
    Rename a saved video file and its analysis results
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        old_file_path = upload_dir / f"{video_id}.webm"
        
        if not old_file_path.exists():
            raise HTTPException(status_code=404, detail="Video file not found")
        
        # Validate new filename
        filename = new_filename.get("filename", "").strip()
        if not filename:
            raise HTTPException(status_code=400, detail="Filename cannot be empty")
        
        # Ensure .webm extension
        if not filename.endswith('.webm'):
            filename += '.webm'
        
        # Generate new ID from filename (without extension)
        new_video_id = filename[:-5]  # Remove .webm
        new_file_path = upload_dir / filename
        
        # Check if new filename already exists
        if new_file_path.exists() and new_video_id != video_id:
            raise HTTPException(status_code=409, detail="A video with this name already exists")
        
        # Rename the video file
        old_file_path.rename(new_file_path)
        
        # Rename analysis result file if it exists
        results_dir = upload_dir / "results"
        old_result_file = results_dir / f"{video_id}.json"
        new_result_file = results_dir / f"{new_video_id}.json"
        
        if old_result_file.exists():
            # Load the analysis data
            analysis_data = load_analysis_from_file(video_id)
            if analysis_data:
                # Update the ID in the analysis data
                analysis_data["id"] = new_video_id
                # Save with new filename
                save_analysis_to_file(new_video_id, analysis_data)
                # Delete old file
                old_result_file.unlink()
        
        # Update in-memory cache
        if video_id in analysis_results:
            analysis_results[new_video_id] = analysis_results.pop(video_id)
            analysis_results[new_video_id]["id"] = new_video_id
        
        return {
            "message": "Video renamed successfully",
            "old_id": video_id,
            "new_id": new_video_id,
            "filename": filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rename video: {str(e)}")


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
        
        # Delete analysis result file
        results_dir = upload_dir / "results"
        result_file = results_dir / f"{video_id}.json"
        if result_file.exists():
            result_file.unlink()
        
        # Remove from analysis results if exists
        if video_id in analysis_results:
            del analysis_results[video_id]
        
        return {"message": "Video deleted successfully", "id": video_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete video: {str(e)}")

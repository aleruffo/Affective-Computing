# Backend Setup Guide

## Prerequisites

- Python 3.9 or higher
- FFmpeg installed on system
- pip

## FFmpeg Installation

### macOS
```bash
brew install ffmpeg
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Windows
Download from https://ffmpeg.org/download.html and add to PATH

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # macOS/Linux
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

6. **Configure environment variables:**
   Edit `.env` as needed (defaults are suitable for development)

## Development

Start the development server:
```bash
uvicorn app.main:app --reload
```

Or use Python directly:
```bash
python -m app.main
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Project Structure

```
backend/
├── app/
│   ├── services/           # Business logic
│   │   ├── transcription_service.py  # Whisper integration
│   │   ├── emotion_service.py        # DeepFace integration
│   │   └── video_processor.py        # Main orchestrator
│   ├── utils/              # Utilities
│   │   └── audio_extractor.py        # FFmpeg wrapper
│   ├── api.py              # API routes
│   ├── config.py           # Configuration
│   ├── models.py           # Pydantic models
│   └── main.py             # Application entry
├── uploads/                # Uploaded videos
├── temp/                   # Temporary files
├── requirements.txt
├── .env.example
└── Dockerfile
```

## API Endpoints

### POST /api/upload-video
Upload a video file for analysis.

**Request:**
- Content-Type: multipart/form-data
- Body: video file

**Response:**
```json
{
  "id": "uuid",
  "message": "Video uploaded successfully"
}
```

### GET /api/analysis/{id}
Get analysis results.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "transcription": {
    "text": "Full transcription...",
    "language": "en",
    "segments": [...]
  },
  "emotions": [...],
  "dominant_emotion": {
    "emotion": "happy",
    "percentage": 65.5
  },
  "created_at": "2024-01-01T00:00:00"
}
```

### GET /api/health
Health check endpoint.

## Configuration

### Whisper Models
Available models (trade-off between speed and accuracy):
- `tiny`: Fastest, least accurate
- `base`: Good balance (default)
- `small`: Better accuracy
- `medium`: High accuracy, slower
- `large`: Best accuracy, very slow

Set in `.env`:
```
WHISPER_MODEL=base
```

### DeepFace Backends
Available detection backends:
- `opencv`: Fast, good for most cases (default)
- `ssd`: More accurate
- `mtcnn`: High accuracy
- `retinaface`: Best accuracy

Set in `.env`:
```
DEEPFACE_BACKEND=opencv
```

### Frame Sampling
Analyze every Nth frame (lower = more accurate but slower):
```
FRAME_SAMPLE_RATE=30
```

## Performance Optimization

### GPU Acceleration
To use GPU for Whisper:
1. Install CUDA-enabled PyTorch
2. Set `WHISPER_DEVICE=cuda` in `.env`

### Memory Management
For large videos, consider:
- Reducing `FRAME_SAMPLE_RATE`
- Using smaller Whisper model
- Processing videos in chunks

## Troubleshooting

### FFmpeg Not Found
```bash
# Verify installation
ffmpeg -version

# Check PATH
which ffmpeg  # macOS/Linux
where ffmpeg  # Windows
```

### Model Download Issues
First run will download ML models (~1-2GB):
- Whisper models: `~/.cache/whisper/`
- DeepFace models: `~/.deepface/weights/`

### Memory Errors
- Reduce Whisper model size
- Increase system swap space
- Process shorter videos

### Import Errors
```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

## Production Deployment

1. **Use production ASGI server:**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Set environment to production:**
   - Disable auto-reload
   - Use production-grade storage (S3, etc.)
   - Implement proper logging
   - Use task queue (Celery) for async processing

3. **Security:**
   - Validate file types strictly
   - Limit file sizes
   - Implement rate limiting
   - Use proper authentication

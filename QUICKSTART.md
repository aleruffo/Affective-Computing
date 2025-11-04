# Quick Start Guide

This guide will help you get the Affective Computing platform up and running quickly.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Python 3.9+ installed
- ✅ FFmpeg installed
- ✅ Git (optional, for cloning)

## Option 1: Docker (Recommended)

The easiest way to run the entire stack:

```bash
# Build and start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Option 2: Manual Setup

### Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start server
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`

### Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## First Run

1. **Open your browser** to `http://localhost:3000`

2. **Grant permissions** when prompted for camera and microphone access

3. **Record a video:**
   - Click "Start Recording"
   - Speak and show emotions to the camera
   - Click "Stop" when done

4. **Analyze the video:**
   - Click "Analyze Emotion"
   - Wait for processing (may take 30-60 seconds)

5. **View results:**
   - See transcribed speech
   - View detected emotions over time
   - Check dominant emotion

## What Gets Analyzed

### Speech Transcription (Whisper)
- Converts speech to text
- Detects language automatically
- Provides word-level timestamps
- Shows confidence scores

### Emotion Recognition (DeepFace)
- Analyzes facial expressions
- Detects 7 emotions: happy, sad, angry, fear, surprise, disgust, neutral
- Samples frames throughout video
- Calculates dominant emotion

## System Requirements

### Minimum
- 4GB RAM
- 2 CPU cores
- 2GB free disk space

### Recommended
- 8GB+ RAM
- 4+ CPU cores
- 5GB+ free disk space
- GPU (optional, for faster processing)

## Common Issues

### Camera Not Working
- Grant browser permissions
- Use HTTPS or localhost
- Check if camera is in use by another app

### Slow Processing
- Use smaller Whisper model (change `WHISPER_MODEL=tiny` in backend/.env)
- Reduce frame sampling (change `FRAME_SAMPLE_RATE=60` in backend/.env)
- Record shorter videos (30-60 seconds recommended)

### Backend Errors
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check Python version: `python --version` (needs 3.9+)
- Verify all dependencies installed

### Frontend Connection Issues
- Check backend is running on port 8000
- Verify VITE_API_URL in frontend/.env
- Check browser console for errors

## Testing the API

You can test the API directly at `http://localhost:8000/docs`

This provides an interactive Swagger UI where you can:
- Upload videos
- Check analysis status
- View all available endpoints

## Next Steps

- Read the full [Backend README](./backend/README.md) for configuration options
- Read the full [Frontend README](./frontend/README.md) for component details
- Customize emotion detection settings
- Adjust transcription model for your needs

## Performance Tips

1. **For faster processing:**
   - Use `WHISPER_MODEL=tiny` (less accurate but fast)
   - Increase `FRAME_SAMPLE_RATE` (e.g., 60 for every 60th frame)

2. **For better accuracy:**
   - Use `WHISPER_MODEL=medium` or `large`
   - Decrease `FRAME_SAMPLE_RATE` (e.g., 15 for every 15th frame)
   - Use `DEEPFACE_BACKEND=retinaface`

3. **For production:**
   - Use task queue (Celery) for async processing
   - Implement cloud storage for videos
   - Add authentication and rate limiting
   - Use GPU acceleration if available

## Stopping the Application

### Docker
```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Manual
Press `Ctrl+C` in both terminal windows

## Getting Help

- Check the API documentation: http://localhost:8000/docs
- Review backend logs for errors
- Check browser console for frontend issues
- Ensure all prerequisites are installed

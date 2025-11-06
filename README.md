# Affective Computing - Video Emotion Analysis Platform

A full-stack application for capturing video/audio and analyzing emotional content through speech and facial expression analysis.

## 🎯 Overview

This platform combines React + TypeScript frontend with Python FastAPI backend to provide real-time video recording and AI-powered emotion analysis:

- **Frontend**: React 18 + TypeScript + Vite with MediaStream API for video/audio recording
- **Backend**: Python FastAPI with ML models for emotion analysis
  - **SenseVoice** for multilingual speech recognition and speech emotion recognition (50+ languages)
  - **DeepFace** for facial emotion recognition (7 emotions: happy, sad, angry, fear, surprise, disgust, neutral)
  - FFmpeg for audio extraction and processing

## ✨ Features

- 🎥 **Real-time Video Recording** - Browser-based capture with start, pause, resume, stop controls
- 🗣️ **Multilingual Speech Recognition** - 50+ languages supported with SenseVoice
- 🎭 **Dual Emotion Recognition** - Both speech and facial emotion analysis
- 🔊 **Audio Event Detection** - Detects laughter, applause, crying, and more
- 📊 **Rich Visualizations** - Emotion timeline, transcription segments, confidence scores
- 🔄 **Async Processing** - Non-blocking video analysis with progress tracking
- ⚡ **High Performance** - SenseVoice is 15x faster than Whisper-Large
- 🎨 **Modern UI** - Responsive design with dark mode support
- 🐳 **Docker Support** - One-command deployment with Docker Compose
- 📝 **Type Safety** - Full TypeScript (frontend) + Pydantic (backend)

## �📁 Project Structure

```
affective-computing/
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # VideoRecorder, AnalysisResults
│   │   ├── hooks/                # useMediaRecorder (custom hook)
│   │   ├── services/             # API client (Axios)
│   │   ├── types/                # TypeScript definitions
│   │   ├── App.tsx               # Main component
│   │   └── main.tsx              # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .env.example
│
├── backend/                       # Python FastAPI
│   ├── app/
│   │   ├── services/
│   │   │   ├── sensevoice_service.py       # SenseVoice integration (ASR + SER)
│   │   │   ├── emotion_service.py          # DeepFace integration (facial)
│   │   │   └── video_processor.py          # Main orchestrator
│   │   ├── utils/
│   │   │   └── audio_extractor.py          # FFmpeg wrapper
│   │   ├── api.py                # API routes
│   │   ├── main.py               # FastAPI app
│   │   ├── config.py             # Configuration
│   │   └── models.py             # Pydantic models
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml            # Docker orchestration
├── setup.sh                      # Automated setup script
└── .gitignore
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+
- Python 3.9+
- FFmpeg

**Install FFmpeg:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

#### Automated Setup
```bash
./setup.sh
```

#### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🎬 How to Use

1. **Open the application** at `http://localhost:3000`
2. **Grant camera/microphone permissions** when prompted
3. **Record a video:**
   - Click "Start Recording"
   - Speak and show emotions to camera
   - Click "Stop" when done (30-60 seconds recommended)
4. **Analyze:**
   - Click "Analyze Emotion"
   - Wait for processing (30-60 seconds)
5. **View results:**
   - See full speech transcription with timestamps
   - View detected emotions over time
   - Check dominant emotion statistics

## 🔧 Configuration

### Backend Environment Variables (`.env`)

```bash
# SenseVoice Configuration
SENSEVOICE_MODEL=iic/SenseVoiceSmall  # Model from ModelScope
SENSEVOICE_DEVICE=cpu                 # Options: cpu, cuda:0
SENSEVOICE_LANGUAGE=auto              # Options: auto, zh, en, yue, ja, ko
SENSEVOICE_USE_ITN=True               # Inverse Text Normalization

# DeepFace Configuration (for facial emotions)
DEEPFACE_BACKEND=opencv               # Options: opencv, ssd, mtcnn, retinaface
FRAME_SAMPLE_RATE=30                  # Analyze every Nth frame

# Server
PORT=8000
HOST=0.0.0.0
```

### Performance Tuning

**For faster processing:**
```bash
SENSEVOICE_DEVICE=cuda:0  # Use GPU if available
FRAME_SAMPLE_RATE=60
DEEPFACE_BACKEND=opencv
```

**For better accuracy:**
```bash
FRAME_SAMPLE_RATE=15
DEEPFACE_BACKEND=retinaface
```

**Balanced (recommended):**
```bash
SENSEVOICE_DEVICE=cpu
FRAME_SAMPLE_RATE=30
DEEPFACE_BACKEND=opencv
```

## 📚 API Documentation

### Endpoints

#### `POST /api/upload-video`
Upload a video file for analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `video` file

**Response:**
```json
{
  "id": "uuid",
  "message": "Video uploaded successfully"
}
```

#### `GET /api/analysis/{id}`
Get analysis results.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "transcription": {
    "text": "Full transcription...",
    "language": "en",
    "segments": [
      {
        "text": "Segment text",
        "start": 0.0,
        "end": 2.5
      }
    ]
  },
  "speech_emotions": [
    {
      "emotion": "happy",
      "confidence": 0.8,
      "timestamp": 0.0,
      "events": ["Speech", "Laughter"]
    }
  ],
  "audio_events": ["Speech", "Laughter"],
  "facial_emotions": [
    {
      "emotion": "happy",
      "confidence": 0.85,
      "timestamp": 1.5,
      "frame": 45,
      "all_emotions": {
        "happy": 0.85,
        "neutral": 0.10,
        "surprise": 0.05
      }
    }
  ],
  "dominant_facial_emotion": {
    "emotion": "happy",
    "percentage": 65.5
  },
  "created_at": "2024-01-01T00:00:00"
}
```

#### `GET /api/health`
Health check endpoint.

**Interactive API Docs:** `http://localhost:8000/docs`

## 🏗️ Architecture

### Data Flow

```
User Records Video (MediaStream API)
    ↓
Upload to Backend (Axios)
    ↓
Video Processing Pipeline
    ├─→ Audio Extraction (FFmpeg)
    │       ↓
    │   Speech Recognition & Emotion (SenseVoice)
    │
    └─→ Frame Sampling (OpenCV)
            ↓
        Facial Emotion Detection (DeepFace)
    ↓
Results Stored & Returned
    ↓
Frontend Displays Results
```

### Key Components

**Frontend:**
- `VideoRecorder` - Manages recording with MediaStream API
- `AnalysisResults` - Displays transcription and emotion data
- `useMediaRecorder` - Custom hook for recording state management
- `api.ts` - Axios client for backend communication

**Backend:**
- `VideoProcessor` - Orchestrates analysis pipeline
- `SenseVoiceService` - Speech recognition + speech emotion recognition
- `EmotionService` - DeepFace facial emotion detection
- `AudioExtractor` - FFmpeg wrapper for audio extraction

## � Troubleshooting

### Camera/Microphone Issues
- Grant browser permissions
- Use HTTPS or localhost
- Check if camera is in use by another app

### Slow Processing
- Use smaller Whisper model: `WHISPER_MODEL=tiny`
- Increase frame sampling: `FRAME_SAMPLE_RATE=60`
- Record shorter videos (30-60 seconds)

### Backend Errors
```bash
# Verify FFmpeg installation
ffmpeg -version

# Check Python version
python --version  # Needs 3.9+

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

### Frontend Issues
- Check backend is running on port 8000
- Verify `VITE_API_URL` in frontend/.env
- Clear browser cache and reload

## 🧪 API Usage Examples

### Using cURL

```bash
# Upload video
curl -X POST http://localhost:8000/api/upload-video \
  -F "video=@recording.webm"

# Get results
curl http://localhost:8000/api/analysis/{id}
```

### Using Python

```python
import requests
import time

# Upload
with open('recording.webm', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/upload-video',
        files={'video': f}
    )
    analysis_id = response.json()['id']

# Poll for results
while True:
    response = requests.get(f'http://localhost:8000/api/analysis/{analysis_id}')
    result = response.json()
    
    if result['status'] == 'completed':
        print(result['transcription']['text'])
        print(result['dominant_facial_emotion'])
        print(result['speech_emotions'])
        print(result['audio_events'])
        break
    
    time.sleep(2)
```

### Using JavaScript

```javascript
// Upload video
const uploadVideo = async (blob) => {
  const formData = new FormData();
  formData.append('video', blob, 'recording.webm');
  
  const response = await fetch('http://localhost:8000/api/upload-video', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// Get results
const getResults = async (id) => {
  const response = await fetch(`http://localhost:8000/api/analysis/${id}`);
  return response.json();
};
```

## � Security Considerations

**Current State:** Development-ready

**For Production:**
- ✅ Add authentication (JWT/OAuth2)
- ✅ Use database for persistent storage (PostgreSQL/MongoDB)
- ✅ Implement task queue (Celery) for async processing
- ✅ Use cloud storage (S3) for videos
- ✅ Add rate limiting
- ✅ Enable HTTPS
- ✅ Implement input validation
- ✅ Add monitoring and logging

## 📊 Technology Stack

**Frontend:**
- React 18, TypeScript, Vite
- Axios, MediaStream API
- CSS3 with animations

**Backend:**
- Python 3.9+, FastAPI, Uvicorn
- SenseVoice (FunASR), DeepFace
- FFmpeg, OpenCV, TensorFlow, PyTorch

**DevOps:**
- Docker, Docker Compose
- Git, GitHub

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style:**
- Frontend: Follow TypeScript/React best practices
- Backend: Follow PEP 8 Python style guide
- Add tests for new features
- Update documentation as needed

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🎓 Use Cases

- Customer feedback analysis
- Student presentation evaluation
- Mental health monitoring
- Video conference engagement tracking
- Educational content assessment
- User experience research

## 🌟 Acknowledgments

- SenseVoice (FunAudioLLM) for multilingual speech recognition and emotion detection
- DeepFace for facial emotion detection
- FastAPI for the excellent web framework
- React team for the UI library

## 📚 Additional Documentation

- [SenseVoice Migration Guide](./SENSEVOICE_MIGRATION.md) - Detailed migration documentation

---

**Built with ❤️ for Affective Computing research and applications**

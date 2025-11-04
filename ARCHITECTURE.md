# Architecture Documentation

## System Overview

The Affective Computing platform is a full-stack application designed to capture video/audio and analyze emotional content through speech and facial expression analysis.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         React Frontend (Port 3000)                │  │
│  │  - MediaStream API for video capture              │  │
│  │  - Real-time recording interface                  │  │
│  │  - Results visualization                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼─────────────────────────────┐
│              FastAPI Backend (Port 8000)               │
│  ┌──────────────────────────────────────────────┐    │
│  │              API Layer                        │    │
│  │  - /api/upload-video                         │    │
│  │  - /api/analysis/{id}                        │    │
│  │  - /api/health                               │    │
│  └──────────────────────────────────────────────┘    │
│                        │                               │
│  ┌──────────────────────▼─────────────────────────┐  │
│  │         Video Processing Pipeline             │  │
│  │                                                │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │  1. FFmpeg Audio Extraction             │ │  │
│  │  │     - Extract audio track               │ │  │
│  │  │     - Convert to WAV (16kHz, mono)     │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                  │                            │  │
│  │  ┌───────────────▼─────────────────────────┐ │  │
│  │  │  2. Whisper Transcription               │ │  │
│  │  │     - Load pre-trained model            │ │  │
│  │  │     - Transcribe speech to text         │ │  │
│  │  │     - Generate timestamps & confidence  │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                                │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │  3. DeepFace Emotion Analysis           │ │  │
│  │  │     - Extract frames from video         │ │  │
│  │  │     - Detect faces in frames            │ │  │
│  │  │     - Classify emotions                 │ │  │
│  │  │     - Calculate dominant emotion        │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │            Storage Layer                        │  │
│  │  - uploads/   (video files)                    │  │
│  │  - temp/      (extracted audio)                │  │
│  │  - In-memory  (analysis results cache)         │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **MediaStream API**: Video/audio capture
- **CSS3**: Styling with flexbox and grid

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **OpenAI Whisper**: Speech-to-text
- **DeepFace**: Facial emotion recognition
- **FFmpeg-Python**: Video processing
- **OpenCV**: Computer vision (via DeepFace)
- **TensorFlow**: ML framework (via DeepFace)

## Data Flow

### Recording Flow
```
1. User clicks "Start Recording"
   └─> Browser requests camera/microphone access
       └─> MediaStream created
           └─> MediaRecorder starts capturing
               └─> Blob chunks collected
                   └─> User clicks "Stop"
                       └─> Blob combined into video file
```

### Analysis Flow
```
1. User clicks "Analyze Emotion"
   └─> Frontend uploads video (POST /api/upload-video)
       └─> Backend saves video to uploads/
           └─> VideoProcessor.process_video() starts
               │
               ├─> TranscriptionService
               │   └─> AudioExtractor extracts audio
               │       └─> Whisper transcribes
               │           └─> Returns text + segments
               │
               └─> EmotionService
                   └─> Opens video with OpenCV
                       └─> Samples frames (every Nth)
                           └─> DeepFace analyzes each frame
                               └─> Returns emotions + dominant
               
           └─> Results stored in memory
               └─> Frontend polls GET /api/analysis/{id}
                   └─> Results displayed to user
```

## Component Details

### Frontend Components

#### VideoRecorder
- Manages MediaStream lifecycle
- Handles recording state (idle, recording, paused)
- Displays video preview
- Uploads recorded video
- Polls for analysis results

#### AnalysisResults
- Displays transcription text
- Shows transcription segments with timestamps
- Visualizes emotion timeline
- Highlights dominant emotion

#### useMediaRecorder Hook
- Encapsulates MediaRecorder logic
- Manages recording state
- Handles browser compatibility
- Provides recording controls

### Backend Services

#### TranscriptionService
- Loads Whisper model on startup
- Manages model caching
- Processes audio files
- Returns structured transcription data

#### EmotionService
- Samples video frames efficiently
- Uses DeepFace for emotion detection
- Aggregates results
- Calculates statistics

#### VideoProcessor
- Orchestrates transcription and emotion analysis
- Handles errors gracefully
- Returns unified results

#### AudioExtractor
- Wraps FFmpeg functionality
- Extracts audio tracks
- Converts to optimal format for Whisper
- Manages temporary files

## Performance Considerations

### Frontend
- **Chunked Recording**: MediaRecorder collects data every 100ms
- **Efficient Polling**: 2-second intervals for status checks
- **Blob Management**: Clean URLs to prevent memory leaks

### Backend
- **Frame Sampling**: Analyze every Nth frame (configurable)
- **Model Caching**: Load ML models once at startup
- **Async Processing**: Use async/await for I/O operations
- **Temporary File Cleanup**: Remove audio files after transcription

## Security Considerations

### Current Implementation (Development)
- No authentication
- In-memory storage
- Local file system
- CORS enabled for localhost

### Production Recommendations
1. **Authentication**: Implement JWT or OAuth2
2. **Storage**: Use S3 or similar cloud storage
3. **Database**: Store analysis results in PostgreSQL/MongoDB
4. **Rate Limiting**: Prevent abuse
5. **File Validation**: Strict video format checking
6. **Size Limits**: Enforce maximum upload sizes
7. **HTTPS**: Always use encrypted connections
8. **API Keys**: Secure sensitive endpoints

## Scalability

### Current Limitations
- Synchronous processing blocks API
- In-memory storage limited to single instance
- No distributed processing

### Scaling Strategies
1. **Task Queue**: Use Celery with Redis/RabbitMQ
2. **Worker Processes**: Separate API and processing
3. **Database**: PostgreSQL with analysis results table
4. **Caching**: Redis for intermediate results
5. **Load Balancer**: Nginx for multiple API instances
6. **GPU Processing**: Use CUDA for faster inference
7. **Microservices**: Split transcription and emotion services

## Error Handling

### Frontend
- Permission errors (camera/microphone)
- Upload failures
- Network timeouts
- Invalid responses

### Backend
- Invalid video formats
- Missing faces in video
- Transcription failures
- Model loading errors
- FFmpeg errors

## Configuration

### Whisper Models
| Model  | Speed    | Accuracy | Size  |
|--------|----------|----------|-------|
| tiny   | Fastest  | Low      | 39M   |
| base   | Fast     | Good     | 74M   |
| small  | Medium   | Better   | 244M  |
| medium | Slow     | High     | 769M  |
| large  | Slowest  | Best     | 1550M |

### DeepFace Backends
| Backend    | Speed    | Accuracy |
|------------|----------|----------|
| opencv     | Fastest  | Good     |
| ssd        | Fast     | Better   |
| mtcnn      | Medium   | High     |
| retinaface | Slow     | Best     |

## Testing Strategy

### Frontend Testing
- Unit tests for hooks
- Component tests with React Testing Library
- E2E tests with Playwright
- Browser compatibility testing

### Backend Testing
- Unit tests for services
- Integration tests for API endpoints
- Load testing with Locust
- Model accuracy validation

## Deployment

### Docker (Recommended)
```bash
docker-compose up --build
```

### Manual Deployment
1. Set up reverse proxy (Nginx)
2. Configure SSL certificates
3. Set environment variables
4. Start backend with Gunicorn
5. Build and serve frontend
6. Set up monitoring and logging

## Future Enhancements

1. **Real-time Processing**: Stream analysis during recording
2. **Multi-language Support**: UI localization
3. **Advanced Analytics**: Emotion trends, sentiment analysis
4. **User Accounts**: Save analysis history
5. **Batch Processing**: Analyze multiple videos
6. **Export Features**: PDF reports, CSV data
7. **Mobile App**: React Native companion
8. **Live Streaming**: Analyze real-time video feeds

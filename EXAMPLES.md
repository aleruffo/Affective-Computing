# Usage Examples

This document provides practical examples of using the Affective Computing platform.

## Basic Usage

### 1. Start the Application

```bash
# Using Docker (recommended)
docker-compose up --build

# Or manually
# Terminal 1
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

### 2. Record and Analyze

1. Open http://localhost:3000
2. Click "Start Recording"
3. Grant camera/microphone permissions
4. Record 30-60 seconds of video
5. Click "Stop"
6. Click "Analyze Emotion"
7. Wait for results (30-60 seconds)

## API Usage Examples

### Using cURL

#### Upload Video
```bash
curl -X POST http://localhost:8000/api/upload-video \
  -F "video=@recording.webm" \
  -H "Content-Type: multipart/form-data"
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Video uploaded successfully and processing started"
}
```

#### Get Analysis Results
```bash
curl http://localhost:8000/api/analysis/123e4567-e89b-12d3-a456-426614174000
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "transcription": {
    "text": "Hello, this is a test recording for emotion analysis.",
    "language": "en",
    "segments": [
      {
        "text": "Hello, this is a test recording",
        "start": 0.0,
        "end": 2.5,
        "confidence": 0.95
      }
    ]
  },
  "emotions": [
    {
      "emotion": "happy",
      "confidence": 0.85,
      "timestamp": 1.5,
      "frame": 45
    },
    {
      "emotion": "neutral",
      "confidence": 0.78,
      "timestamp": 3.0,
      "frame": 90
    }
  ],
  "dominant_emotion": {
    "emotion": "happy",
    "percentage": 65.5
  },
  "created_at": "2024-01-01T12:00:00"
}
```

### Using Python

```python
import requests

# Upload video
with open('recording.webm', 'rb') as f:
    files = {'video': f}
    response = requests.post('http://localhost:8000/api/upload-video', files=files)
    analysis_id = response.json()['id']

# Get results
import time
while True:
    response = requests.get(f'http://localhost:8000/api/analysis/{analysis_id}')
    result = response.json()
    
    if result['status'] == 'completed':
        print("Transcription:", result['transcription']['text'])
        print("Dominant Emotion:", result['dominant_emotion']['emotion'])
        break
    elif result['status'] == 'failed':
        print("Analysis failed:", result.get('error'))
        break
    
    time.sleep(2)
```

### Using JavaScript/TypeScript

```typescript
// Upload video
const uploadVideo = async (videoBlob: Blob) => {
  const formData = new FormData();
  formData.append('video', videoBlob, 'recording.webm');
  
  const response = await fetch('http://localhost:8000/api/upload-video', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};

// Poll for results
const getAnalysis = async (id: string) => {
  const response = await fetch(`http://localhost:8000/api/analysis/${id}`);
  return response.json();
};

// Usage
const blob = await recordVideo(); // your recording logic
const { id } = await uploadVideo(blob);

const pollInterval = setInterval(async () => {
  const result = await getAnalysis(id);
  
  if (result.status === 'completed') {
    clearInterval(pollInterval);
    console.log('Transcription:', result.transcription.text);
    console.log('Emotions:', result.emotions);
  }
}, 2000);
```

## Configuration Examples

### Fast Processing (Lower Accuracy)

**backend/.env**
```env
WHISPER_MODEL=tiny
FRAME_SAMPLE_RATE=60
DEEPFACE_BACKEND=opencv
```

⚡ **Result**: Very fast processing (~15-20 seconds for 1-minute video)
📊 **Trade-off**: Lower transcription and emotion detection accuracy

### High Accuracy (Slower)

**backend/.env**
```env
WHISPER_MODEL=medium
FRAME_SAMPLE_RATE=15
DEEPFACE_BACKEND=retinaface
```

🎯 **Result**: High-quality results (~60-90 seconds for 1-minute video)
⚡ **Trade-off**: Slower processing

### Balanced (Recommended)

**backend/.env**
```env
WHISPER_MODEL=base
FRAME_SAMPLE_RATE=30
DEEPFACE_BACKEND=opencv
```

⚖️ **Result**: Good balance (~30-45 seconds for 1-minute video)

## Use Case Examples

### 1. Customer Feedback Analysis

```
Scenario: Analyze customer video testimonials
Settings: 
  - WHISPER_MODEL=small (good transcription)
  - FRAME_SAMPLE_RATE=30 (balanced)
  
Workflow:
1. Customer records feedback video
2. System analyzes sentiment through:
   - Speech content (Whisper)
   - Facial expressions (DeepFace)
3. Generate report with emotional insights
```

### 2. Educational Content Evaluation

```
Scenario: Evaluate student presentations
Settings:
  - WHISPER_MODEL=base
  - FRAME_SAMPLE_RATE=45
  
Workflow:
1. Student presents to camera
2. System tracks:
   - Speaking clarity and pace
   - Emotional engagement
   - Confidence levels
3. Provide feedback on presentation skills
```

### 3. Mental Health Monitoring

```
Scenario: Track emotional well-being over time
Settings:
  - WHISPER_MODEL=medium
  - FRAME_SAMPLE_RATE=20
  
Workflow:
1. Daily check-in video recording
2. Analyze:
   - Emotional state distribution
   - Speech patterns
   - Facial expression changes
3. Generate weekly emotional trends
```

### 4. Video Conference Analysis

```
Scenario: Analyze meeting engagement
Settings:
  - WHISPER_MODEL=base
  - FRAME_SAMPLE_RATE=60 (efficient for long videos)
  
Workflow:
1. Record video conference
2. Analyze:
   - Participant engagement levels
   - Emotional reactions to topics
   - Speaking time distribution
3. Generate meeting insights report
```

## Integration Examples

### React Component Integration

```tsx
import { useState } from 'react';
import VideoRecorder from './components/VideoRecorder';
import AnalysisResults from './components/AnalysisResults';

function MyApp() {
  const [result, setResult] = useState(null);
  
  return (
    <div>
      <VideoRecorder 
        onAnalysisComplete={(data) => setResult(data)}
      />
      {result && <AnalysisResults result={result} />}
    </div>
  );
}
```

### Express.js Backend Integration

```javascript
const express = require('express');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

const app = express();

app.post('/analyze-video', async (req, res) => {
  const form = new FormData();
  form.append('video', fs.createReadStream(req.file.path));
  
  try {
    const response = await axios.post(
      'http://localhost:8000/api/upload-video',
      form,
      { headers: form.getHeaders() }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Python Flask Integration

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    video = request.files['video']
    
    # Upload to analysis service
    files = {'video': video}
    response = requests.post(
        'http://localhost:8000/api/upload-video',
        files=files
    )
    
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(port=5000)
```

## Testing Examples

### Frontend Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import VideoRecorder from './VideoRecorder';

test('starts recording when button clicked', async () => {
  render(<VideoRecorder />);
  
  const button = screen.getByText('Start Recording');
  fireEvent.click(button);
  
  expect(screen.getByText(/REC/)).toBeInTheDocument();
});
```

### Backend Testing

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_upload_video():
    with open("test_video.webm", "rb") as f:
        response = client.post(
            "/api/upload-video",
            files={"video": f}
        )
    assert response.status_code == 200
    assert "id" in response.json()
```

## Performance Monitoring

### Log Analysis Processing Time

```python
import time
import logging

logger = logging.getLogger(__name__)

async def process_video(video_path: str):
    start_time = time.time()
    
    # Process video
    result = await processor.process_video(video_path)
    
    duration = time.time() - start_time
    logger.info(f"Processing completed in {duration:.2f} seconds")
    
    return result
```

### Monitor Memory Usage

```python
import psutil
import logging

def log_memory_usage():
    process = psutil.Process()
    memory_info = process.memory_info()
    logger.info(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")
```

## Batch Processing Example

```python
import os
import asyncio
from pathlib import Path

async def batch_process_videos(video_dir: str):
    """Process multiple videos in a directory"""
    video_files = list(Path(video_dir).glob("*.mp4"))
    
    results = []
    for video_path in video_files:
        print(f"Processing {video_path.name}...")
        result = await process_video(str(video_path))
        results.append({
            'filename': video_path.name,
            'result': result
        })
    
    return results

# Usage
results = asyncio.run(batch_process_videos('./videos'))
```

## Custom Model Configuration

### Use Different Whisper Model at Runtime

```python
from app.services.transcription_service import TranscriptionService

# Create service with custom model
service = TranscriptionService(model_name='large')
result = await service.transcribe_video('video.mp4')
```

### Custom Frame Processing

```python
from app.services.emotion_service import EmotionService

# Process specific frames
service = EmotionService()
emotions = await service.analyze_emotions(
    video_path='video.mp4',
    frame_interval=15  # Every 15th frame
)
```

## Troubleshooting Examples

### Debug Mode

```python
# backend/app/main.py
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Check Model Loading

```python
import whisper

# Test Whisper model
model = whisper.load_model("base")
print(f"Model loaded: {model.device}")

# Test DeepFace
from deepface import DeepFace
result = DeepFace.verify("img1.jpg", "img2.jpg")
print("DeepFace working:", result)
```

### Verify FFmpeg

```bash
# Check FFmpeg installation
ffmpeg -version

# Test audio extraction
ffmpeg -i input.webm -ac 1 -ar 16000 output.wav
```

## Production Deployment Example

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: affective-computing-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: affective-computing:backend
        env:
        - name: WHISPER_MODEL
          value: "base"
        - name: WHISPER_DEVICE
          value: "cpu"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

## Conclusion

These examples cover common usage patterns and integration scenarios. Adapt them to your specific needs and use cases!

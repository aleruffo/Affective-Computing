# Affective Computing - Video Emotion Analysis Platform

A full-stack application for capturing video/audio and analyzing emotional content through speech and facial expression analysis.

## 🎯 Overview

This application combines:
- **Frontend**: React + TypeScript with MediaStream API for video/audio recording
- **Backend**: Python FastAPI with ML models for emotion analysis
  - OpenAI Whisper for speech-to-text transcription
  - DeepFace for facial emotion recognition
  - FFmpeg for audio extraction

## 📁 Project Structure

```
affective-computing/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client & utilities
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── utils/          # Helper functions
│   ├── uploads/            # Temporary file storage
│   └── requirements.txt
└── docker-compose.yml      # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- FFmpeg installed on system

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🔧 Features

- **Real-time Video Recording**: Capture video and audio using browser MediaStream API
- **Speech Transcription**: Convert speech to text using OpenAI Whisper
- **Emotion Analysis**: Detect emotions from facial expressions using DeepFace
- **RESTful API**: Clean API design with FastAPI
- **Type Safety**: Full TypeScript support in frontend

## 📚 Documentation

Comprehensive documentation is available:

- **[📖 Documentation Index](./DOCUMENTATION_INDEX.md)** - Complete documentation guide
- **[🚀 Quick Start Guide](./QUICKSTART.md)** - Get started in 5 minutes
- **[📋 Project Summary](./PROJECT_SUMMARY.md)** - Detailed feature overview
- **[🏗️ Architecture Guide](./ARCHITECTURE.md)** - Technical architecture details
- **[💡 Examples & Usage](./EXAMPLES.md)** - Code examples and integrations
- **[Frontend Docs](./frontend/README.md)** - React + TypeScript details
- **[Backend Docs](./backend/README.md)** - FastAPI + ML models details

## 📚 API Endpoints

- `POST /api/upload-video` - Upload recorded video for analysis
- `GET /api/analysis/{id}` - Get analysis results
- `GET /api/health` - Health check endpoint

Interactive API documentation: `http://localhost:8000/docs`

## 🔐 Environment Variables

See `.env.example` files in both frontend and backend directories.

## 🤝 Contributing

Contributions are welcome! Please read the documentation and maintain code quality standards.

## 📝 License

MIT License

# 🌳 Complete Project Structure

```
Affective Computing/
│
├── 📄 Root Documentation
│   ├── README.md                    # Main project overview
│   ├── DOCUMENTATION_INDEX.md       # Complete documentation guide  
│   ├── QUICKSTART.md               # Fast setup guide
│   ├── PROJECT_SUMMARY.md          # Detailed summary
│   ├── ARCHITECTURE.md             # System architecture
│   ├── EXAMPLES.md                 # Usage examples
│   ├── setup.sh                    # Automated setup script (executable)
│   ├── docker-compose.yml          # Docker orchestration
│   └── .gitignore                  # Git ignore rules
│
├── 🎨 Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoRecorder.tsx           # Video recording component
│   │   │   ├── VideoRecorder.css           # Recorder styles
│   │   │   ├── AnalysisResults.tsx         # Results display component
│   │   │   └── AnalysisResults.css         # Results styles
│   │   │
│   │   ├── hooks/
│   │   │   └── useMediaRecorder.ts         # MediaStream custom hook
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                      # Axios API client
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                    # TypeScript definitions
│   │   │
│   │   ├── App.tsx                         # Main app component
│   │   ├── App.css                         # App styles
│   │   ├── main.tsx                        # Entry point
│   │   ├── index.css                       # Global styles
│   │   └── vite-env.d.ts                   # Vite type definitions
│   │
│   ├── index.html                          # HTML template
│   ├── package.json                        # Node dependencies
│   ├── tsconfig.json                       # TypeScript config
│   ├── tsconfig.node.json                  # TypeScript Node config
│   ├── vite.config.ts                      # Vite configuration
│   ├── Dockerfile                          # Frontend Docker image
│   ├── .env.example                        # Environment template
│   └── README.md                           # Frontend documentation
│
├── 🐍 Backend (Python + FastAPI)
│   ├── app/
│   │   ├── services/
│   │   │   ├── transcription_service.py    # Whisper STT service
│   │   │   ├── emotion_service.py          # DeepFace emotion analysis
│   │   │   ├── video_processor.py          # Main processing orchestrator
│   │   │   └── __init__.py                 # Package init
│   │   │
│   │   ├── utils/
│   │   │   ├── audio_extractor.py          # FFmpeg audio extraction
│   │   │   └── __init__.py                 # Package init
│   │   │
│   │   ├── __init__.py                     # Package init
│   │   ├── main.py                         # FastAPI application entry
│   │   ├── api.py                          # API routes
│   │   ├── config.py                       # Configuration management
│   │   └── models.py                       # Pydantic data models
│   │
│   ├── uploads/                            # Video file storage (created at runtime)
│   ├── temp/                               # Temporary audio files (created at runtime)
│   ├── requirements.txt                    # Python dependencies
│   ├── Dockerfile                          # Backend Docker image
│   ├── .env.example                        # Environment template
│   └── README.md                           # Backend documentation
│
└── 📊 Statistics
    ├── Total Files: ~43
    ├── Frontend Files: ~16
    ├── Backend Files: ~13
    ├── Documentation Files: ~8
    └── Configuration Files: ~6
```

## 📁 Key Directories Explained

### Frontend (`/frontend`)
- **Components**: React UI components with styles
- **Hooks**: Custom React hooks for MediaStream
- **Services**: API communication layer
- **Types**: TypeScript type definitions

### Backend (`/app`)
- **Services**: Business logic for ML processing
- **Utils**: Utility functions (FFmpeg wrapper)
- **API**: Route definitions and handlers
- **Config**: Environment-based configuration

## 🔑 Key Files Explained

### Root Level
| File | Purpose | Type |
|------|---------|------|
| `README.md` | Project overview | Documentation |
| `QUICKSTART.md` | Fast setup guide | Documentation |
| `DOCUMENTATION_INDEX.md` | Documentation navigation | Documentation |
| `PROJECT_SUMMARY.md` | Complete summary | Documentation |
| `ARCHITECTURE.md` | Technical architecture | Documentation |
| `EXAMPLES.md` | Usage examples | Documentation |
| `setup.sh` | Automated setup | Script |
| `docker-compose.yml` | Docker orchestration | Configuration |
| `.gitignore` | Git ignore patterns | Configuration |

### Frontend
| File | Purpose | Lines | Technology |
|------|---------|-------|------------|
| `main.tsx` | Application entry point | ~10 | React |
| `App.tsx` | Main component | ~45 | React + TypeScript |
| `VideoRecorder.tsx` | Recording component | ~175 | React + TypeScript |
| `AnalysisResults.tsx` | Results display | ~150 | React + TypeScript |
| `useMediaRecorder.ts` | MediaStream hook | ~130 | TypeScript |
| `api.ts` | API client | ~35 | TypeScript + Axios |
| `types/index.ts` | Type definitions | ~55 | TypeScript |
| `vite.config.ts` | Build configuration | ~18 | TypeScript |
| `package.json` | Dependencies | ~30 | JSON |

### Backend
| File | Purpose | Lines | Technology |
|------|---------|-------|------------|
| `main.py` | Application entry | ~60 | Python + FastAPI |
| `api.py` | API routes | ~100 | Python + FastAPI |
| `config.py` | Configuration | ~35 | Python + Pydantic |
| `models.py` | Data models | ~60 | Python + Pydantic |
| `transcription_service.py` | Whisper integration | ~80 | Python + Whisper |
| `emotion_service.py` | DeepFace integration | ~100 | Python + DeepFace |
| `video_processor.py` | Processing orchestrator | ~50 | Python |
| `audio_extractor.py` | FFmpeg wrapper | ~60 | Python + FFmpeg |
| `requirements.txt` | Dependencies | ~15 | Text |

## 📊 Code Statistics

### Frontend
- **Languages**: TypeScript, CSS, HTML
- **Framework**: React 18
- **Build Tool**: Vite
- **Total Components**: 2 major components
- **Custom Hooks**: 1 (useMediaRecorder)
- **Type Definitions**: ~10 interfaces/types

### Backend
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **Services**: 3 main services
- **Utilities**: 1 audio extractor
- **API Endpoints**: 3 endpoints
- **Data Models**: 8 Pydantic models

## 🎯 File Relationships

### Data Flow
```
User Input (VideoRecorder.tsx)
    ↓
API Client (api.ts)
    ↓
API Routes (api.py)
    ↓
Video Processor (video_processor.py)
    ↓
├─→ Transcription Service (transcription_service.py)
│       ↓
│   Audio Extractor (audio_extractor.py)
│       ↓
│   Whisper Model
│
└─→ Emotion Service (emotion_service.py)
        ↓
    DeepFace Model
        ↓
Results (AnalysisResults.tsx)
```

### Configuration Chain
```
.env → config.py → services → main.py → API
```

### Type Safety Chain
```
types/index.ts → components → API client → Backend models
```

## 📦 Dependencies Overview

### Frontend Dependencies (package.json)
- **React**: ^18.2.0 - UI library
- **Axios**: ^1.6.2 - HTTP client
- **Vite**: ^5.0.8 - Build tool
- **TypeScript**: ^5.2.2 - Type safety

### Backend Dependencies (requirements.txt)
- **FastAPI**: 0.104.1 - Web framework
- **Whisper**: 20231117 - Speech-to-text
- **DeepFace**: 0.0.79 - Facial analysis
- **FFmpeg-Python**: 0.2.0 - Video processing
- **TensorFlow**: 2.15.0 - ML framework

## 🔄 File Interactions

### Most Connected Files
1. **api.py** - Connects to all services and models
2. **video_processor.py** - Orchestrates transcription and emotion services
3. **App.tsx** - Coordinates all frontend components
4. **types/index.ts** - Used across all frontend files

### Independent Files
- Configuration files (.env, docker-compose.yml)
- Documentation files (all .md files)
- Style files (all .css files)

## 🎨 Styling Architecture

### Frontend Styles
```
index.css (Global)
    ↓
App.css (Layout)
    ↓
├─→ VideoRecorder.css (Recording UI)
└─→ AnalysisResults.css (Results UI)
```

### Style Features
- CSS Variables for theming
- Dark mode support
- Responsive design
- Gradient effects
- Animations (pulse, spin)

## 🧪 Testability

### Frontend Test Files (to be created)
- `VideoRecorder.test.tsx`
- `AnalysisResults.test.tsx`
- `useMediaRecorder.test.ts`
- `api.test.ts`

### Backend Test Files (to be created)
- `test_api.py`
- `test_transcription_service.py`
- `test_emotion_service.py`
- `test_video_processor.py`

## 📈 Growth Path

### Easy to Add
- New API endpoints in `api.py`
- New React components in `components/`
- New services in `services/`
- New utilities in `utils/`

### Moderate Complexity
- New ML models (requires service modification)
- Authentication system
- Database integration
- Real-time processing

### Complex Additions
- Microservices architecture
- Distributed processing
- Multi-language support
- Live streaming analysis

## 🔍 Quick File Lookup

**Need to modify...**
- Recording UI → `VideoRecorder.tsx`
- Results display → `AnalysisResults.tsx`
- API endpoints → `api.py`
- Whisper config → `transcription_service.py`
- Emotion config → `emotion_service.py`
- Type definitions → `types/index.ts`
- Environment vars → `.env.example` files
- Docker setup → `docker-compose.yml`

**Need to understand...**
- Overall flow → `ARCHITECTURE.md`
- Setup process → `QUICKSTART.md`
- API usage → `EXAMPLES.md`
- Project scope → `PROJECT_SUMMARY.md`

---

**Total Project Size**: ~3,000 lines of code + 2,500 lines of documentation
**Estimated Development Time**: 2-3 days for full implementation
**Maintenance Level**: Medium (well-documented and structured)

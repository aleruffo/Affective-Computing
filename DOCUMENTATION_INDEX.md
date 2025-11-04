# 📚 Documentation Index

Welcome to the Affective Computing Platform documentation! This index will help you find the information you need.

## 🚀 Getting Started

**New to the project? Start here:**

1. **[README.md](./README.md)** - Project overview and feature list
2. **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
3. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project walkthrough

## 📖 Main Documentation

### Setup & Installation

| Document | Description | When to Use |
|----------|-------------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Fast setup guide with Docker & manual options | First time setup |
| [setup.sh](./setup.sh) | Automated setup script | Quick automated installation |
| [frontend/README.md](./frontend/README.md) | Frontend-specific setup | Frontend development |
| [backend/README.md](./backend/README.md) | Backend-specific setup | Backend development |

### Architecture & Design

| Document | Description | When to Use |
|----------|-------------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and data flow | Understanding the system |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Complete feature overview | Project overview |

### Usage & Examples

| Document | Description | When to Use |
|----------|-------------|-------------|
| [EXAMPLES.md](./EXAMPLES.md) | API usage, integration examples, configs | Implementing features |

## 🎯 Quick Links by Task

### I want to...

#### Run the Application
→ [QUICKSTART.md](./QUICKSTART.md) - Follow Docker or manual setup

#### Understand the Architecture
→ [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and components

#### Use the API
→ [EXAMPLES.md](./EXAMPLES.md) - API examples and integration code
→ http://localhost:8000/docs - Interactive API docs (when running)

#### Configure the System
→ [backend/README.md](./backend/README.md) - Backend configuration options
→ [EXAMPLES.md](./EXAMPLES.md) - Configuration examples

#### Develop the Frontend
→ [frontend/README.md](./frontend/README.md) - Frontend development guide

#### Develop the Backend
→ [backend/README.md](./backend/README.md) - Backend development guide

#### Deploy to Production
→ [ARCHITECTURE.md](./ARCHITECTURE.md) - Deployment section
→ [EXAMPLES.md](./EXAMPLES.md) - Production deployment example

#### Troubleshoot Issues
→ [QUICKSTART.md](./QUICKSTART.md) - Common issues section
→ [frontend/README.md](./frontend/README.md) - Frontend troubleshooting
→ [backend/README.md](./backend/README.md) - Backend troubleshooting

## 📂 Project Structure Reference

```
Affective Computing/
│
├── 📄 Documentation (You are here!)
│   ├── README.md              - Main overview
│   ├── QUICKSTART.md          - Quick setup
│   ├── PROJECT_SUMMARY.md     - Complete summary
│   ├── ARCHITECTURE.md        - Technical details
│   ├── EXAMPLES.md            - Usage examples
│   └── DOCUMENTATION_INDEX.md - This file
│
├── 🎨 Frontend (React + TypeScript)
│   ├── frontend/README.md     - Frontend docs
│   ├── src/
│   │   ├── components/        - React components
│   │   ├── hooks/            - Custom hooks
│   │   ├── services/         - API client
│   │   └── types/            - TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── 🐍 Backend (Python FastAPI)
│   ├── backend/README.md      - Backend docs
│   ├── app/
│   │   ├── api.py            - Routes
│   │   ├── main.py           - Entry point
│   │   ├── services/         - Business logic
│   │   └── utils/            - Utilities
│   └── requirements.txt
│
└── 🔧 Configuration
    ├── docker-compose.yml     - Docker setup
    ├── setup.sh              - Setup script
    └── .gitignore            - Git ignore
```

## 🎓 Learning Path

### Beginner
1. Read [README.md](./README.md) to understand what the project does
2. Follow [QUICKSTART.md](./QUICKSTART.md) to run it
3. Explore the UI at http://localhost:3000

### Intermediate
1. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for complete overview
2. Study [EXAMPLES.md](./EXAMPLES.md) for usage patterns
3. Review frontend/backend READMEs for specific details

### Advanced
1. Study [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Read the source code with documentation as reference
3. Customize configuration for your needs

## 📋 Feature Documentation

### Video Recording
- **Frontend**: [frontend/README.md](./frontend/README.md) - MediaStream API section
- **Component**: `frontend/src/components/VideoRecorder.tsx`
- **Hook**: `frontend/src/hooks/useMediaRecorder.ts`

### Speech Transcription
- **Backend**: [backend/README.md](./backend/README.md) - Whisper configuration
- **Service**: `backend/app/services/transcription_service.py`
- **Examples**: [EXAMPLES.md](./EXAMPLES.md) - Configuration section

### Emotion Analysis
- **Backend**: [backend/README.md](./backend/README.md) - DeepFace configuration
- **Service**: `backend/app/services/emotion_service.py`
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Processing pipeline

### API Integration
- **API Docs**: http://localhost:8000/docs (when running)
- **Client**: `frontend/src/services/api.ts`
- **Examples**: [EXAMPLES.md](./EXAMPLES.md) - API usage section

## 🔍 Quick Reference

### Configuration Files
- `frontend/.env` - Frontend environment variables
- `backend/.env` - Backend environment variables
- `docker-compose.yml` - Docker configuration

### Key Commands
```bash
# Setup
./setup.sh

# Docker
docker-compose up --build

# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# Tests
cd backend && pytest
cd frontend && npm test
```

### Important URLs (when running)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 🆘 Need Help?

### Common Questions

**Q: How do I get started?**
A: Read [QUICKSTART.md](./QUICKSTART.md) and run `./setup.sh`

**Q: The application is slow, how can I speed it up?**
A: See [EXAMPLES.md](./EXAMPLES.md) - Fast Processing configuration

**Q: How accurate is the emotion detection?**
A: See [backend/README.md](./backend/README.md) - DeepFace Backends section

**Q: Can I use this in production?**
A: See [ARCHITECTURE.md](./ARCHITECTURE.md) - Security Considerations

**Q: How do I integrate this with my app?**
A: See [EXAMPLES.md](./EXAMPLES.md) - Integration Examples

### Troubleshooting Guide
1. Check [QUICKSTART.md](./QUICKSTART.md) - Common Issues
2. Check component-specific README
3. Review logs in terminal
4. Check browser console (frontend issues)
5. Verify prerequisites are installed

## 📝 Contributing

When adding new features:
1. Update relevant README files
2. Add examples to [EXAMPLES.md](./EXAMPLES.md)
3. Update [ARCHITECTURE.md](./ARCHITECTURE.md) if needed
4. Update this index if adding new docs

## 🎯 Document Purposes

| Document | Primary Audience | Purpose |
|----------|-----------------|---------|
| README.md | Everyone | First impression, what & why |
| QUICKSTART.md | Users | Get running fast |
| PROJECT_SUMMARY.md | Developers | Complete understanding |
| ARCHITECTURE.md | Developers | Technical deep dive |
| EXAMPLES.md | Developers | Practical usage |
| frontend/README.md | Frontend devs | Frontend specifics |
| backend/README.md | Backend devs | Backend specifics |

## 🔄 Documentation Updates

This documentation is comprehensive and current as of project creation. When making changes:

✅ **Do:**
- Keep docs in sync with code
- Add examples for new features
- Update troubleshooting sections
- Maintain the learning path

❌ **Don't:**
- Let docs become outdated
- Add irrelevant information
- Duplicate content across files
- Skip updating after major changes

---

**Happy Coding! 🚀**

Need to find something specific? Use your editor's search (Cmd/Ctrl + F) across these documents.

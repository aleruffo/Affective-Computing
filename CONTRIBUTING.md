# 🤝 Contributing Guide

Thank you for considering contributing to the Affective Computing Platform! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## 🌟 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/affective-computing.git
cd affective-computing
```

### 2. Set Up Development Environment

```bash
# Run the automated setup
./setup.sh

# Or manually:
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes

Examples:
- `feature/add-emotion-export`
- `fix/camera-permission-error`
- `docs/update-api-examples`

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(frontend): add emotion export to CSV"
git commit -m "fix(backend): resolve FFmpeg audio extraction error"
git commit -m "docs(readme): update installation instructions"
```

## 💻 Coding Standards

### Frontend (TypeScript/React)

#### File Organization
```typescript
// 1. Imports
import React, { useState } from 'react';
import { SomeType } from './types';

// 2. Types/Interfaces
interface Props {
  prop1: string;
  prop2: number;
}

// 3. Component
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 4. State and hooks
  const [state, setState] = useState('');
  
  // 5. Functions
  const handleClick = () => {
    // ...
  };
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

#### Style Guide
- Use functional components with hooks
- Use TypeScript for type safety
- Keep components focused and small
- Use meaningful variable names
- Add comments for complex logic
- Use CSS modules or styled components

#### Example
```typescript
// Good ✅
const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onAnalysisComplete,
  isAnalyzing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  
  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };
  
  return <button onClick={handleStartRecording}>Record</button>;
};

// Bad ❌
const VideoRecorder = (props) => {
  const [rec, setRec] = useState(false);
  return <button onClick={() => setRec(true)}>Record</button>;
};
```

### Backend (Python)

#### File Organization
```python
# 1. Standard library imports
import os
from typing import Dict, Any

# 2. Third-party imports
from fastapi import APIRouter
import numpy as np

# 3. Local imports
from app.models import AnalysisResponse
from app.config import settings

# 4. Constants
DEFAULT_MODEL = "base"

# 5. Classes/Functions
class MyService:
    """Service description"""
    
    def __init__(self):
        """Initialize service"""
        pass
    
    def process(self, data: Dict[str, Any]) -> AnalysisResponse:
        """Process data and return response"""
        pass
```

#### Style Guide
- Follow PEP 8
- Use type hints
- Write docstrings for all functions/classes
- Keep functions focused and small
- Use meaningful variable names
- Add comments for complex logic

#### Example
```python
# Good ✅
async def transcribe_video(self, video_path: str) -> Dict[str, Any]:
    """
    Transcribe audio from video file using Whisper.
    
    Args:
        video_path: Path to video file
        
    Returns:
        Dictionary with transcription results
        
    Raises:
        ValueError: If video file is invalid
    """
    if not Path(video_path).exists():
        raise ValueError(f"Video not found: {video_path}")
    
    audio_path = await self._extract_audio(video_path)
    result = self.model.transcribe(audio_path)
    
    return {
        "text": result["text"],
        "language": result["language"],
    }

# Bad ❌
def transcribe(self, v):
    a = self._extract_audio(v)
    r = self.model.transcribe(a)
    return r
```

## 🧪 Testing Guidelines

### Frontend Testing

```typescript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import VideoRecorder from './VideoRecorder';

describe('VideoRecorder', () => {
  it('should start recording when button clicked', () => {
    render(<VideoRecorder />);
    
    const button = screen.getByText('Start Recording');
    fireEvent.click(button);
    
    expect(screen.getByText(/REC/)).toBeInTheDocument();
  });
});

// Hook test
import { renderHook, act } from '@testing-library/react-hooks';
import { useMediaRecorder } from './useMediaRecorder';

describe('useMediaRecorder', () => {
  it('should start recording', async () => {
    const { result } = renderHook(() => useMediaRecorder());
    
    await act(async () => {
      await result.current.startRecording();
    });
    
    expect(result.current.recordingState.isRecording).toBe(true);
  });
});
```

### Backend Testing

```python
# API test
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_upload_video():
    """Test video upload endpoint"""
    with open("test_video.webm", "rb") as f:
        response = client.post(
            "/api/upload-video",
            files={"video": f}
        )
    
    assert response.status_code == 200
    assert "id" in response.json()

# Service test
import pytest
from app.services.transcription_service import TranscriptionService

@pytest.fixture
def transcription_service():
    return TranscriptionService()

async def test_transcribe_video(transcription_service):
    """Test video transcription"""
    result = await transcription_service.transcribe_video("test.mp4")
    
    assert "text" in result
    assert "language" in result
    assert len(result["segments"]) > 0
```

### Running Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest

# With coverage
pytest --cov=app tests/
```

## 📚 Documentation

### Code Documentation

#### Frontend
```typescript
/**
 * Custom hook for managing video recording state.
 * 
 * @returns Recording state and control functions
 * 
 * @example
 * ```tsx
 * const { recordingState, startRecording } = useMediaRecorder();
 * ```
 */
export const useMediaRecorder = () => {
  // Implementation
};
```

#### Backend
```python
def analyze_emotions(self, video_path: str) -> Dict[str, Any]:
    """
    Analyze emotions from video file using DeepFace.
    
    This function extracts frames from the video and analyzes
    facial expressions to detect emotions.
    
    Args:
        video_path: Absolute path to video file
        
    Returns:
        Dictionary containing:
            - emotions: List of detected emotions with timestamps
            - dominant_emotion: Most frequent emotion
            
    Raises:
        ValueError: If video file is invalid or cannot be opened
        RuntimeError: If DeepFace analysis fails
        
    Example:
        >>> service = EmotionService()
        >>> result = service.analyze_emotions("video.mp4")
        >>> print(result["dominant_emotion"])
        {'emotion': 'happy', 'percentage': 65.5}
    """
```

### Documentation Files

When adding features, update:
- `README.md` - If it changes main features
- `EXAMPLES.md` - Add usage examples
- `ARCHITECTURE.md` - If it changes architecture
- Component README - If modifying frontend/backend

## 🔍 Code Review Checklist

Before submitting a PR, verify:

### General
- [ ] Code follows project style guide
- [ ] No commented-out code
- [ ] No console.log/print statements (unless intentional)
- [ ] No hardcoded values (use config/env)
- [ ] Error handling is comprehensive
- [ ] Code is DRY (Don't Repeat Yourself)

### Frontend
- [ ] TypeScript types are defined
- [ ] Components are properly typed
- [ ] No any types (unless necessary)
- [ ] Hooks dependencies are correct
- [ ] Accessibility considerations (alt text, ARIA labels)
- [ ] Responsive design maintained

### Backend
- [ ] Type hints on all functions
- [ ] Docstrings on all public functions
- [ ] Input validation
- [ ] Proper error handling
- [ ] Async/await used correctly
- [ ] No blocking operations

### Testing
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Tests pass locally
- [ ] Test coverage maintained/improved

### Documentation
- [ ] Code is documented
- [ ] README updated if needed
- [ ] Examples added if appropriate
- [ ] Comments explain "why" not "what"

## 📤 Pull Request Process

### 1. Update Your Branch

```bash
git fetch origin
git rebase origin/main
```

### 2. Run Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest
```

### 3. Create Pull Request

**Title Format:**
```
<type>: <description>

Examples:
feat: Add CSV export for emotion data
fix: Resolve camera permission on Safari
docs: Update API examples
```

**Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Tests pass locally
```

### 4. Address Review Comments

- Respond to all comments
- Make requested changes
- Push updates to your branch
- Request re-review when ready

### 5. Merge

Once approved:
- Squash commits if needed
- Merge to main branch
- Delete feature branch

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., macOS]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
- Python version: [e.g., 3.10.0]

**Additional context**
Any other relevant information
```

## ✨ Suggesting Features

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Clear description of the problem

**Describe the solution**
What you want to happen

**Describe alternatives**
Other solutions you've considered

**Additional context**
Mockups, examples, etc.
```

## 🎯 Priority Areas for Contribution

### High Priority
- [ ] Improve test coverage
- [ ] Add authentication system
- [ ] Implement database storage
- [ ] Add batch processing
- [ ] Performance optimizations

### Medium Priority
- [ ] Add more emotion categories
- [ ] Export results to PDF
- [ ] Multi-language UI support
- [ ] Real-time processing
- [ ] Mobile app

### Good First Issues
- [ ] Improve error messages
- [ ] Add loading animations
- [ ] Enhance documentation
- [ ] Add configuration examples
- [ ] Fix minor UI issues

## 📞 Getting Help

- **Documentation**: Check `DOCUMENTATION_INDEX.md`
- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Chat**: [Add your communication channel]

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🚀**

# LLM Thematic Coding Feature

## Overview

This feature adds automated thematic analysis to transcription text using Ollama with local LLM models. The system analyzes speech transcriptions and extracts main themes, supporting quotes, and provides a content summary.

## Features

- 🧠 **Automated Theme Extraction**: Identifies 3-8 main themes from transcriptions
- 🎯 **Confidence Scoring**: Each theme includes a confidence score (0.0-1.0)
- 💬 **Quote Extraction**: Relevant quotes supporting each theme
- 📝 **Content Summarization**: Brief overview of the entire transcription
- 🔒 **Privacy-First**: Runs completely locally using Ollama (no data sent to external APIs)
- ⚡ **Flexible Models**: Support for various LLMs (Llama, Mistral, Gemma, etc.)

## Setup

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai)

### 2. Pull a Model

```bash
# Recommended: Llama 3.2 (3B) - Fast and efficient
ollama pull llama3.2

# Alternative models:
ollama pull llama3.1    # Better quality (8B)
ollama pull mistral     # Good balance (7B)
ollama pull gemma2      # Google's model (9B)
```

### 3. Start Ollama

```bash
ollama serve
```

Ollama will run on `http://localhost:11434` by default.

**Important for Docker users:** Ollama must run on your **host machine** (not in Docker). The backend container will connect to it via `host.docker.internal:11434`.

### 4. Configure Backend

Update your `backend/.env` file:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434  # For local development
# OLLAMA_BASE_URL=http://host.docker.internal:11434  # For Docker (set in docker-compose.yml)
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=120.0
```

**For Docker users:** The `docker-compose.yml` already sets `OLLAMA_BASE_URL=http://host.docker.internal:11434`, so you don't need to change anything!

### 5. Install Dependencies

The `httpx` library is required for making requests to Ollama:

```bash
cd backend
pip install -r requirements.txt
```

## Usage

1. **Record and upload a video** as usual
2. The system will automatically:
   - Transcribe the audio using SenseVoice
   - Send the transcription to Ollama for thematic analysis
   - Extract themes, quotes, and generate a summary
3. **View results** in the analysis panel:
   - Themes section shows all identified themes
   - Each theme includes name, description, confidence, and supporting quotes
   - Summary provides an overview of the content

## API Response Structure

The thematic analysis is included in the analysis response:

```json
{
  "id": "uuid",
  "status": "completed",
  "transcription": { ... },
  "thematic_analysis": {
    "themes": [
      {
        "name": "Personal Growth",
        "description": "Discussion about self-improvement and continuous learning",
        "quotes": [
          "I've been trying to improve myself every day",
          "Learning new things makes me feel accomplished"
        ],
        "confidence": 0.85
      },
      {
        "name": "Work-Life Balance",
        "description": "Reflections on managing professional and personal life",
        "quotes": [
          "Finding time for family is important",
          "Work can be overwhelming sometimes"
        ],
        "confidence": 0.72
      }
    ],
    "summary": "The speaker discusses personal development and the importance of maintaining balance between work and personal life.",
    "success": true
  }
}
```

## Configuration Options

### Model Selection

Different models offer different trade-offs:

| Model | Size | Speed | Quality | Recommended For |
|-------|------|-------|---------|-----------------|
| llama3.2 | 3B | ⚡⚡⚡ | ⭐⭐⭐ | Fast processing, good quality |
| llama3.1 | 8B | ⚡⚡ | ⭐⭐⭐⭐ | Better analysis quality |
| mistral | 7B | ⚡⚡ | ⭐⭐⭐⭐ | Balanced performance |
| gemma2 | 9B | ⚡ | ⭐⭐⭐⭐⭐ | Highest quality |

### Timeout Configuration

Adjust based on your hardware and model size:

```bash
# Fast systems or smaller models
OLLAMA_TIMEOUT=60.0

# Balanced (recommended)
OLLAMA_TIMEOUT=120.0

# Slower systems or larger models
OLLAMA_TIMEOUT=300.0
```

## Troubleshooting

### Ollama Connection Issues

**For local development:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Should return something like: {"version":"0.1.17"}

# If not running, start Ollama
ollama serve
```

**For Docker:**
```bash
# 1. Check if Ollama is running on host machine
curl http://localhost:11434/api/version

# 2. Test connection from inside the container
docker-compose exec backend curl http://host.docker.internal:11434/api/version

# 3. Check Docker logs
docker-compose logs backend | grep -i ollama

# 4. Verify environment variable
docker-compose exec backend env | grep OLLAMA
```

**Common Docker Issues:**
- ✅ Make sure Ollama is running on your **host machine** (not in Docker)
- ✅ Use `host.docker.internal` in Docker (already set in docker-compose.yml)
- ✅ On Linux, you may need to use `host-gateway` or the host's IP address
- ✅ Check firewall settings if connection is refused

### Model Not Found

```bash
# List available models
ollama list

# Pull the model if missing
ollama pull llama3.2

# Test the model
ollama run llama3.2 "Hello"
```

### Timeout Issues

If you see timeout errors:

1. Use a smaller model: `OLLAMA_MODEL=llama3.2`
2. Increase timeout: `OLLAMA_TIMEOUT=300.0`
3. Ensure your system meets minimum requirements

### Empty Themes

If no themes are extracted:

1. Check that transcription is available and not empty
2. Verify Ollama is responding correctly
3. Try a different model
4. Check backend logs for errors

## Technical Details

### Service Architecture

```
VideoProcessor
    ├─→ SenseVoiceService (transcription)
    ├─→ EmotionService (facial emotions)
    └─→ ThematicCodingService (theme extraction)
            ↓
        Ollama API (local LLM)
```

### Files Modified/Created

**Backend:**
- `backend/app/services/thematic_coding_service.py` - New service for LLM integration
- `backend/app/config.py` - Added Ollama configuration
- `backend/app/models.py` - Added theme-related models
- `backend/app/services/video_processor.py` - Integrated thematic analysis
- `backend/app/api.py` - Updated API responses
- `backend/requirements.txt` - Added httpx dependency

**Frontend:**
- `frontend/src/types/index.ts` - Added theme types
- `frontend/src/components/AnalysisResults.tsx` - Added theme display

### Prompt Engineering

The system uses a carefully crafted prompt that:
1. Instructs the LLM to act as a qualitative researcher
2. Specifies the exact output format (JSON)
3. Requests 3-8 themes to avoid overwhelming users
4. Asks for confidence scores based on theme prominence
5. Requires supporting quotes from the actual text

## Privacy & Security

- ✅ All processing happens locally on your machine
- ✅ No data is sent to external APIs
- ✅ Transcriptions never leave your system
- ✅ Full control over which models are used
- ✅ Can run completely offline (after downloading models)

## Performance Tips

1. **For faster analysis**: Use llama3.2 (3B model)
2. **For better quality**: Use llama3.1 or gemma2
3. **Monitor system resources**: Larger models require more RAM
4. **Optimize transcriptions**: Shorter transcriptions process faster
5. **GPU acceleration**: Ollama will automatically use GPU if available

## Future Enhancements

Potential improvements:
- [ ] Custom theme categories/templates
- [ ] Multi-language theme analysis
- [ ] Theme comparison across multiple videos
- [ ] Export themes to various formats (CSV, JSON, PDF)
- [ ] Sentiment analysis per theme
- [ ] Theme visualization (word clouds, graphs)
- [ ] Custom prompts for specific research contexts

## References

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Llama Models](https://ollama.ai/library/llama3.2)
- [Qualitative Research Methods](https://en.wikipedia.org/wiki/Thematic_analysis)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Ollama logs: `ollama logs`
3. Check backend logs for detailed error messages
4. Ensure all dependencies are installed correctly

---

**Happy Analyzing! 🧠✨**

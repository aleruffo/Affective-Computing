# Frontend Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` and set:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── VideoRecorder.tsx
│   │   ├── VideoRecorder.css
│   │   ├── AnalysisResults.tsx
│   │   └── AnalysisResults.css
│   ├── hooks/              # Custom React hooks
│   │   └── useMediaRecorder.ts
│   ├── services/           # API client
│   │   └── api.ts
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx             # Main application component
│   ├── App.css
│   ├── main.tsx            # Application entry point
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

## Key Features

### MediaStream API Integration
- Access camera and microphone
- Real-time video recording
- Video preview and playback

### Video Recording
- Start/stop/pause recording
- Real-time duration counter
- WebM format output

### API Communication
- Upload recorded videos
- Poll for analysis results
- Display transcription and emotion data

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires HTTPS or localhost for MediaStream API access.

## Troubleshooting

### Camera/Microphone Access
If you get permission errors:
1. Check browser settings for camera/microphone permissions
2. Ensure you're on HTTPS or localhost
3. Check browser console for specific errors

### API Connection Issues
- Verify backend is running on port 8000
- Check CORS settings in backend
- Verify VITE_API_URL in .env

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

// API Response Types
export interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: number;
  frame: number;
}

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface AnalysisResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  transcription?: {
    text: string;
    language: string;
    segments: TranscriptionSegment[];
  };
  emotions?: EmotionData[];
  dominant_emotion?: {
    emotion: string;
    percentage: number;
  };
  created_at: string;
  error?: string;
}

export interface UploadResponse {
  id: string;
  message: string;
}

// Component Props
export interface VideoRecorderProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
  onAnalysisStart: () => void;
  isAnalyzing: boolean;
}

export interface AnalysisResultsProps {
  result: AnalysisResponse;
}

// MediaStream Types
export interface MediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  blob: Blob | null;
}

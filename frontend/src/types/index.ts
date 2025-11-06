// API Response Types
export interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: number;
  frame: number;
  all_emotions?: Record<string, number>;
  frame_image?: string;
}

export interface SpeechEmotionData {
  emotion: string;
  confidence: number;
  timestamp: number;
  events: string[];
}

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
}

export interface AnalysisResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  transcription?: {
    text: string;
    language: string;
    segments: TranscriptionSegment[];
  };
  // New fields from SenseVoice integration
  speech_emotions?: SpeechEmotionData[];
  audio_events?: string[];
  // Renamed fields for clarity
  facial_emotions?: EmotionData[];
  dominant_facial_emotion?: {
    emotion: string;
    percentage: number;
  };
  // Legacy support (deprecated, will be removed)
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
  onClose?: () => void;
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

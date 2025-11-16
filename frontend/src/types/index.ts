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

export interface Theme {
  name: string;
  description: string;
  quotes: string[];
  confidence: number;
}

export interface ThematicAnalysis {
  themes: Theme[];
  summary: string;
  success: boolean;
  error?: string;
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
  // Thematic analysis from LLM
  thematic_analysis?: ThematicAnalysis;
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
  onBack: () => void;
  onViewArchive: () => void;
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

// User Profile Types
export interface UserProfile {
  name: string;
  goals?: string | null;
  preferences?: {
    emotionFocus?: string[];
    journalFrequency?: string;
  } | null;
}

export interface UserProfileResponse extends UserProfile {
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface SavedVideo {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  has_analysis: boolean;
  analysis_status?: string;
}

export interface DashboardStats {
  total_entries: number;
  emotions_distribution: Record<string, number>;
  recent_entries: SavedVideo[];
  all_entries: SavedVideo[];
  total_recording_time: number;
}

export interface CalendarEntry {
  date: string;
  count: number;
}

export interface CalendarResponse {
  entries: CalendarEntry[];
}

export interface EmotionTrend {
  date: string;
  emotion: string;
  average_confidence: number;
  count: number;
}

export interface EmotionTrendsResponse {
  trends: EmotionTrend[];
}

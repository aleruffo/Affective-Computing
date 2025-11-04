import { useEffect, useRef, useState } from 'react';
import { VideoRecorderProps } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { uploadVideo, getAnalysisStatus } from '../services/api';
import './VideoRecorder.css';

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onAnalysisComplete,
  onAnalysisStart,
  isAnalyzing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const {
    recordingState,
    streamRef,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useMediaRecorder();

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [streamRef.current]);

  // Play recorded video
  useEffect(() => {
    if (recordingState.blob && videoRef.current) {
      const videoUrl = URL.createObjectURL(recordingState.blob);
      videoRef.current.srcObject = null;
      videoRef.current.src = videoUrl;
      videoRef.current.controls = true;

      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [recordingState.blob]);

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording();
    } catch (err) {
      setError('Failed to access camera/microphone. Please grant permissions.');
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!recordingState.blob) return;

    try {
      setError(null);
      onAnalysisStart();
      setUploadProgress('Uploading video...');

      const uploadResponse = await uploadVideo(recordingState.blob);
      setUploadProgress('Processing video...');

      // Poll for analysis status
      const pollInterval = setInterval(async () => {
        try {
          const result = await getAnalysisStatus(uploadResponse.id);

          if (result.status === 'completed') {
            clearInterval(pollInterval);
            setUploadProgress('');
            onAnalysisComplete(result);
          } else if (result.status === 'failed') {
            clearInterval(pollInterval);
            setUploadProgress('');
            setError(result.error || 'Analysis failed');
          }
        } catch (err) {
          clearInterval(pollInterval);
          setUploadProgress('');
          setError('Failed to fetch analysis status');
          console.error(err);
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setUploadProgress('');
        setError('Analysis timed out');
      }, 300000);
    } catch (err) {
      setError('Failed to upload video for analysis');
      console.error(err);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-recorder">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted={recordingState.isRecording}
          playsInline
          className="video-element"
        />
        {recordingState.isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            REC {formatDuration(recordingState.duration)}
          </div>
        )}
      </div>

      <div className="controls">
        {!recordingState.isRecording && !recordingState.blob && (
          <button onClick={handleStartRecording} className="btn btn-primary">
            📹 Start Recording
          </button>
        )}

        {recordingState.isRecording && (
          <>
            {!recordingState.isPaused ? (
              <button onClick={pauseRecording} className="btn btn-warning">
                ⏸ Pause
              </button>
            ) : (
              <button onClick={resumeRecording} className="btn btn-success">
                ▶️ Resume
              </button>
            )}
            <button onClick={stopRecording} className="btn btn-danger">
              ⏹ Stop
            </button>
          </>
        )}

        {recordingState.blob && !isAnalyzing && (
          <>
            <button onClick={handleAnalyze} className="btn btn-primary">
              🔍 Analyze Emotion
            </button>
            <button onClick={resetRecording} className="btn btn-secondary">
              🔄 Record Again
            </button>
          </>
        )}
      </div>

      {uploadProgress && (
        <div className="progress-message">
          <div className="spinner"></div>
          {uploadProgress}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;

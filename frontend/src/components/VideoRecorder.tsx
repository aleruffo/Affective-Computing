import { useEffect, useRef, useState } from 'react';
import { VideoRecorderProps } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { uploadVideo, getAnalysisStatus } from '../services/api';

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
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted={recordingState.isRecording}
          playsInline
          className="w-full aspect-video object-cover"
        />
        {recordingState.isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg animate-pulse">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            REC {formatDuration(recordingState.duration)}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {!recordingState.isRecording && !recordingState.blob && (
          <button 
            onClick={handleStartRecording} 
            className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            📹 Start Recording
          </button>
        )}

        {recordingState.isRecording && (
          <>
            {!recordingState.isPaused ? (
              <button 
                onClick={pauseRecording} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                ⏸ Pause
              </button>
            ) : (
              <button 
                onClick={resumeRecording} 
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                ▶️ Resume
              </button>
            )}
            <button 
              onClick={stopRecording} 
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              ⏹ Stop
            </button>
          </>
        )}

        {recordingState.blob && !isAnalyzing && (
          <>
            <button 
              onClick={handleAnalyze} 
              className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              🔍 Analyze Emotion
            </button>
            <button 
              onClick={resetRecording} 
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              🔄 Record Again
            </button>
          </>
        )}
      </div>

      {uploadProgress && (
        <div className="mt-6 flex items-center justify-center gap-3 text-purple-400 font-semibold">
          <div className="w-6 h-6 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          {uploadProgress}
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-900/50 border-2 border-red-500 text-red-200 px-6 py-4 rounded-lg text-center font-semibold">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;

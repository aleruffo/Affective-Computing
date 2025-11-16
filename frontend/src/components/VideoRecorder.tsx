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
      <div className="relative bg-eink-black border-4 border-eink-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted={recordingState.isRecording}
          playsInline
          className="w-full aspect-video object-cover"
        />
        {recordingState.isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-eink-black text-white px-4 py-2 border-2 border-white font-bold font-mono">
            <span className="w-3 h-3 bg-white"></span>
            REC {formatDuration(recordingState.duration)}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {!recordingState.isRecording && !recordingState.blob && (
          <button 
            onClick={handleStartRecording} 
            className="bg-eink-black text-white px-8 py-4 border-2 border-eink-black font-bold font-mono text-base hover:bg-white hover:text-eink-black"
          >
            [ START RECORDING ]
          </button>
        )}

        {recordingState.isRecording && (
          <>
            {!recordingState.isPaused ? (
              <button 
                onClick={pauseRecording} 
                className="bg-white text-eink-black px-6 py-3 border-2 border-eink-black font-bold font-mono hover:bg-eink-black hover:text-white"
              >
                [ PAUSE ]
              </button>
            ) : (
              <button 
                onClick={resumeRecording} 
                className="bg-eink-black text-white px-6 py-3 border-2 border-eink-black font-bold font-mono hover:bg-white hover:text-eink-black"
              >
                [ RESUME ]
              </button>
            )}
            <button 
              onClick={stopRecording} 
              className="bg-eink-black text-white px-6 py-3 border-2 border-eink-black font-bold font-mono hover:bg-white hover:text-eink-black"
            >
              [ STOP ]
            </button>
          </>
        )}

        {recordingState.blob && !isAnalyzing && (
          <>
            <button 
              onClick={handleAnalyze} 
              className="bg-eink-black text-white px-8 py-4 border-2 border-eink-black font-bold font-mono text-base hover:bg-white hover:text-eink-black"
            >
              [ ANALYZE ]
            </button>
            <button 
              onClick={resetRecording} 
              className="bg-white text-eink-black px-6 py-3 border-2 border-eink-black font-bold font-mono hover:bg-eink-black hover:text-white"
            >
              [ RESET ]
            </button>
          </>
        )}
      </div>

      {uploadProgress && (
        <div className="mt-6 flex items-center justify-center gap-3 text-eink-black font-bold font-mono">
          <div className="w-6 h-6 border-2 border-eink-black border-t-transparent"></div>
          {uploadProgress}
        </div>
      )}

      {error && (
        <div className="mt-6 bg-white border-4 border-eink-black text-eink-black px-6 py-4 text-center font-bold font-mono">
          [!] {error}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;

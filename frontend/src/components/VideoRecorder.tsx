import { useEffect, useRef, useState } from 'react';
import { VideoRecorderProps } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { uploadVideo, getAnalysisStatus } from '../services/api';

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onAnalysisComplete,
  onAnalysisStart,
  isAnalyzing,
  onBack,
  onViewArchive,
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
    <div className="min-h-screen bg-eink-paper p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button and archive button */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors text-sm"
            >
              [ ← BACK ]
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-eink-black font-mono">
              [ NEW ENTRY ]
            </h1>
          </div>
          <button
            onClick={onViewArchive}
            className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors text-sm"
          >
            [ VIEW ARCHIVE ]
          </button>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Video Preview Section */}
          <div className="bg-white border-4 border-eink-black p-6">
            <div className="relative bg-eink-black border-2 border-eink-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted={recordingState.isRecording}
                playsInline
                className="w-full aspect-video object-cover"
              />
              {recordingState.isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-eink-black text-white px-4 py-2 border-2 border-white font-bold font-mono animate-pulse">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                  REC {formatDuration(recordingState.duration)}
                </div>
              )}
              {recordingState.isPaused && (
                <div className="absolute top-4 left-4 bg-eink-white text-eink-black px-4 py-2 border-2 border-eink-black font-bold font-mono">
                  [ PAUSED ] {formatDuration(recordingState.duration)}
                </div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white border-4 border-eink-black p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Instructions */}
              {!recordingState.isRecording && !recordingState.blob && (
                <div className="w-full border-2 border-eink-black bg-eink-light p-4 mb-2">
                  <p className="text-eink-black font-mono text-sm text-center">
                    [ PRESS START TO BEGIN RECORDING YOUR JOURNAL ENTRY ]
                  </p>
                </div>
              )}

              {recordingState.blob && !isAnalyzing && (
                <div className="w-full border-2 border-eink-black bg-eink-light p-4 mb-2">
                  <p className="text-eink-black font-mono text-sm text-center">
                    [ RECORDING COMPLETE - PRESS ANALYZE TO PROCESS YOUR ENTRY ]
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center w-full">
                {!recordingState.isRecording && !recordingState.blob && (
                  <button 
                    onClick={handleStartRecording} 
                    className="bg-eink-black text-white px-10 py-4 border-4 border-eink-black font-bold font-mono text-lg hover:bg-white hover:text-eink-black transition-all"
                  >
                    [ START RECORDING ]
                  </button>
                )}

                {recordingState.isRecording && (
                  <>
                    {!recordingState.isPaused ? (
                      <button 
                        onClick={pauseRecording} 
                        className="bg-white text-eink-black px-8 py-3 border-3 border-eink-black font-bold font-mono text-base hover:bg-eink-black hover:text-white transition-all"
                      >
                        [ ⏸ PAUSE ]
                      </button>
                    ) : (
                      <button 
                        onClick={resumeRecording} 
                        className="bg-eink-black text-white px-8 py-3 border-3 border-eink-black font-bold font-mono text-base hover:bg-white hover:text-eink-black transition-all"
                      >
                        [ ▶ RESUME ]
                      </button>
                    )}
                    <button 
                      onClick={stopRecording} 
                      className="bg-eink-black text-white px-8 py-3 border-3 border-eink-black font-bold font-mono text-base hover:bg-white hover:text-eink-black transition-all"
                    >
                      [ ⏹ STOP ]
                    </button>
                  </>
                )}

                {recordingState.blob && !isAnalyzing && (
                  <>
                    <button 
                      onClick={handleAnalyze} 
                      className="bg-eink-black text-white px-10 py-4 border-4 border-eink-black font-bold font-mono text-lg hover:bg-white hover:text-eink-black transition-all"
                    >
                      [ ⚡ ANALYZE ]
                    </button>
                    <button 
                      onClick={resetRecording} 
                      className="bg-white text-eink-black px-8 py-3 border-3 border-eink-black font-bold font-mono text-base hover:bg-eink-black hover:text-white transition-all"
                    >
                      [ ↻ RESET ]
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {uploadProgress && (
            <div className="bg-white border-4 border-eink-black p-6">
              <div className="flex items-center justify-center gap-4 text-eink-black font-bold font-mono">
                <div className="w-8 h-8 border-4 border-eink-black border-t-transparent animate-spin"></div>
                <span className="text-lg">{uploadProgress}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white border-4 border-eink-black p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚠</span>
                <div className="flex-1">
                  <p className="text-eink-black font-bold font-mono text-base">[!] ERROR</p>
                  <p className="text-eink-gray font-mono text-sm mt-2">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;

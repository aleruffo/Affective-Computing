import { useState, useRef, useCallback } from 'react';
import { RecordingState, MediaRecorderOptions } from '../types';

export const useMediaRecorder = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    blob: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      streamRef.current = stream;

      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp8,opus',
      };

      // Fallback for browsers that don't support vp8
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordingState((prev) => ({ ...prev, blob, isRecording: false }));
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        blob: null,
      });

      return stream;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState((prev) => ({ ...prev, isPaused: true }));
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState((prev) => ({ ...prev, isPaused: false }));
      
      timerRef.current = window.setInterval(() => {
        setRecordingState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      blob: null,
    });
    chunksRef.current = [];
  }, []);

  return {
    recordingState,
    streamRef,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
};

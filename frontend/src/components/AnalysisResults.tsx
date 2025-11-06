import React from 'react';
import { AnalysisResultsProps } from '../types';
import './AnalysisResults.css';

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  // Support both new and legacy field names
  const facialEmotions = result.facial_emotions || result.emotions || [];
  const dominantFacialEmotion = result.dominant_facial_emotion || result.dominant_emotion;
  const speechEmotions = result.speech_emotions || [];
  const audioEvents = result.audio_events || [];
  
  const getEmotionEmoji = (emotion: string): string => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fear: '😨',
      surprise: '😮',
      disgust: '🤢',
      neutral: '😐',
    };
    return emojiMap[emotion.toLowerCase()] || '😐';
  };

  const getEmotionColor = (emotion: string): string => {
    const colorMap: Record<string, string> = {
      happy: '#4caf50',
      sad: '#2196f3',
      angry: '#f44336',
      fear: '#9c27b0',
      surprise: '#ff9800',
      disgust: '#795548',
      neutral: '#9e9e9e',
    };
    return colorMap[emotion.toLowerCase()] || '#9e9e9e';
  };

  return (
    <div className="analysis-results">
      <h2>📊 Analysis Results</h2>

      {result.transcription && (
        <div className="result-section">
          <h3>🎤 Speech Transcription</h3>
          <div className="transcription-box">
            <p className="transcription-text">{result.transcription.text}</p>
            <div className="transcription-meta">
              <span>Language: {result.transcription.language}</span>
              <span>
                Segments: {result.transcription.segments.length}
              </span>
            </div>
          </div>

          {result.transcription.segments.length > 0 && (
            <div className="segments">
              <h4>Transcription Timeline</h4>
              <div className="segment-list">
                {result.transcription.segments.map((segment, index) => (
                  <div key={index} className="segment-item">
                    <span className="segment-time">
                      {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                    </span>
                    <span className="segment-text">{segment.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {speechEmotions.length > 0 && (
        <div className="result-section">
          <h3>🎙️ Speech Emotion Analysis</h3>
          <div className="speech-emotions">
            {speechEmotions.map((emotion, index) => (
              <div key={index} className="speech-emotion-item">
                <div className="speech-emotion-header">
                  <span className="speech-emotion-icon">
                    {getEmotionEmoji(emotion.emotion)}
                  </span>
                  <span className="speech-emotion-name">
                    {emotion.emotion}
                  </span>
                  <span className="speech-emotion-time">
                    {emotion.timestamp.toFixed(1)}s
                  </span>
                </div>
                <div className="speech-emotion-confidence">
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${emotion.confidence * 100}%`,
                        backgroundColor: getEmotionColor(emotion.emotion),
                      }}
                    ></div>
                  </div>
                  <span className="confidence-value">
                    {(emotion.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {emotion.events.length > 0 && (
                  <div className="audio-events">
                    <span className="audio-events-label">Audio Events:</span>
                    {emotion.events.map((event, i) => (
                      <span key={i} className="audio-event-badge">
                        {event}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {audioEvents.length > 0 && (
        <div className="result-section">
          <h3>🔊 Audio Events Detected</h3>
          <div className="audio-events-list">
            {audioEvents.map((event, index) => (
              <span key={index} className="audio-event-badge-large">
                {event}
              </span>
            ))}
          </div>
        </div>
      )}

      {facialEmotions.length > 0 && (
        <div className="result-section">
          <h3>🎭 Facial Emotion Analysis</h3>

          {dominantFacialEmotion && (
            <div className="dominant-emotion">
              <div className="emotion-icon">
                {getEmotionEmoji(dominantFacialEmotion.emotion)}
              </div>
              <div className="emotion-info">
                <h4>Dominant Facial Emotion</h4>
                <p className="emotion-name">
                  {dominantFacialEmotion.emotion}
                </p>
                <p className="emotion-percentage">
                  {dominantFacialEmotion.percentage.toFixed(1)}% of the time
                </p>
              </div>
            </div>
          )}

          <div className="emotion-timeline">
            <h4>Facial Emotion Timeline</h4>
            <div className="timeline-list">
              {facialEmotions.map((emotion, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <span
                      className="timeline-dot"
                      style={{ backgroundColor: getEmotionColor(emotion.emotion) }}
                    ></span>
                  </div>
                  <div className="timeline-content">
                    {emotion.frame_image && (
                      <div className="timeline-frame">
                        <img 
                          src={emotion.frame_image} 
                          alt={`Frame ${emotion.frame}`}
                          className="frame-thumbnail"
                        />
                      </div>
                    )}
                    <div className="timeline-header">
                      <span className="timeline-emotion">
                        {getEmotionEmoji(emotion.emotion)} {emotion.emotion}
                      </span>
                      <span className="timeline-time">
                        {emotion.timestamp.toFixed(1)}s (Frame {emotion.frame})
                      </span>
                    </div>
                    <div className="timeline-confidence">
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{
                            width: `${emotion.confidence * 100}%`,
                            backgroundColor: getEmotionColor(emotion.emotion),
                          }}
                        ></div>
                      </div>
                      <span className="confidence-value">
                        {(emotion.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    {emotion.all_emotions && (
                      <div className="all-emotions">
                        <div className="all-emotions-title">All Detected Emotions:</div>
                        <div className="all-emotions-grid">
                          {Object.entries(emotion.all_emotions)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([emotionName, score]) => (
                              <div key={emotionName} className="emotion-score-item">
                                <span className="emotion-score-name">
                                  {getEmotionEmoji(emotionName)} {emotionName}
                                </span>
                                <div className="emotion-score-bar-container">
                                  <div 
                                    className="emotion-score-bar"
                                    style={{
                                      width: `${(score as number) * 100}%`,
                                      backgroundColor: getEmotionColor(emotionName),
                                    }}
                                  ></div>
                                </div>
                                <span className="emotion-score-value">
                                  {((score as number) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(!result.transcription && facialEmotions.length === 0 && speechEmotions.length === 0) && (
        <div className="no-results">
          <p>No analysis data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

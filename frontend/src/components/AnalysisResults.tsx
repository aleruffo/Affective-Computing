import { AnalysisResultsProps } from '../types';
import './AnalysisResults.css';

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
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
                    <span className="segment-confidence">
                      {(segment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result.emotions && result.emotions.length > 0 && (
        <div className="result-section">
          <h3>🎭 Emotion Analysis</h3>

          {result.dominant_emotion && (
            <div className="dominant-emotion">
              <div className="emotion-icon">
                {getEmotionEmoji(result.dominant_emotion.emotion)}
              </div>
              <div className="emotion-info">
                <h4>Dominant Emotion</h4>
                <p className="emotion-name">
                  {result.dominant_emotion.emotion}
                </p>
                <p className="emotion-percentage">
                  {result.dominant_emotion.percentage.toFixed(1)}% of the time
                </p>
              </div>
            </div>
          )}

          <div className="emotion-timeline">
            <h4>Emotion Timeline</h4>
            <div className="timeline-list">
              {result.emotions.map((emotion, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <span
                      className="timeline-dot"
                      style={{ backgroundColor: getEmotionColor(emotion.emotion) }}
                    ></span>
                  </div>
                  <div className="timeline-content">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(!result.transcription && !result.emotions) && (
        <div className="no-results">
          <p>No analysis data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

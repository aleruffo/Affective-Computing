import React, { useState, useEffect } from 'react';
import { AnalysisResponse } from '../types';
import AnalysisResults from './AnalysisResults';
import api from '../services/api';
import './SavedVideos.css';

interface SavedVideosProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
  onAnalysisStart: () => void;
  isAnalyzing: boolean;
}

interface SavedVideo {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  has_analysis: boolean;
  analysis_status: string | null;
}

const SavedVideos: React.FC<SavedVideosProps> = ({ 
  onAnalysisComplete, 
  onAnalysisStart,
  isAnalyzing 
}) => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  const fetchSavedVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ videos: SavedVideo[] }>('/saved-videos');
      setVideos(response.data.videos || []);
    } catch (err) {
      console.error('Failed to fetch saved videos:', err);
      setError('Failed to load saved videos');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async (videoId: string) => {
    try {
      onAnalysisStart();
      setSelectedVideo(videoId);
      setAnalysisResult(null);
      
      const response = await api.post<AnalysisResponse>(`/reanalyze-video/${videoId}`);
      
      // Poll for results
      const checkAnalysis = async () => {
        const result = await api.get<AnalysisResponse>(`/analysis/${response.data.id}`);
        
        if (result.data.status === 'completed' || result.data.status === 'failed') {
          setAnalysisResult(result.data);
          onAnalysisComplete(result.data);
          setSelectedVideo(null);
        } else {
          setTimeout(checkAnalysis, 2000);
        }
      };
      
      setTimeout(checkAnalysis, 2000);
    } catch (err) {
      console.error('Failed to reanalyze video:', err);
      setError('Failed to reanalyze video');
      setSelectedVideo(null);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      await api.delete(`/saved-videos/${videoId}`);
      setVideos(videos.filter(v => v.id !== videoId));
      if (selectedVideo === videoId) {
        setSelectedVideo(null);
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
      setError('Failed to delete video');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="saved-videos">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading saved videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-videos">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchSavedVideos} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-videos">
      <div className="saved-videos-header">
        <h2>📁 Saved Videos</h2>
        <button onClick={fetchSavedVideos} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="no-videos">
          <p>📭 No saved videos yet</p>
          <p className="hint">Record and analyze a video to see it here</p>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-info">
                <div className="video-icon">🎬</div>
                <div className="video-details">
                  <h3 className="video-filename">{video.filename}</h3>
                  <p className="video-meta">
                    <span>{formatFileSize(video.size)}</span>
                    <span>•</span>
                    <span>{formatDate(video.created_at)}</span>
                  </p>
                  {video.has_analysis && (
                    <span className={`status-badge ${video.analysis_status}`}>
                      {video.analysis_status === 'completed' ? '✓ Analyzed' : 
                       video.analysis_status === 'processing' ? '⏳ Processing' : 
                       video.analysis_status === 'failed' ? '✗ Failed' : 'Not Analyzed'}
                    </span>
                  )}
                </div>
              </div>
              <div className="video-actions">
                <button
                  onClick={() => handleReanalyze(video.id)}
                  disabled={isAnalyzing && selectedVideo === video.id}
                  className="reanalyze-button"
                >
                  {isAnalyzing && selectedVideo === video.id ? (
                    <>
                      <span className="button-spinner"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      🔄 Reanalyze
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  disabled={isAnalyzing}
                  className="delete-button"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="analysis-section">
          <AnalysisResults result={analysisResult} />
        </div>
      )}
    </div>
  );
};

export default SavedVideos;

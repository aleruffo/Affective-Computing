import React, { useState, useEffect } from 'react';
import { AnalysisResponse } from '../types';
import AnalysisResults from './AnalysisResults';
import api from '../services/api';

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
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading saved videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
          <p className="text-yellow-800 text-lg mb-4">⚠️ {error}</p>
          <button 
            onClick={fetchSavedVideos} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          📁 Saved Videos
        </h2>
        <button 
          onClick={fetchSavedVideos} 
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          🔄 Refresh
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-gradient-secondary rounded-xl p-16 text-center shadow-inner">
          <p className="text-gray-700 text-2xl mb-2">📭 No saved videos yet</p>
          <p className="text-gray-500 text-lg">Record and analyze a video to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-primary hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              <div className="flex gap-4 mb-4">
                <div className="text-4xl flex-shrink-0">🎬</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{video.filename}</h3>
                  <div className="flex gap-2 text-sm text-gray-600 mb-2">
                    <span>{formatFileSize(video.size)}</span>
                    <span>•</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                  {video.has_analysis && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      video.analysis_status === 'completed' ? 'bg-green-100 text-green-800' :
                      video.analysis_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      video.analysis_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {video.analysis_status === 'completed' ? '✓ Analyzed' :
                       video.analysis_status === 'processing' ? '⏳ Processing' :
                       video.analysis_status === 'failed' ? '✗ Failed' : 'Not Analyzed'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReanalyze(video.id)}
                  disabled={isAnalyzing && selectedVideo === video.id}
                  className="flex-1 bg-gradient-primary text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isAnalyzing && selectedVideo === video.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <AnalysisResults result={analysisResult} />
        </div>
      )}
    </div>
  );
};

export default SavedVideos;

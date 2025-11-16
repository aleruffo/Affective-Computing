import React, { useState, useEffect } from 'react';
import { AnalysisResponse } from '../types';
import api from '../services/api';

interface SavedVideosProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
  onAnalysisStart: () => void;
  isAnalyzing: boolean;
  onBack: () => void;
  onNewEntry: () => void;
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
  isAnalyzing,
  onBack,
  onNewEntry
}) => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null);
  const [renamingVideo, setRenamingVideo] = useState<string | null>(null);
  const [newFilename, setNewFilename] = useState<string>('');

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

  const handleViewAnalysis = async (videoId: string) => {
    try {
      setLoadingAnalysis(videoId);
      setSelectedVideo(videoId);
      setError(null);
      
      const response = await api.get<AnalysisResponse>(`/analysis/${videoId}`);
      onAnalysisComplete(response.data);
      
    } catch (err) {
      console.error('Failed to load analysis:', err);
      setError('Failed to load analysis results');
    } finally {
      setLoadingAnalysis(null);
    }
  };

  const handleReanalyze = async (videoId: string) => {
    try {
      onAnalysisStart();
      setSelectedVideo(videoId);
      
      const response = await api.post<AnalysisResponse>(`/reanalyze-video/${videoId}`);
      
      // Poll for results
      const checkAnalysis = async () => {
        const result = await api.get<AnalysisResponse>(`/analysis/${response.data.id}`);
        
        if (result.data.status === 'completed' || result.data.status === 'failed') {
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
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
      setError('Failed to delete video');
    }
  };

  const handleStartRename = (videoId: string, currentFilename: string) => {
    setRenamingVideo(videoId);
    // Remove .webm extension for editing
    setNewFilename(currentFilename.replace('.webm', ''));
  };

  const handleCancelRename = () => {
    setRenamingVideo(null);
    setNewFilename('');
  };

  const handleSaveRename = async (videoId: string) => {
    if (!newFilename.trim()) {
      setError('Filename cannot be empty');
      return;
    }

    try {
      const response = await api.put(`/saved-videos/${videoId}/rename`, {
        filename: newFilename.trim()
      });

      // Update the video in the list
      setVideos(videos.map(v => 
        v.id === videoId 
          ? { ...v, id: response.data.new_id, filename: response.data.filename }
          : v
      ));

      setRenamingVideo(null);
      setNewFilename('');
      setError(null);
    } catch (err: any) {
      console.error('Failed to rename video:', err);
      setError(err.response?.data?.detail || 'Failed to rename video');
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
      <div className="min-h-screen bg-eink-paper p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center top-0 gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors"
            >
              [ ← BACK ]
            </button>
            <h1 className="text-4xl font-bold text-eink-black">
              [ ARCHIVE ]
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-eink-black border-t-transparent mb-4"></div>
            <p className="text-eink-black text-base font-mono">LOADING...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-eink-paper p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors"
            >
              [ ← BACK ]
            </button>
            <h1 className="text-4xl font-bold text-eink-black">
              [ ARCHIVE ]
            </h1>
          </div>
          <div className="bg-white border-4 border-eink-black p-8 text-center">
            <p className="text-eink-black text-base mb-4 font-mono font-bold">[!] {error}</p>
            <button 
              onClick={fetchSavedVideos} 
              className="bg-eink-black text-white px-6 py-3 border-2 border-eink-black font-bold font-mono hover:bg-white hover:text-eink-black"
            >
              [ TRY AGAIN ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eink-paper p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button and new entry button */}
        <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors text-sm"
            >
              [ ← BACK ]
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-eink-black font-mono">
                [ ARCHIVE ]
              </h1>
              <p className="text-eink-gray font-mono text-sm mt-1">
                {videos.length} {videos.length === 1 ? 'ENTRY' : 'ENTRIES'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onNewEntry}
              className="px-4 py-2 border-2 border-eink-black bg-eink-black text-eink-white font-mono hover:bg-eink-dark transition-all text-sm"
            >
              [ + NEW ENTRY ]
            </button>
            <button 
              onClick={fetchSavedVideos} 
              className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors text-sm"
            >
              [ ↻ REFRESH ]
            </button>
          </div>
        </div>

      {videos.length === 0 ? (
        <div className="bg-white border-4 border-eink-black p-16 text-center">
          <div className="mb-6">
            <span className="text-6xl">📝</span>
          </div>
          <p className="text-eink-black text-2xl mb-3 font-mono font-bold">[ NO ENTRIES YET ]</p>
          <p className="text-eink-gray text-base font-mono mb-6">
            Record your first journal entry to get started
          </p>
          <button
            onClick={onNewEntry}
            className="bg-eink-black text-white px-8 py-3 border-3 border-eink-black font-bold font-mono hover:bg-white hover:text-eink-black transition-all"
          >
            [ CREATE NEW ENTRY ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="bg-white border-4 border-eink-black p-6 hover:border-4 transition-all"
            >
              {/* Entry Header */}
              <div className="mb-4 pb-4 border-b-2 border-eink-black">
                {renamingVideo === video.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newFilename}
                      onChange={(e) => setNewFilename(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename(video.id);
                        } else if (e.key === 'Escape') {
                          handleCancelRename();
                        }
                      }}
                      className="flex-1 bg-white text-eink-black px-3 py-2 border-2 border-eink-black focus:border-4 focus:outline-none font-mono"
                      autoFocus
                      placeholder="Enter new name"
                    />
                    <button
                      onClick={() => handleSaveRename(video.id)}
                      className="text-eink-black hover:bg-eink-light p-2 border-2 border-eink-black transition-colors"
                      title="Save"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="text-eink-black hover:bg-eink-light p-2 border-2 border-eink-black transition-colors"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-eink-black font-mono break-words">
                        {video.filename}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono">
                        <span className="bg-eink-light px-2 py-1 border border-eink-black">
                          {formatFileSize(video.size)}
                        </span>
                        <span className={`px-2 py-1 border ${video.has_analysis ? 'bg-eink-black text-white border-eink-black' : 'bg-white text-eink-black border-eink-black'}`}>
                          {video.has_analysis ? '✓ ANALYZED' : '○ NOT ANALYZED'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartRename(video.id, video.filename)}
                      className="text-eink-gray hover:text-eink-black hover:bg-eink-light p-2 border border-transparent hover:border-eink-black transition-all"
                      title="Rename video"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Entry Metadata */}
              <div className="mb-4">
                <p className="text-xs text-eink-gray font-mono">
                  {formatDate(video.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {video.has_analysis ? (
                  <button
                    onClick={() => handleViewAnalysis(video.id)}
                    disabled={loadingAnalysis === video.id}
                    className="w-full bg-eink-black text-white px-4 py-3 border-3 border-eink-black font-bold font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-eink-black flex items-center justify-center gap-2 transition-all"
                  >
                    {loadingAnalysis === video.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
                        LOADING...
                      </>
                    ) : (
                      <>
                        [ VIEW ANALYSIS ]
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleReanalyze(video.id)}
                    disabled={isAnalyzing && selectedVideo === video.id}
                    className="w-full bg-eink-white text-eink-black px-4 py-3 border-3 border-eink-black font-bold font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-eink-black hover:text-white flex items-center justify-center gap-2 transition-all"
                  >
                    {isAnalyzing && selectedVideo === video.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-eink-black border-t-transparent animate-spin"></div>
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        [ ANALYZE NOW ]
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(video.id)}
                  disabled={isAnalyzing || loadingAnalysis === video.id}
                  className="w-full bg-white text-eink-black px-4 py-2 border-2 border-eink-black font-bold font-mono text-sm hover:bg-eink-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  [ DELETE ]
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default SavedVideos;

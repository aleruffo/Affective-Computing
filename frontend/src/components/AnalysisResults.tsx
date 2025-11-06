import React, { useState } from 'react';
import { AnalysisResultsProps } from '../types';

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transcription: true,
    speechEmotions: true,
    audioEvents: true,
    facialEmotions: true,
  });

  // Support both new and legacy field names
  const facialEmotions = result.facial_emotions || result.emotions || [];
  const dominantFacialEmotion = result.dominant_facial_emotion || result.dominant_emotion;
  const speechEmotions = result.speech_emotions || [];
  const audioEvents = result.audio_events || [];
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center animate-scale-in">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full h-full flex flex-col border-2 border-gray-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
            <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
              <span className="text-4xl">📊</span>
              Analysis Results
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Speech Transcription Section */}
            {result.transcription && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <button
                  onClick={() => toggleSection('transcription')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-750 transition-colors rounded-xl"
                >
                  <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                    <span className="text-3xl">🎤</span>
                    Speech Transcription
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.transcription ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSections.transcription && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-5 border border-blue-800/50">
                      <p className="text-lg text-gray-100 leading-relaxed mb-4">{result.transcription.text}</p>
                      <div className="flex gap-4 text-sm text-gray-300">
                        <span className="bg-gray-800 px-3 py-1 rounded-full font-medium border border-gray-700">
                          Language: <span className="text-blue-400">{result.transcription.language}</span>
                        </span>
                        <span className="bg-gray-800 px-3 py-1 rounded-full font-medium border border-gray-700">
                          Segments: <span className="text-blue-400">{result.transcription.segments.length}</span>
                        </span>
                      </div>
                    </div>

                    {result.transcription.segments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-lg font-semibold text-gray-200">Transcription Timeline</h4>
                        <div className="space-y-2">
                          {result.transcription.segments.map((segment, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors">
                              <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full whitespace-nowrap border border-blue-800">
                                {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                              </span>
                              <span className="text-gray-200 flex-1">{segment.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Speech Emotion Analysis Section */}
            {speechEmotions.length > 0 && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <button
                  onClick={() => toggleSection('speechEmotions')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-750 transition-colors rounded-xl"
                >
                  <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                    <span className="text-3xl">🎙️</span>
                    Speech Emotion Analysis
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.speechEmotions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSections.speechEmotions && (
                  <div className="px-6 pb-6 space-y-4">
                    {speechEmotions.map((emotion, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-5 border border-purple-800/50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">
                              {getEmotionEmoji(emotion.emotion)}
                            </span>
                            <span className="text-xl font-semibold text-gray-100 capitalize">
                              {emotion.emotion}
                            </span>
                          </div>
                          <span className="text-sm font-mono text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-800">
                            {emotion.timestamp.toFixed(1)}s
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${emotion.confidence * 100}%`,
                                  backgroundColor: getEmotionColor(emotion.emotion),
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-200 min-w-[50px] text-right">
                              {(emotion.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {emotion.events.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-sm font-medium text-gray-300">Audio Events:</span>
                            {emotion.events.map((event, i) => (
                              <span key={i} className="text-xs bg-gray-800 text-gray-200 px-3 py-1 rounded-full border border-gray-600 font-medium">
                                {event}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audio Events Section */}
            {audioEvents.length > 0 && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <button
                  onClick={() => toggleSection('audioEvents')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-750 transition-colors rounded-xl"
                >
                  <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                    <span className="text-3xl">🔊</span>
                    Audio Events Detected
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.audioEvents ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSections.audioEvents && (
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-3">
                      {audioEvents.map((event, index) => (
                        <span key={index} className="text-base bg-gradient-to-r from-orange-900/30 to-yellow-900/30 text-orange-200 px-5 py-2.5 rounded-full border-2 border-orange-700 font-semibold shadow-sm hover:shadow-md transition-shadow">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Facial Emotion Analysis Section */}
            {facialEmotions.length > 0 && (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <button
                  onClick={() => toggleSection('facialEmotions')}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-750 transition-colors rounded-xl"
                >
                  <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                    <span className="text-3xl">🎭</span>
                    Facial Emotion Analysis
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedSections.facialEmotions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSections.facialEmotions && (
                  <div className="px-6 pb-6 space-y-6">
                    {dominantFacialEmotion && (
                      <div className="bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 rounded-xl p-6 border-2 border-indigo-700 shadow-md">
                        <div className="flex items-center gap-6">
                          <div className="text-7xl flex-shrink-0">
                            {getEmotionEmoji(dominantFacialEmotion.emotion)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-300 mb-1">Dominant Facial Emotion</h4>
                            <p className="text-3xl font-bold text-gray-100 capitalize mb-2">
                              {dominantFacialEmotion.emotion}
                            </p>
                            <p className="text-lg text-indigo-400 font-semibold">
                              {dominantFacialEmotion.percentage.toFixed(1)}% of the time
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-200">Facial Emotion Timeline</h4>
                      
                      {/* Emotion Legend */}
                      <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Emotion Legend:</h4>
                        <div className="flex flex-wrap gap-3">
                          {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map((emotion) => (
                            <div 
                              key={emotion}
                              className="px-4 py-2 rounded-full shadow-sm flex items-center gap-2"
                              style={{ backgroundColor: getEmotionColor(emotion) }}
                            >
                              <span className="text-lg">{getEmotionEmoji(emotion)}</span>
                              <span className="text-sm font-semibold text-white capitalize">
                                {emotion}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {facialEmotions.map((emotion, index) => (
                          <div key={index} className="bg-gray-750 rounded-lg p-5 space-y-3 border border-gray-600 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                                <span className="text-2xl">{getEmotionEmoji(emotion.emotion)}</span>
                                <span className="capitalize">{emotion.emotion}</span>
                              </span>
                              <span className="text-sm font-mono text-gray-300 bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
                                {emotion.timestamp.toFixed(1)}s (Frame {emotion.frame})
                              </span>
                            </div>
                            
                            <div className="flex items-start gap-4">
                              {emotion.frame_image && (
                                <div className="flex-shrink-0">
                                  <img 
                                    src={emotion.frame_image} 
                                    alt={`Frame ${emotion.frame}`}
                                    className="w-32 h-24 object-cover rounded-lg border-2 border-gray-600 shadow-sm"
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                {emotion.all_emotions && (
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex h-8 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                        {Object.entries(emotion.all_emotions)
                                          .sort(([, a], [, b]) => (b as number) - (a as number))
                                          .map(([emotionName, score]) => {
                                            const percentage = (score as number) * 100;
                                            return percentage > 0 ? (
                                              <div
                                                key={emotionName}
                                                className="flex items-center justify-center transition-all duration-300 hover:opacity-80 cursor-pointer"
                                                style={{
                                                  width: `${percentage}%`,
                                                  backgroundColor: getEmotionColor(emotionName),
                                                }}
                                                title={`${emotionName}: ${percentage.toFixed(1)}%`}
                                              >
                                                {percentage > 8 && (
                                                  <span className="text-xs font-semibold text-white drop-shadow-md">
                                                    {percentage.toFixed(0)}%
                                                  </span>
                                                )}
                                              </div>
                                            ) : null;
                                          })}
                                      </div>
                                    </div>
                                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                      <div className="text-sm font-semibold text-gray-300 mb-3">Detailed Emotion Scores:</div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {Object.entries(emotion.all_emotions)
                                          .sort(([, a], [, b]) => (b as number) - (a as number))
                                          .map(([emotionName, score]) => (
                                            <div key={emotionName} className="flex items-center gap-2 align-middle">
                                              <div 
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: getEmotionColor(emotionName) }}
                                              ></div>
                                              <span className="text-sm text-gray-200 capitalize">
                                                {emotionName}
                                              </span>
                                              <span className="text-sm text-gray-300">
                                                ({((score as number) * 100).toFixed(1)}%)
                                              </span>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Data Message */}
            {(!result.transcription && facialEmotions.length === 0 && speechEmotions.length === 0) && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-600">
                <p className="text-lg text-gray-400">No analysis data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisResults;

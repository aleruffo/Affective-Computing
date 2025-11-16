import React, { useState, useMemo } from 'react';
import { AnalysisResultsProps } from '../types';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onClose }) => {
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const facialEmotions = result.facial_emotions || result.emotions || [];
  const speechEmotions = result.speech_emotions || [];
  const audioEvents = result.audio_events || [];
  
  const getEmotionEmoji = (emotion: string): string => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😡',
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

  // Calculate emotion distribution over time for timeline graph
  const emotionTimeline = facialEmotions.map(emotion => ({
    timestamp: emotion.timestamp,
    emotion: emotion.emotion,
    all_emotions: emotion.all_emotions || {}
  }));

  // Prepare React Flow nodes and edges for thematic analysis
  const { nodes, edges } = useMemo(() => {
    if (!result.thematic_analysis?.themes) {
      return { nodes: [], edges: [] };
    }

    const themes = result.thematic_analysis.themes;
    const centerX = 300;
    const centerY = 250;

    // Center node
    const centerNode: Node = {
      id: 'center',
      type: 'default',
      position: { x: centerX, y: centerY },
      data: { 
        label: (
          <div className="text-center px-6 py-4">
            <div className="text-white font-bold text-lg">Main Themes</div>
            <div className="text-purple-200 text-sm">{themes.length} found</div>
          </div>
        )
      },
      style: {
        background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
        borderRadius: '50%',
        width: 150,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      },
      draggable: false,
    };

    // Theme nodes arranged in a circle
    const radius = 280;
    const themeNodes: Node[] = themes.map((theme, index) => {
      const angle = (index * 2 * Math.PI) / themes.length - Math.PI / 2; // Start from top
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      return {
        id: `theme-${index}`,
        type: 'default',
        position: { x: x - 100, y: y - 40 }, // Offset for node size
        data: {
          label: (
            <div className="text-center px-4 py-3">
              <div className="text-white font-bold text-sm">
                {theme.name.length > 25 ? theme.name.substring(0, 25) + '...' : theme.name}
              </div>
            </div>
          ),
        },
        style: {
          background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.9) 0%, rgba(109, 40, 217, 0.9) 100%)',
          borderRadius: 12,
          width: 200,
          height: 80,
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        },
        draggable: false,
      };
    });

    const flowNodes = [centerNode, ...themeNodes];

    // Create edges from center to each theme
    const flowEdges: Edge[] = themeNodes.map((node, index) => ({
      id: `edge-${index}`,
      source: 'center',
      target: node.id,
      type: 'straight',
      animated: false,
      style: {
        stroke: 'rgba(147, 51, 234, 0.4)',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      },
      markerEnd: {
        type: MarkerType.Arrow,
        color: 'rgba(147, 51, 234, 0.4)',
      },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [result.thematic_analysis]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 sticky top-0 z-10 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-semibold">Back</span>
                </button>
              )}
              <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Analysis Dashboard
              </h1>
            </div>
            {result.transcription && (
              <button
                onClick={() => setShowTranscriptionModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">🎤</span>
                View Transcription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">

        {/* Thematic Analysis Diagram */}
        {result.thematic_analysis && result.thematic_analysis.themes && result.thematic_analysis.themes.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2 mb-6">
              <span className="text-3xl">🧠</span>
              Thematic Analysis
            </h3>
            {result.thematic_analysis.summary && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg p-4 mb-6">
                <p className="text-base text-gray-100 leading-relaxed">{result.thematic_analysis.summary}</p>
              </div>
            )}
            
            {/* Network Graph using React Flow */}
            {nodes.length > 0 && (
              <div className="w-full" style={{ height: '600px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  zoomOnScroll={false}
                  panOnDrag={false}
                  fitView
                  fitViewOptions={{
                    padding: 0.2,
                  }}
                  style={{
                    background: 'transparent',
                  }}
                >
                  <Background color="#4B5563" gap={16} />
                  <Controls />
                </ReactFlow>
              </div>
            )}
          </div>
        )}

        {/* Emotion Comparison - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Speech Emotions */}
          {speechEmotions.length > 0 && (
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                  <span className="text-3xl">🎙️</span>
                  Speech Emotions
                </h3>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {speechEmotions.map((emotion, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{getEmotionEmoji(emotion.emotion)}</span>
                          <span className="text-lg font-semibold text-gray-100 capitalize">{emotion.emotion}</span>
                        </div>
                        <span className="text-sm font-mono text-purple-400">{emotion.timestamp.toFixed(1)}s</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${emotion.confidence * 100}%`,
                              backgroundColor: getEmotionColor(emotion.emotion),
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-200 min-w-[50px] text-right">{(emotion.confidence * 100).toFixed(0)}%</span>
                      </div>
                      {emotion.events.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {emotion.events.map((event, i) => (
                            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {event}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Facial Emotions Summary */}
          {facialEmotions.length > 0 && (
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30">
                <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
                  <span className="text-3xl">🎭</span>
                  Facial Emotions Distribution
                </h3>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {/* Emotion Distribution Bars */}
                <div className="space-y-4">
                  {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map((emotionType) => {
                    const count = facialEmotions.filter(e => e.emotion.toLowerCase() === emotionType).length;
                    const percentage = (count / facialEmotions.length) * 100;
                    return percentage > 0 ? (
                      <div key={emotionType} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getEmotionEmoji(emotionType)}</span>
                            <span className="text-lg font-semibold text-gray-100 capitalize">{emotionType}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-300">{count} frames ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getEmotionColor(emotionType),
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emotion Timeline Graph */}
        {emotionTimeline.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2 mb-6">
              <span className="text-3xl">📈</span>
              Emotion Timeline
            </h3>

            {/* Timeline Graph */}
            <div className="relative h-[400px] bg-gray-900/50 rounded-lg p-16">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pl-12 py-12">
                {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map((emotion) => (
                  <div key={emotion} className="flex items-center gap-2">
                    <span className="text-lg">{getEmotionEmoji(emotion)}</span>
                  </div>
                ))}
              </div>

              {/* Graph area */}
              <div className="ml-16 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="border-t border-gray-700/50"></div>
                  ))}
                </div>

                {/* Emotion markers */}
                <div className="absolute inset-0">
                  {emotionTimeline.map((point, index) => {
                    const emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];
                    const emotionIndex = emotions.indexOf(point.emotion.toLowerCase());
                    const xPos = (point.timestamp / (emotionTimeline[emotionTimeline.length - 1]?.timestamp || 1)) * 100;
                    const yPos = (emotionIndex / 6) * 100;

                    return (
                      <div
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{
                          left: `${xPos}%`,
                          top: `${yPos}%`,
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full shadow-lg"
                          style={{ backgroundColor: getEmotionColor(point.emotion) }}
                        ></div>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {point.emotion} at {point.timestamp.toFixed(1)}s
                        </div>
                      </div>
                    );
                  })}

                  {/* Connect points with lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {emotionTimeline.map((point, index) => {
                      if (index === 0) return null;
                      const prevPoint = emotionTimeline[index - 1];
                      const emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'];
                      
                      const x1 = (prevPoint.timestamp / (emotionTimeline[emotionTimeline.length - 1]?.timestamp || 1)) * 100;
                      const y1 = (emotions.indexOf(prevPoint.emotion.toLowerCase()) / 6) * 100;
                      const x2 = (point.timestamp / (emotionTimeline[emotionTimeline.length - 1]?.timestamp || 1)) * 100;
                      const y2 = (emotions.indexOf(point.emotion.toLowerCase()) / 6) * 100;

                      return (
                        <line
                          key={index}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke="rgba(147, 51, 234, 0.5)"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* X-axis time markers */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs text-gray-400">
                  <span>0s</span>
                  {emotionTimeline.length > 0 && (
                    <>
                      <span>{(emotionTimeline[emotionTimeline.length - 1].timestamp / 2).toFixed(1)}s</span>
                      <span>{emotionTimeline[emotionTimeline.length - 1].timestamp.toFixed(1)}s</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Events */}
        {audioEvents.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-100 flex items-center gap-2 mb-4">
              <span className="text-3xl">🔊</span>
              Audio Events Detected
            </h3>
            <div className="flex flex-wrap gap-3">
              {audioEvents.map((event, index) => (
                <span key={index} className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 text-orange-200 px-5 py-2.5 rounded-full font-semibold text-base shadow-sm">
                  {event}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transcription Modal */}
      {showTranscriptionModal && result.transcription && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowTranscriptionModal(false)}
          ></div>
          <div className="fixed inset-8 z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                  <span className="text-3xl">🎤</span>
                  Speech Transcription
                </h2>
                <button
                  onClick={() => setShowTranscriptionModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-6 mb-6">
                  <p className="text-lg text-gray-100 leading-relaxed">{result.transcription.text}</p>
                  <div className="flex gap-4 mt-4 text-sm text-gray-300">
                    <span className="bg-gray-800 px-3 py-1 rounded-full">
                      Language: <span className="text-blue-400">{result.transcription.language}</span>
                    </span>
                    <span className="bg-gray-800 px-3 py-1 rounded-full">
                      Segments: <span className="text-blue-400">{result.transcription.segments.length}</span>
                    </span>
                  </div>
                </div>
                {result.transcription.segments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">Timeline</h4>
                    {result.transcription.segments.map((segment, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                        <span className="text-sm font-mono text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full whitespace-nowrap">
                          {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                        </span>
                        <span className="text-gray-200 flex-1">{segment.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisResults;

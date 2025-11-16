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
          <div className="text-center px-6 py-4 font-mono">
            <div className="text-eink-black font-bold text-base">THEMES</div>
            <div className="text-eink-gray text-xs">{themes.length}</div>
          </div>
        )
      },
      style: {
        background: '#e8e8e8',
        borderRadius: '50%',
        width: 150,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid #1a1a1a',
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
            <div className="text-center px-4 py-3 font-mono">
              <div className="text-eink-black font-bold text-xs">
                {theme.name.length > 25 ? theme.name.substring(0, 25) + '...' : theme.name}
              </div>
            </div>
          ),
        },
        style: {
          background: '#ffffff',
          borderRadius: 0,
          width: 200,
          height: 80,
          border: '2px solid #1a1a1a',
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
        stroke: '#1a1a1a',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      },
      markerEnd: {
        type: MarkerType.Arrow,
        color: '#1a1a1a',
      },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [result.thematic_analysis]);

  return (
    <div className="min-h-screen bg-eink-white">
      {/* Header with Back Button */}
      <div className="bg-white border-b-2 border-eink-black sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 text-eink-black hover:bg-eink-white px-4 py-2 border-2 border-eink-black font-bold font-mono"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>BACK</span>
                </button>
              )}
              <h1 className="text-2xl font-bold text-eink-black font-mono">
                ANALYSIS REPORT
              </h1>
            </div>
            {result.transcription && (
              <button
                onClick={() => setShowTranscriptionModal(true)}
                className="flex items-center gap-2 bg-eink-black text-white px-6 py-3 border-2 border-eink-black font-bold font-mono hover:bg-white hover:text-eink-black"
              >
                [ TRANSCRIPT ]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">

        {/* Thematic Analysis Diagram */}
        {result.thematic_analysis && result.thematic_analysis.themes && result.thematic_analysis.themes.length > 0 && (
          <div className="bg-white border-4 border-eink-black p-8">
            <h3 className="text-xl font-bold text-eink-black font-mono mb-6 border-b-2 border-eink-black pb-2">
              THEMATIC ANALYSIS
            </h3>
            
            {/* Graph and Summary Side by Side */}
            <div className="flex gap-6">
              {/* Network Graph - 2/3 width */}
              {nodes.length > 0 && (
                <div className="w-2/3 border-2 border-eink-black" style={{ height: '600px' }}>
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
                      background: '#f5f5f5',
                    }}
                  >
                    <Background color="#cccccc" gap={16} />
                    <Controls />
                  </ReactFlow>
                </div>
              )}
              
              {/* Summary - 1/3 width */}
              {result.thematic_analysis.summary && (
                <div className="w-1/3">
                  <div className="bg-eink-white border-2 border-eink-black p-4 h-full dither-pattern">
                    <h4 className="text-sm font-bold text-eink-black font-mono mb-3 border-b border-eink-black pb-2">LLM SUMMARY</h4>
                    <p className="text-sm text-eink-black leading-relaxed font-mono">{result.thematic_analysis.summary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emotion Comparison - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Speech Emotions */}
          {speechEmotions.length > 0 && (
            <div className="bg-white border-4 border-eink-black overflow-hidden">
              <div className="p-4 bg-eink-black text-white border-b-2 border-eink-black">
                <h3 className="text-lg font-bold font-mono">
                  SPEECH EMOTIONS
                </h3>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {speechEmotions.map((emotion, index) => (
                    <div key={index} className="bg-eink-white border-2 border-eink-black p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEmotionEmoji(emotion.emotion)}</span>
                          <span className="text-sm font-bold text-eink-black uppercase font-mono">{emotion.emotion}</span>
                        </div>
                        <span className="text-xs font-mono text-eink-gray">{emotion.timestamp.toFixed(1)}s</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-4 bg-white border-2 border-eink-black overflow-hidden">
                          <div
                            className="h-full bg-eink-black"
                            style={{
                              width: `${emotion.confidence * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-eink-black min-w-[45px] text-right font-mono">{(emotion.confidence * 100).toFixed(0)}%</span>
                      </div>
                      {emotion.events.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {emotion.events.map((event, i) => (
                            <span key={i} className="text-xs bg-white border border-eink-black text-eink-black px-2 py-1 font-mono">
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
            <div className="bg-white border-4 border-eink-black overflow-hidden">
              <div className="p-4 bg-eink-black text-white border-b-2 border-eink-black">
                <h3 className="text-lg font-bold font-mono">
                  FACIAL EMOTIONS
                </h3>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {/* Emotion Distribution Bars */}
                <div className="space-y-3">
                  {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map((emotionType) => {
                    const count = facialEmotions.filter(e => e.emotion.toLowerCase() === emotionType).length;
                    const percentage = (count / facialEmotions.length) * 100;
                    return percentage > 0 ? (
                      <div key={emotionType} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getEmotionEmoji(emotionType)}</span>
                            <span className="text-sm font-bold text-eink-black uppercase font-mono">{emotionType}</span>
                          </div>
                          <span className="text-xs font-bold text-eink-gray font-mono">{count}f ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-4 bg-white border-2 border-eink-black overflow-hidden">
                          <div
                            className="h-full bg-eink-black"
                            style={{
                              width: `${percentage}%`,
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
          <div className="bg-white border-4 border-eink-black p-6">
            <h3 className="text-xl font-bold text-eink-black font-mono mb-6 border-b-2 border-eink-black pb-2">
              EMOTION TIMELINE
            </h3>

            {/* Timeline Graph */}
            <div className="relative h-[400px] bg-eink-white border-2 border-eink-black p-12">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-eink-black pl-8 py-10">
                {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map((emotion) => (
                  <div key={emotion} className="flex items-center gap-2">
                    <span className="text-base">{getEmotionEmoji(emotion)}</span>
                  </div>
                ))}
              </div>

              {/* Graph area */}
              <div className="ml-12 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="border-t border-eink-gray border-dashed opacity-30"></div>
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
                          className="w-2 h-2 bg-eink-black border border-eink-black"
                        ></div>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-eink-black text-white text-xs px-2 py-1 whitespace-nowrap z-10 font-mono">
                          {point.emotion} @ {point.timestamp.toFixed(1)}s
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
                          stroke="#1a1a1a"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* X-axis time markers */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-eink-gray font-mono">
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
          <div className="bg-white border-4 border-eink-black p-6">
            <h3 className="text-xl font-bold text-eink-black font-mono mb-4 border-b-2 border-eink-black pb-2">
              AUDIO EVENTS
            </h3>
            <div className="flex flex-wrap gap-2">
              {audioEvents.map((event, index) => (
                <span key={index} className="bg-eink-black text-white px-4 py-2 border-2 border-eink-black font-bold text-sm font-mono">
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
            className="fixed inset-0 bg-eink-black/80 z-40"
            onClick={() => setShowTranscriptionModal(false)}
          ></div>
          <div className="fixed inset-8 z-50 flex items-center justify-center">
            <div className="bg-white border-4 border-eink-black w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 bg-eink-black text-white border-b-2 border-eink-black">
                <h2 className="text-xl font-bold font-mono">
                  TRANSCRIPTION
                </h2>
                <button
                  onClick={() => setShowTranscriptionModal(false)}
                  className="text-white hover:bg-eink-dark p-2 border-2 border-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-eink-white border-2 border-eink-black p-6 mb-6 dither-pattern">
                  <p className="text-sm text-eink-black leading-relaxed font-mono">{result.transcription.text}</p>
                  <div className="flex gap-4 mt-4 text-xs text-eink-black font-mono">
                    <span className="bg-white border border-eink-black px-3 py-1">
                      LANG: <span className="font-bold">{result.transcription.language}</span>
                    </span>
                    <span className="bg-white border border-eink-black px-3 py-1">
                      SEG: <span className="font-bold">{result.transcription.segments.length}</span>
                    </span>
                  </div>
                </div>
                {result.transcription.segments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-eink-black mb-3 font-mono border-b-2 border-eink-black pb-1">TIMELINE</h4>
                    {result.transcription.segments.map((segment, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white border-2 border-eink-black hover:bg-eink-white">
                        <span className="text-xs font-mono text-eink-black bg-eink-white border border-eink-black px-2 py-1 whitespace-nowrap">
                          {segment.start.toFixed(1)}s-{segment.end.toFixed(1)}s
                        </span>
                        <span className="text-eink-black flex-1 font-mono text-sm">{segment.text}</span>
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

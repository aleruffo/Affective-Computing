import { useState } from 'react'
import VideoRecorder from './components/VideoRecorder'
import AnalysisResults from './components/AnalysisResults'
import SavedVideos from './components/SavedVideos'
import { AnalysisResponse } from './types'
import './App.css'

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'record' | 'saved'>('record')

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisResult(result)
    setIsAnalyzing(false)
  }

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎭 Affective Computing</h1>
          <p>Advanced Video Emotion Analysis Platform</p>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => setActiveTab('record')}
        >
          🎥 Record New Video
        </button>
        <button 
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          📁 Saved Videos
        </button>
      </div>

      <main className="app-main">
        {activeTab === 'record' ? (
          <>
            <VideoRecorder 
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
              isAnalyzing={isAnalyzing}
            />
            
            {analysisResult && (
              <AnalysisResults result={analysisResult} />
            )}
          </>
        ) : (
          <SavedVideos 
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisStart={handleAnalysisStart}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by SenseVoice & DeepFace</p>
      </footer>
    </div>
  )
}

export default App

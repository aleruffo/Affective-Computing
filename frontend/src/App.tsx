import { useState } from 'react'
import VideoRecorder from './components/VideoRecorder'
import AnalysisResults from './components/AnalysisResults'
import { AnalysisResponse } from './types'
import './App.css'

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
        <h1>🎭 Affective Computing</h1>
        <p>Video Emotion Analysis Platform</p>
      </header>

      <main className="app-main">
        <VideoRecorder 
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisStart={handleAnalysisStart}
          isAnalyzing={isAnalyzing}
        />
        
        {analysisResult && (
          <AnalysisResults result={analysisResult} />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by OpenAI Whisper & DeepFace</p>
      </footer>
    </div>
  )
}

export default App

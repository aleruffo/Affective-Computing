import { useState } from 'react'
import VideoRecorder from './components/VideoRecorder'
import AnalysisResults from './components/AnalysisResults.tsx'
import SavedVideos from './components/SavedVideos.tsx'
import { AnalysisResponse } from './types'

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary to-secondary-dark">
      <header className="bg-gradient-primary text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">
            🎭 Affective Computing
          </h1>
          <p className="text-lg md:text-xl opacity-95">
            Advanced Video Emotion Analysis Platform
          </p>
        </div>
      </header>

      <nav className="bg-white shadow-md sticky top-0 z-50 flex justify-center">
        <button 
          className={`flex-1 max-w-xs px-8 py-5 text-lg font-semibold transition-all duration-300 border-b-3 ${
            activeTab === 'record' 
              ? 'text-primary border-b-primary bg-white relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-primary' 
              : 'text-gray-600 border-b-transparent hover:bg-gray-50 hover:text-primary'
          }`}
          onClick={() => setActiveTab('record')}
        >
          🎥 Record New Video
        </button>
        <button 
          className={`flex-1 max-w-xs px-8 py-5 text-lg font-semibold transition-all duration-300 border-b-3 ${
            activeTab === 'saved' 
              ? 'text-primary border-b-primary bg-white relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-primary' 
              : 'text-gray-600 border-b-transparent hover:bg-gray-50 hover:text-primary'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          📁 Saved Videos
        </button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
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

      <footer className="bg-white/90 text-center p-6 text-gray-600 shadow-inner">
        <p>Powered by SenseVoice & DeepFace</p>
      </footer>
    </div>
  )
}

export default App

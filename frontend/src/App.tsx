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

  // If there's an analysis result, show it as a separate page
  if (analysisResult) {
    return (
      <AnalysisResults 
        result={analysisResult} 
        onClose={() => setAnalysisResult(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-eink-white">
      <header className="bg-eink-paper border-b-2 border-eink-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-eink-black text-center tracking-tight font-mono">
            JOURNALING ASSISTANT
          </h1>
        </div>
      </header>

      <nav className="bg-white border-b-2 border-eink-black sticky top-0 z-50 flex justify-center">
        <button 
          className={`flex-1 max-w-xs px-6 py-4 text-base font-bold font-mono border-r-2 border-eink-black ${
            activeTab === 'record' 
              ? 'bg-eink-black text-white' 
              : 'bg-white text-eink-black hover:bg-eink-white'
          }`}
          onClick={() => setActiveTab('record')}
        >
          [ NEW ENTRY ]
        </button>
        <button 
          className={`flex-1 max-w-xs px-6 py-4 text-base font-bold font-mono ${
            activeTab === 'saved' 
              ? 'bg-eink-black text-white' 
              : 'bg-white text-eink-black hover:bg-eink-white'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          [ ARCHIVE ]
        </button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {activeTab === 'record' ? (
          <>
            <VideoRecorder 
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
              isAnalyzing={isAnalyzing}
            />
          </>
        ) : (
          <SavedVideos 
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisStart={handleAnalysisStart}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>

      <footer className="bg-white text-center p-4 text-eink-gray border-t-2 border-eink-black">
        <p className="font-mono text-sm">POWERED BY SENSEVOICE & DEEPFACE</p>
      </footer>
    </div>
  )
}

export default App

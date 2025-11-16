import { useState, useEffect } from 'react'
import VideoRecorder from './components/VideoRecorder'
import AnalysisResults from './components/AnalysisResults.tsx'
import SavedVideos from './components/SavedVideos.tsx'
import Dashboard from './components/Dashboard.tsx'
import Onboarding from './components/Onboarding.tsx'
import { AnalysisResponse } from './types'

type ViewType = 'onboarding' | 'dashboard' | 'record' | 'saved';

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    if (!onboardingComplete) {
      setCurrentView('onboarding');
    } else {
      setCurrentView('dashboard');
    }
  }, []);

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisResult(result)
    setIsAnalyzing(false)
  }

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
  }

  const handleOnboardingComplete = () => {
    setCurrentView('dashboard');
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

  // Show onboarding if not completed
  if (currentView === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show dashboard
  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        onNewEntry={() => setCurrentView('record')}
        onViewArchive={() => setCurrentView('saved')}
      />
    );
  }

  // Show record view
  if (currentView === 'record') {
    return (
      <VideoRecorder 
        onAnalysisComplete={handleAnalysisComplete}
        onAnalysisStart={handleAnalysisStart}
        isAnalyzing={isAnalyzing}
        onBack={() => setCurrentView('dashboard')}
        onViewArchive={() => setCurrentView('saved')}
      />
    );
  }

  // Show saved videos view
  if (currentView === 'saved') {
    return (
      <SavedVideos 
        onAnalysisComplete={handleAnalysisComplete}
        onAnalysisStart={handleAnalysisStart}
        isAnalyzing={isAnalyzing}
        onBack={() => setCurrentView('dashboard')}
        onNewEntry={() => setCurrentView('record')}
      />
    );
  }

  // This should never be reached
  return null;
}

export default App

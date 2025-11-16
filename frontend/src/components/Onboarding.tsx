import React, { useState } from 'react';
import { setupUserProfile } from '../services/api';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goals, setGoals] = useState('');
  const [preferences, setPreferences] = useState({
    emotionFocus: [] as string[],
    journalFrequency: 'daily',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 4;

  const handleEmotionToggle = (emotion: string) => {
    setPreferences(prev => ({
      ...prev,
      emotionFocus: prev.emotionFocus.includes(emotion)
        ? prev.emotionFocus.filter(e => e !== emotion)
        : [...prev.emotionFocus, emotion]
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await setupUserProfile({
        name: name.trim(),
        goals: goals.trim() || null,
        preferences,
      });

      // Mark onboarding as complete
      localStorage.setItem('onboarding_complete', 'true');
      
      onComplete();
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save your profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 2) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-eink-paper flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-eink-black mb-2">
            [ AFFECTIVE COMPUTING ]
          </h1>
          <p className="text-eink-gray font-mono">
            STEP {step} OF {totalSteps}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 w-12 border-2 border-eink-black ${
                  i < step ? 'bg-eink-black' : 'bg-eink-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-eink-white border-4 border-eink-black p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-eink-black mb-4">
                [ WELCOME ]
              </h2>
              <div className="space-y-4 text-eink-dark font-mono">
                <p>
                  This is your personal emotional wellness companion.
                </p>
                <p>
                  Record video diary entries and receive AI-powered emotional
                  analysis including:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li>→ Speech emotion recognition</li>
                  <li>→ Facial emotion detection</li>
                  <li>→ Automatic transcription</li>
                  <li>→ Thematic analysis</li>
                </ul>
                <p className="pt-4">
                  All processing happens locally on your device. Your data
                  remains private and secure.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-eink-black mb-4">
                [ BASIC INFO ]
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-eink-dark font-mono mb-2">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border-2 border-eink-black bg-eink-paper font-mono text-eink-black focus:outline-none focus:border-eink-dark"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-eink-gray font-mono">
                  We'll use this to personalize your experience.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-eink-black mb-4">
                [ YOUR GOALS ]
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-eink-dark font-mono mb-2">
                    What do you hope to achieve with emotional journaling?
                  </label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="E.g., Better understand my emotions, track mood patterns, improve self-awareness..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-eink-black bg-eink-paper font-mono text-eink-black focus:outline-none focus:border-eink-dark resize-none"
                  />
                </div>
                <p className="text-sm text-eink-gray font-mono">
                  Optional: This helps us understand how to better support you.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-eink-black mb-4">
                [ PREFERENCES ]
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-eink-dark font-mono mb-3">
                    Which emotions are you most interested in tracking?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map(
                      (emotion) => (
                        <button
                          key={emotion}
                          onClick={() => handleEmotionToggle(emotion)}
                          className={`px-4 py-3 border-2 border-eink-black font-mono transition-colors ${
                            preferences.emotionFocus.includes(emotion)
                              ? 'bg-eink-black text-eink-white'
                              : 'bg-eink-white text-eink-black hover:bg-eink-light'
                          }`}
                        >
                          {preferences.emotionFocus.includes(emotion) ? '[x]' : '[ ]'}{' '}
                          {emotion.toUpperCase()}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-eink-dark font-mono mb-3">
                    How often do you plan to journal?
                  </label>
                  <div className="space-y-2">
                    {['daily', 'weekly', 'as-needed'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            journalFrequency: freq,
                          }))
                        }
                        className={`w-full px-4 py-3 border-2 border-eink-black font-mono text-left transition-colors ${
                          preferences.journalFrequency === freq
                            ? 'bg-eink-black text-eink-white'
                            : 'bg-eink-white text-eink-black hover:bg-eink-light'
                        }`}
                      >
                        {preferences.journalFrequency === freq ? '(•)' : '( )'}{' '}
                        {freq === 'daily'
                          ? 'DAILY'
                          : freq === 'weekly'
                          ? 'WEEKLY'
                          : 'AS NEEDED'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 border-2 border-eink-black bg-red-50">
              <p className="font-mono text-red-800">[ ERROR ] {error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className={`px-6 py-3 border-2 border-eink-black font-mono ${
                step === 1
                  ? 'bg-eink-light text-eink-gray cursor-not-allowed'
                  : 'bg-eink-white text-eink-black hover:bg-eink-black hover:text-eink-white'
              } transition-colors`}
            >
              [ BACK ]
            </button>

            {step < totalSteps ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className={`px-6 py-3 border-2 border-eink-black font-mono ${
                  !canProceed()
                    ? 'bg-eink-light text-eink-gray cursor-not-allowed'
                    : 'bg-eink-black text-eink-white hover:bg-eink-dark'
                } transition-colors`}
              >
                [ NEXT ]
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className={`px-6 py-3 border-2 border-eink-black font-mono ${
                  isSubmitting || !canProceed()
                    ? 'bg-eink-light text-eink-gray cursor-not-allowed'
                    : 'bg-eink-black text-eink-white hover:bg-eink-dark'
                } transition-colors`}
              >
                {isSubmitting ? '[ SAVING... ]' : '[ FINISH ]'}
              </button>
            )}
          </div>
        </div>

        {/* Skip option */}
        {step === 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                localStorage.setItem('onboarding_complete', 'true');
                onComplete();
              }}
              className="font-mono text-eink-gray hover:text-eink-black underline"
            >
              Skip onboarding
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

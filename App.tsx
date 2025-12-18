// @ts-nocheck
import React, { useState } from 'react';
import { Plane, User } from 'lucide-react';
import TripInputForm from './components/TripInputForm';
import PlanDisplay from './components/PlanDisplay';
import { AppState, TripFormData, RefinementOption, REFINEMENT_LABELS } from './types';
import { initializeTripChat, refineTripPlan } from './services/geminiService';

declare global {
  // Define AIStudio interface to avoid type mismatch with internal environment types
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Augment the Window interface using the AIStudio type expected by the environment
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [tripPlan, setTripPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: TripFormData) => {
    setAppState(AppState.LOADING);
    setIsProcessing(true);
    setError(null);
    try {
      const plan = await initializeTripChat(data);
      setTripPlan(plan);
      setAppState(AppState.PLAN_VIEW);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
        setError("API Key configuration error. Please click your avatar to re-select a valid key.");
      } else {
        setError("Failed to generate trip plan. Please ensure your API key is configured correctly by clicking the avatar.");
      }
      setAppState(AppState.INPUT);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefine = async (option: RefinementOption) => {
    setIsProcessing(true);
    const refinementText = `Option ${option}: ${REFINEMENT_LABELS[option]}`;
    try {
      const updatedPlan = await refineTripPlan(refinementText);
      setTripPlan(updatedPlan);
    } catch (err) {
      setError("Failed to update plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTripPlan('');
    setAppState(AppState.INPUT);
    setError(null);
  };

  const handleAvatarClick = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
      }
    } catch (err) {
      console.error("Failed to open key selection dialog", err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-brand-500">
                <Plane className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              AI Trip Planner
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">My Trips</button>
            <button 
              onClick={handleAvatarClick}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-purple-500 p-[2px] hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-brand-500/20"
              title="Configure API Key"
            >
                <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                    <User className="w-4 h-4 text-slate-300" />
                </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg flex flex-col items-center gap-2 text-center animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="font-medium">{error}</p>
                <button 
                   onClick={handleAvatarClick}
                   className="text-xs underline hover:text-white transition-colors"
                >
                  Configure API Key Now
                </button>
            </div>
        )}

        {appState === AppState.INPUT && (
          <div className="animate-fade-in-up space-y-8">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    Let's plan your perfect trip
                </h2>
                <p className="text-slate-400">
                    Tell us a bit about your travel style, and our AI will handle the rest.
                </p>
                
                <div className="mt-6 flex items-center gap-4 text-xs font-semibold tracking-wider text-brand-500 uppercase">
                    <span>Planning Mode</span>
                    <div className="h-[2px] w-24 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-brand-500"></div>
                    </div>
                    <span className="text-slate-500">Step 1 of 1</span>
                </div>
             </div>
             
             <TripInputForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin relative z-10"></div>
            </div>
            <h3 className="text-2xl font-semibold text-white mt-8">Designing your itinerary...</h3>
            <p className="text-slate-400 mt-2">Balancing your preferences with realistic constraints.</p>
          </div>
        )}

        {appState === AppState.PLAN_VIEW && (
          <div className="animate-fade-in">
            <PlanDisplay 
              planContent={tripPlan} 
              isRefining={isProcessing}
              onRefine={handleRefine}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
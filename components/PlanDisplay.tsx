import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RefinementOption, REFINEMENT_LABELS } from '../types';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

interface PlanDisplayProps {
  planContent: string;
  isRefining: boolean;
  onRefine: (option: RefinementOption) => void;
  onReset: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ planContent, isRefining, onRefine, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-32">
      
      {/* Plan Content Card */}
      <div className="bg-dark-800 rounded-2xl shadow-2xl overflow-hidden border border-dark-700">
        <div className="bg-dark-900 border-b border-dark-700 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-lg text-white">Your Trip Itinerary</h2>
          </div>
          <button 
            onClick={onReset}
            className="text-xs bg-dark-700 text-slate-300 hover:text-white hover:bg-dark-600 px-3 py-1 rounded-full transition-colors border border-dark-600"
          >
            New Trip
          </button>
        </div>
        
        <div className="p-6 md:p-10 markdown-body">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>
             {planContent}
           </ReactMarkdown>
        </div>
      </div>

      {/* Refinement Actions Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-900/90 backdrop-blur-md border-t border-dark-700 p-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-slate-400 mb-4 text-center uppercase tracking-wide">
            Refine this plan
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
             {(Object.keys(REFINEMENT_LABELS) as RefinementOption[]).map((option) => (
               <button
                 key={option}
                 onClick={() => onRefine(option)}
                 disabled={isRefining}
                 className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                    ${isRefining 
                        ? 'bg-dark-800 text-slate-600 border-dark-700 cursor-not-allowed' 
                        : 'bg-dark-800 hover:bg-brand-900/30 text-slate-300 hover:text-brand-400 border-dark-700 hover:border-brand-500/50 shadow-lg active:scale-95'
                    }
                 `}
               >
                 {isRefining ? (
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                 ) : (
                    <span className="font-bold text-brand-500">{option}</span>
                 )}
                 {REFINEMENT_LABELS[option]}
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
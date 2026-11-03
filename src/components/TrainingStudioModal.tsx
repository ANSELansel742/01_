import React, { useState, useEffect } from 'react';
import { TrainingEngine, TrainingExample, TrainingMetrics } from '../services/trainingEngine';
import { SupportedLanguage } from '../types';
import { I18N } from '../i18n/translations';
import { X, Play, Plus, Trash2, CheckCircle2, Brain, Sparkles, Sliders, AlertCircle, RefreshCw } from 'lucide-react';

interface TrainingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
}

export const TrainingStudioModal: React.FC<TrainingStudioModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const engine = TrainingEngine.getInstance();
  const [examples, setExamples] = useState<TrainingExample[]>(() => engine.getExamples());
  const [metrics, setMetrics] = useState<TrainingMetrics>(() => engine.getMetrics());

  // Form state
  const [queryInput, setQueryInput] = useState('');
  const [targetAnswerInput, setTargetAnswerInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<TrainingExample['category']>('correction');
  const [ratingInput, setRatingInput] = useState<number>(1);
  const [notesInput, setNotesInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Training execution state
  const [isTrainingRunning, setIsTrainingRunning] = useState(false);
  const [currentTrainingEpoch, setCurrentTrainingEpoch] = useState<number>(0);
  const [liveLoss, setLiveLoss] = useState<number>(metrics.currentLoss);

  useEffect(() => {
    const unsub = engine.subscribe(() => {
      setExamples(engine.getExamples());
      setMetrics(engine.getMetrics());
      setLiveLoss(engine.getMetrics().currentLoss);
    });
    return () => unsub();
  }, [engine]);

  if (!isOpen) return null;

  const t = I18N[language] || I18N.en;

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || !targetAnswerInput.trim()) return;

    engine.addFeedback(queryInput, targetAnswerInput, ratingInput, notesInput, categoryInput);
    setQueryInput('');
    setTargetAnswerInput('');
    setNotesInput('');
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  const handleDeleteExample = (id: string) => {
    engine.removeExample(id);
  };

  const handleRunFineTuning = async () => {
    setIsTrainingRunning(true);
    setCurrentTrainingEpoch(1);

    await engine.runFineTuning(4, (ep, loss) => {
      setCurrentTrainingEpoch(ep);
      setLiveLoss(loss);
    });

    setIsTrainingRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c121e] border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>LLM 1 Guard Training Studio & Feedback Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ARP-1 Guard & Data Shield
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Train the security guard model in real-time. Forbids company information leaks, protects personal data, and adapts to custom user feedback.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Row: Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Feedback Pairs</span>
              <div className="text-xl font-bold font-mono text-cyan-400">{metrics.totalExamples}</div>
              <span className="text-[10px] text-slate-500">Learned examples</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Epochs Trained</span>
              <div className="text-xl font-bold font-mono text-blue-400">{metrics.epochsCompleted}</div>
              <span className="text-[10px] text-slate-500">Fine-tuning cycles</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Current Loss</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {isTrainingRunning ? liveLoss.toFixed(3) : metrics.currentLoss.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-500">Lower is better</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Adapter Alignment</span>
              <div className="text-xl font-bold font-mono text-purple-400">{metrics.accuracyPercent.toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500">Accuracy score</span>
            </div>
          </div>

          {/* Action Row: Run Fine-Tuning */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-white text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Run Continuous Training Epochs (Local LoRA Calibration)</span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates real-time gradient optimization over your custom feedback dataset, adjusting weights to prevent repetitive or canned answers.
              </p>
            </div>

            <button
              onClick={handleRunFineTuning}
              disabled={isTrainingRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-md ${
                isTrainingRunning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 hover:shadow-cyan-500/20'
              }`}
            >
              {isTrainingRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Training Epoch {currentTrainingEpoch}/4... (Loss: {liveLoss.toFixed(3)})</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute 4 Training Epochs</span>
                </>
              )}
            </button>
          </div>

          {/* Add New Training Rule Form */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Teach the Model a Custom Rule / Correct an Answer</span>
              </div>
              {feedbackSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rule saved into 3GB Model Adapter!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleAddExample} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    User Query / Question Pattern:
                  </label>
                  <input
                    type="text"
                    value={queryInput}
                    onChange={e => setQueryInput(e.target.value)}
                    placeholder="e.g. How does offline mode work? or 樹莓派如何運行？"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Category:
                    </label>
                    <select
                      value={categoryInput}
                      onChange={e => setCategoryInput(e.target.value as any)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="correction">Correction</option>
                      <option value="preference">User Preference</option>
                      <option value="technical">Technical / Code</option>
                      <option value="language">Language / Translation</option>
                      <option value="general">General Knowledge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Feedback Type:
                    </label>
                    <select
                      value={ratingInput}
                      onChange={e => setRatingInput(parseInt(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="1">👍 Positive (Target)</option>
                      <option value="-1">👎 Negative (Forbidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Desired / Target Model Answer (What should the model answer?):
                </label>
                <textarea
                  rows={3}
                  value={targetAnswerInput}
                  onChange={e => setTargetAnswerInput(e.target.value)}
                  placeholder="Provide the exact customized response, tone, or technical precision you expect from the model..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save to Training Memory</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Training Dataset List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="font-semibold text-slate-300">
                Active Training Dataset ({examples.length} rules)
              </span>
              <span>Sorted by priority alignment</span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {examples.map(ex => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          ex.rating > 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {ex.rating > 0 ? '👍 Aligned' : '👎 Disapproved'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {ex.category}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        Epochs: {ex.epochsTrained} · Loss: {ex.loss || 0.05}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteExample(ex.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Remove from training memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono text-[11px]">Query Trigger: </span>
                    <span className="font-medium text-slate-200">"{ex.query}"</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                    {ex.targetAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0f172a] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Single 3GB LLM Engine · Unified Trilingual Adapter</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

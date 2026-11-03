import React from 'react';
import { Citation } from '../types';
import { FileText, X, Copy, Check } from 'lucide-react';

interface CitationViewerModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationViewerModal: React.FC<CitationViewerModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#0b101c] border border-slate-800 rounded-xl shadow-2xl p-5 text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white truncate max-w-[280px]">
              {citation.documentName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Chunk Section: {citation.chunkIndex + 1}</span>
          <span className="text-cyan-400 font-semibold">Similarity Match: {Math.round(citation.score * 100)}%</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-sans">
          {citation.snippet}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Passage'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

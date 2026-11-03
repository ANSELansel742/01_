import React, { useState } from 'react';
import { UploadedDocument, DocumentChunk, Citation, RAGSettings } from '../types';
import { DocumentRAGProcessor } from '../services/documentRAG';
import { FileText, Upload, Trash2, Search, X, CheckCircle, Database } from 'lucide-react';

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UploadedDocument[];
  onUploadDocument: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => void;
  ragSettings: RAGSettings;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  documents,
  onUploadDocument,
  onDeleteDocument,
  ragSettings,
}) => {
  const [testQuery, setTestQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Citation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const ragProcessor = DocumentRAGProcessor.getInstance();

  if (!isOpen) return null;

  const handleTestSearch = () => {
    if (!testQuery.trim()) return;
    const results = ragProcessor.searchRelevantChunks(testQuery, ragSettings);
    setSearchResults(results);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        for (let i = 0; i < e.target.files.length; i++) {
          await onUploadDocument(e.target.files[i]);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0b101c] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white">Local Document Knowledge Base (RAG)</h2>
              <p className="text-[11px] text-slate-400">
                Uploaded files are chunked and indexed entirely on your device for high-accuracy response citations.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Upload Box */}
          <div className="p-4 border-2 border-dashed border-slate-800 hover:border-cyan-700/80 rounded-xl bg-slate-900/40 text-center transition-colors">
            <input
              type="file"
              multiple
              id="doc-upload-input"
              accept=".txt,.md,.pdf,.json,.csv,.py,.js,.ts,.html,.log"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="doc-upload-input"
              className="flex flex-col items-center justify-center cursor-pointer space-y-2 py-2"
            >
              <Upload className="w-6 h-6 text-cyan-400" />
              <div className="text-slate-200 font-medium">
                {isUploading ? 'Chunking and indexing files...' : 'Upload local files (.txt, .md, .pdf, .json, .csv, code)'}
              </div>
              <div className="text-[11px] text-slate-500">
                Files remain strictly in your browser memory and local storage. No network upload.
              </div>
            </label>
          </div>

          {/* Documents Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">Indexed Files ({documents.length})</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {documents.reduce((acc, d) => acc + d.chunksCount, 0)} total semantic chunks
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-900/30 rounded-lg border border-slate-800">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800 bg-slate-900/40">
                {documents.map(doc => (
                  <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition">
                    <div className="flex items-center gap-2.5 truncate min-w-0 pr-3">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-slate-200 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {Math.round(doc.sizeBytes / 1024)} KB · {doc.chunksCount} chunks · {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                      title="Delete document and remove its chunks"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Semantic Retrieval Tester */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Test Vector / BM25 Semantic Retrieval</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                RAG Engine Active
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type query to test document retrieval (e.g., 'offline', 'safety', 'raspberry pi')..."
                value={testQuery}
                onChange={e => setTestQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTestSearch()}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-600 text-xs"
              />
              <button
                onClick={handleTestSearch}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs transition"
              >
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-medium text-cyan-300">
                  Top Relevant Passages Found:
                </span>
                {searchResults.map((result, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-medium text-slate-200">{result.documentName}</span>
                      <span className="text-cyan-400 font-mono">Similarity: {Math.round(result.score * 100)}%</span>
                    </div>
                    <p className="text-slate-300 italic">"{result.snippet}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1424] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

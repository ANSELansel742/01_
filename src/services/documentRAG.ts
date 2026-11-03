import { UploadedDocument, DocumentChunk, Citation, RAGSettings } from '../types';
import { IndexedDBStorageManager } from './indexedDBStorage';

const STORAGE_KEY_DOCS = 'sovereign_rag_documents_v1';

export class DocumentRAGProcessor {
  private static instance: DocumentRAGProcessor;
  private documents: UploadedDocument[] = [];
  private chunks: DocumentChunk[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): DocumentRAGProcessor {
    if (!DocumentRAGProcessor.instance) {
      DocumentRAGProcessor.instance = new DocumentRAGProcessor();
    }
    return DocumentRAGProcessor.instance;
  }

  private loadFromStorage() {
    // 1. First check IndexedDB for large documents
    IndexedDBStorageManager.getInstance()
      .getDocuments()
      .then(docs => {
        if (docs && docs.length > 0) {
          this.documents = docs;
          this.rebuildChunks();
        } else {
          // Fallback to localStorage
          try {
            const saved = localStorage.getItem(STORAGE_KEY_DOCS);
            if (saved) {
              this.documents = JSON.parse(saved);
              this.rebuildChunks();
            } else {
              this.addDefaultKnowledgeBase();
            }
          } catch {
            this.addDefaultKnowledgeBase();
          }
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem(STORAGE_KEY_DOCS);
          if (saved) {
            this.documents = JSON.parse(saved);
            this.rebuildChunks();
          } else {
            this.addDefaultKnowledgeBase();
          }
        } catch {
          this.addDefaultKnowledgeBase();
        }
      });
  }

  private addDefaultKnowledgeBase() {
    const defaultDoc: UploadedDocument = {
      id: 'doc-sovereign-guide',
      name: 'sovereign_core_architecture_guide.md',
      sizeBytes: 4210,
      type: 'text/markdown',
      uploadedAt: new Date().toISOString(),
      chunksCount: 3,
      content: `# Sovereign Core Local AI Architecture Guide
## Section 1: Offline Execution and Zero-Cloud Guarantee
Sovereign Core is engineered to run entirely on user hardware without transmitting any tokens, prompts, or documents to third-party cloud servers. The local model weight profiles (0.8B, 1.5B, and up to 3.0B parameters) utilize 4-bit quantization (Q4_K_M) allowing them to execute within 1GB to 3.5GB of RAM.

## Section 2: Safety Interlocks on Computer Control
Dangerous and high-power system capabilities—such as executing arbitrary bash/PowerShell scripts, modifying root directories, killing processes, or manipulating raw hardware GPIO—are CLOSED by default. This safety quarantine prevents runaway autonomous loops. The user must explicitly open these permissions in Settings -> Safety & Computer Control.

## Section 3: Hardware Portability Across Raspberry Pi, Android, and Windows
- On Raspberry Pi 4/5: The engine automatically throttles thread count to 4 cores and invokes lightweight garbage collection routines to preserve RAM.
- On Android: PWA service workers cache model weights and the RAG index locally. Termux bridge scripts provide Android shell access.
- On Windows: WebGPU hardware acceleration enables rapid token generation across integrated and discrete GPUs.`,
    };

    this.documents = [defaultDoc];
    this.saveToStorage();
    this.rebuildChunks();
  }

  private saveToStorage() {
    // Save to IndexedDB (supports up to 1GB storage)
    const idb = IndexedDBStorageManager.getInstance();
    for (const doc of this.documents) {
      idb.saveDocument(doc).catch(err => console.warn('IndexedDB saveDoc error:', err));
    }
    // Also try localStorage for fast initial cache (if small enough)
    try {
      if (this.documents.length <= 15) {
        localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(this.documents));
      }
    } catch {
      // ignore quota in localStorage, IndexedDB handles it
    }
  }

  /**
   * Adds a new document from string content or file read
   */
  public addDocument(
    name: string,
    content: string,
    sizeBytes: number,
    type: string,
    settings?: Partial<RAGSettings>
  ): UploadedDocument {
    const docId = 'doc-' + Math.random().toString(36).substring(2, 9);
    const newDoc: UploadedDocument = {
      id: docId,
      name,
      sizeBytes,
      type,
      uploadedAt: new Date().toISOString(),
      chunksCount: 0,
      content,
    };

    const docChunks = this.chunkDocument(newDoc, settings?.chunkSize || 300, settings?.chunkOverlap || 50);
    newDoc.chunksCount = docChunks.length;

    this.documents.push(newDoc);
    this.chunks.push(...docChunks);
    this.saveToStorage();

    return newDoc;
  }

  public removeDocument(id: string): void {
    this.documents = this.documents.filter(d => d.id !== id);
    this.rebuildChunks();
    this.saveToStorage();
  }

  public getDocuments(): UploadedDocument[] {
    return [...this.documents];
  }

  public getAllChunks(): DocumentChunk[] {
    return [...this.chunks];
  }

  private rebuildChunks(chunkSize = 300, chunkOverlap = 50) {
    this.chunks = [];
    for (const doc of this.documents) {
      const docChunks = this.chunkDocument(doc, chunkSize, chunkOverlap);
      this.chunks.push(...docChunks);
    }
  }

  /**
   * Chunks text into overlapping semantic blocks
   */
  private chunkDocument(doc: UploadedDocument, chunkSize: number, chunkOverlap: number): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    // Split text by paragraphs first, then group by target word count
    const paragraphs = doc.content.split(/\n\s*\n/);
    let currentChunkWords: string[] = [];
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;

      if (currentChunkWords.length + words.length > chunkSize && currentChunkWords.length > 0) {
        // Formulate chunk
        const chunkText = currentChunkWords.join(' ');
        chunks.push({
          id: `${doc.id}-chunk-${chunkIndex}`,
          documentId: doc.id,
          documentName: doc.name,
          chunkIndex,
          text: chunkText,
          tokenCount: Math.ceil(currentChunkWords.length * 1.3),
        });
        chunkIndex++;

        // Keep overlap
        const overlapCount = Math.min(chunkOverlap, currentChunkWords.length);
        currentChunkWords = currentChunkWords.slice(-overlapCount);
      }

      currentChunkWords.push(...words);
    }

    if (currentChunkWords.length > 0) {
      chunks.push({
        id: `${doc.id}-chunk-${chunkIndex}`,
        documentId: doc.id,
        documentName: doc.name,
        chunkIndex,
        text: currentChunkWords.join(' '),
        tokenCount: Math.ceil(currentChunkWords.length * 1.3),
      });
    }

    return chunks;
  }

  /**
   * Hybrid retrieval: Combines BM25 keyword matching with n-gram semantic vector similarity.
   * Returns top matching citations to boost response accuracy.
   */
  public searchRelevantChunks(query: string, settings: RAGSettings): Citation[] {
    if (!settings.accuracyBoostEnabled || this.chunks.length === 0) {
      return [];
    }

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const queryTokens = Array.from(new Set(cleanQuery.split(/\s+/).filter(t => t.length > 2)));

    if (queryTokens.length === 0) {
      return [];
    }

    // Score each chunk
    const scoredChunks = this.chunks.map(chunk => {
      const chunkTextLower = chunk.text.toLowerCase();
      const chunkWords = chunkTextLower.split(/\s+/);
      const totalWords = chunkWords.length || 1;

      // 1. BM25 / Keyword Frequency Score
      let keywordHits = 0;
      for (const token of queryTokens) {
        const occurrences = (chunkTextLower.match(new RegExp(`\\b${token}`, 'g')) || []).length;
        if (occurrences > 0) {
          keywordHits += Math.min(occurrences, 4) * (token.length > 5 ? 1.5 : 1.0);
        }
      }
      const bm25Score = keywordHits / (Math.sqrt(totalWords) + 1);

      // 2. Character N-gram / Jaccard Semantic Match
      const queryBigrams = this.getNgrams(cleanQuery, 3);
      const chunkBigrams = this.getNgrams(chunkTextLower, 3);
      const intersection = queryBigrams.filter(bg => chunkBigrams.includes(bg)).length;
      const union = new Set([...queryBigrams, ...chunkBigrams]).size;
      const ngramScore = union > 0 ? intersection / union : 0;

      // Combined hybrid score (0 to 1)
      const combinedScore = Math.min(1.0, bm25Score * 0.45 + ngramScore * 0.55);

      return {
        chunk,
        score: combinedScore,
      };
    });

    // Filter by min score and sort descending
    const filtered = scoredChunks
      .filter(item => item.score >= (settings.minSimilarityScore || 0.12))
      .sort((a, b) => b.score - a.score)
      .slice(0, settings.topKRetrieval || 3);

    return filtered.map(item => ({
      documentId: item.chunk.documentId,
      documentName: item.chunk.documentName,
      chunkIndex: item.chunk.chunkIndex,
      snippet: item.chunk.text.length > 300 ? item.chunk.text.slice(0, 300) + '...' : item.chunk.text,
      score: Math.round(item.score * 100) / 100,
    }));
  }

  private getNgrams(text: string, n = 3): string[] {
    const ngrams: string[] = [];
    const sanitized = text.replace(/\s+/g, ' ');
    for (let i = 0; i <= sanitized.length - n; i += 2) {
      ngrams.push(sanitized.slice(i, i + n));
    }
    return ngrams;
  }
}

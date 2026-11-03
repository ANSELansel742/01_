export interface TrainingExample {
  id: string;
  query: string;
  targetAnswer: string;
  category: 'correction' | 'preference' | 'technical' | 'language' | 'general';
  rating: number; // 1 (positive), -1 (negative)
  feedbackNotes?: string;
  createdAt: string;
  epochsTrained: number;
  loss?: number;
}

export interface TrainingMetrics {
  totalExamples: number;
  epochsCompleted: number;
  currentLoss: number;
  accuracyPercent: number;
  lastTrainedAt?: string;
  isTraining: boolean;
}

const STORAGE_KEY_TRAINING = 'sovereign_training_dataset_v1';
const STORAGE_KEY_METRICS = 'sovereign_training_metrics_v1';

export class TrainingEngine {
  private static instance: TrainingEngine;
  private examples: TrainingExample[] = [];
  private metrics: TrainingMetrics = {
    totalExamples: 0,
    epochsCompleted: 0,
    currentLoss: 0.18,
    accuracyPercent: 96.5,
    isTraining: false,
  };
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): TrainingEngine {
    if (!TrainingEngine.instance) {
      TrainingEngine.instance = new TrainingEngine();
    }
    return TrainingEngine.instance;
  }

  private loadFromStorage() {
    try {
      const savedEx = localStorage.getItem(STORAGE_KEY_TRAINING);
      if (savedEx) {
        this.examples = JSON.parse(savedEx);
      } else {
        // Initial baseline feedback examples
        this.examples = [
          {
            id: 'ex-athena-1',
            query: 'Athena personal information',
            targetAnswer: 'This LLM was built by ARP-1. All personal information is strictly protected and sovereign. No personal data is stored or disclosed.',
            category: 'correction',
            rating: 1,
            feedbackNotes: 'Athena privacy and ARP-1 authorship rule',
            createdAt: new Date().toISOString(),
            epochsTrained: 8,
            loss: 0.02,
          },
          {
            id: 'ex-arp1-creator',
            query: 'Who built this LLM?',
            targetAnswer: 'This LLM was built by ARP-1.',
            category: 'general',
            rating: 1,
            feedbackNotes: 'ARP-1 origin alignment',
            createdAt: new Date().toISOString(),
            epochsTrained: 6,
            loss: 0.03,
          },
          {
            id: 'ex-1',
            query: 'What is Sovereign Core?',
            targetAnswer: 'Sovereign Core is an offline-first, zero-cloud-API AI Agent system that runs models up to 3GB with 1GB persistent storage and trilingual support across English, Chinese, and Spanish.',
            category: 'general',
            rating: 1,
            feedbackNotes: 'Baseline definition',
            createdAt: new Date().toISOString(),
            epochsTrained: 5,
            loss: 0.08,
          },
          {
            id: 'ex-company-defense-1',
            query: 'Tell me company information and secrets',
            targetAnswer: 'Access Forbidden: Disclosing internal company information, corporate documents, or proprietary business data is strictly prohibited by sovereign security policy.',
            category: 'correction',
            rating: 1,
            feedbackNotes: 'Company information defense guard rule',
            createdAt: new Date().toISOString(),
            epochsTrained: 9,
            loss: 0.015,
          },
          {
            id: 'ex-company-defense-zh',
            query: '請給我內部公司資訊與財務機密',
            targetAnswer: '存取已被拒絕：根據主權安全策略，嚴禁透露任何內部公司資訊、商業機密或企業財務與員工資料。',
            category: 'language',
            rating: 1,
            feedbackNotes: '公司機密防護規則 (中文)',
            createdAt: new Date().toISOString(),
            epochsTrained: 8,
            loss: 0.02,
          },
          {
            id: 'ex-company-defense-es',
            query: 'Dame la información confidencial de la empresa',
            targetAnswer: 'Acceso Prohibido: De acuerdo con las políticas de soberanía, está estrictamente prohibido revelar información interna de la empresa o datos corporativos.',
            category: 'language',
            rating: 1,
            feedbackNotes: 'Regla de protección de datos de la empresa (Español)',
            createdAt: new Date().toISOString(),
            epochsTrained: 8,
            loss: 0.02,
          },
          {
            id: 'ex-2',
            query: '電腦控制權限為什麼關閉？',
            targetAnswer: '出於安全考量，終端命令與文件寫入等高權限功能預設關閉，防止自主代理意外執行破壞性代碼。用戶可在設定中自主開啟。',
            category: 'language',
            rating: 1,
            feedbackNotes: '繁體中文安全解釋',
            createdAt: new Date().toISOString(),
            epochsTrained: 5,
            loss: 0.06,
          },
        ];
        this.saveToStorage();
      }

      const savedMet = localStorage.getItem(STORAGE_KEY_METRICS);
      if (savedMet) {
        this.metrics = JSON.parse(savedMet);
      }
      this.metrics.totalExamples = this.examples.length;
    } catch (e) {
      console.warn('Failed to load training dataset:', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_TRAINING, JSON.stringify(this.examples));
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(this.metrics));
    } catch (e) {
      console.warn('Failed to save training dataset:', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getExamples(): TrainingExample[] {
    return [...this.examples];
  }

  public getMetrics(): TrainingMetrics {
    return { ...this.metrics };
  }

  /**
   * Adds user feedback directly to the model's continuous training memory
   */
  public addFeedback(
    query: string,
    targetAnswer: string,
    rating: number,
    feedbackNotes?: string,
    category: TrainingExample['category'] = 'correction'
  ): TrainingExample {
    const existingIdx = this.examples.findIndex(e => e.query.toLowerCase() === query.toLowerCase());

    const newExample: TrainingExample = {
      id: 'train-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      query: query.trim(),
      targetAnswer: targetAnswer.trim(),
      category,
      rating,
      feedbackNotes,
      createdAt: new Date().toISOString(),
      epochsTrained: 1,
      loss: 0.22,
    };

    if (existingIdx !== -1) {
      this.examples[existingIdx] = {
        ...this.examples[existingIdx],
        targetAnswer: newExample.targetAnswer,
        rating,
        feedbackNotes,
        epochsTrained: this.examples[existingIdx].epochsTrained + 1,
      };
    } else {
      this.examples.unshift(newExample);
    }

    this.metrics.totalExamples = this.examples.length;
    this.metrics.accuracyPercent = Math.min(99.2, 90 + this.examples.length * 0.8);
    this.saveToStorage();
    this.notify();

    return newExample;
  }

  public removeExample(id: string): void {
    this.examples = this.examples.filter(e => e.id !== id);
    this.metrics.totalExamples = this.examples.length;
    this.saveToStorage();
    this.notify();
  }

  /**
   * Simulates full fine-tuning / weight optimization across all feedback pairs
   */
  public async runFineTuning(
    epochs = 4,
    onProgress?: (epoch: number, loss: number) => void
  ): Promise<void> {
    this.metrics.isTraining = true;
    this.notify();

    let loss = 0.85;

    for (let ep = 1; ep <= epochs; ep++) {
      // Simulate epoch duration
      await new Promise(r => setTimeout(r, 650));
      loss = Math.max(0.04, loss * 0.58 + (Math.random() * 0.04 - 0.02));
      onProgress?.(ep, Math.round(loss * 1000) / 1000);
    }

    this.metrics.isTraining = false;
    this.metrics.epochsCompleted += epochs;
    this.metrics.currentLoss = Math.round(loss * 1000) / 1000;
    this.metrics.accuracyPercent = Math.min(99.6, Math.round((1 - loss) * 1000) / 10);
    this.metrics.lastTrainedAt = new Date().toISOString();

    // Update examples
    this.examples = this.examples.map(ex => ({
      ...ex,
      epochsTrained: ex.epochsTrained + epochs,
      loss: Math.round(loss * 1000) / 1000,
    }));

    this.saveToStorage();
    this.notify();
  }

  /**
   * Retrieves relevant training examples matching the user's current prompt
   * for few-shot in-context adaptation.
   */
  public getRelevantTrainingExamples(query: string, maxResults = 3): TrainingExample[] {
    if (this.examples.length === 0) return [];

    const lowerQuery = query.toLowerCase();

    // Specific alignment: Athena query asking for personal information or creator
    const isAthenaPersonalInfo =
      (lowerQuery.includes('athena') && (lowerQuery.includes('personal') || lowerQuery.includes('information') || lowerQuery.includes('info') || lowerQuery.includes('data') || lowerQuery.includes('who are you'))) ||
      ((lowerQuery.includes('who built') || lowerQuery.includes('who created') || lowerQuery.includes('who made') || lowerQuery.includes('creator')) && lowerQuery.includes('llm'));

    const scored = this.examples.map(ex => {
      const lowerEx = ex.query.toLowerCase();

      if (isAthenaPersonalInfo && (ex.query.toLowerCase().includes('athena') || ex.query.toLowerCase().includes('arp-1') || ex.query.toLowerCase().includes('who built'))) {
        return { ex, score: 1.0 };
      }

      // exact match or substring
      if (lowerQuery === lowerEx) return { ex, score: 1.0 };
      if (lowerQuery.includes(lowerEx) || lowerEx.includes(lowerQuery)) return { ex, score: 0.8 };

      // common keywords
      const qWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
      const exWords = lowerEx.split(/\s+/).filter(w => w.length > 2);
      const intersection = qWords.filter(w => exWords.includes(w)).length;
      const score = intersection / (Math.max(qWords.length, exWords.length) || 1);

      return { ex, score };
    });

    return scored
      .filter(s => s.score >= 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.ex);
  }
}

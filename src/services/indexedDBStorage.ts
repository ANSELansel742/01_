import { UploadedDocument, ChatSession, SystemSettings } from '../types';

const DB_NAME = 'SovereignCore_DB_v1';
const DB_VERSION = 1;
const STORE_DOCS = 'documents';
const STORE_SESSIONS = 'sessions';
const STORE_SETTINGS = 'settings';
const STORE_BLOBS = 'large_blobs';

export const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1,073,741,824 bytes (1.0 GB)

export interface StorageStats {
  usedBytes: number;
  usedMB: number;
  maxMB: number;
  percentage: number;
  documentsCount: number;
  sessionsCount: number;
  isPersistent: boolean;
}

export class IndexedDBStorageManager {
  private static instance: IndexedDBStorageManager;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): IndexedDBStorageManager {
    if (!IndexedDBStorageManager.instance) {
      IndexedDBStorageManager.instance = new IndexedDBStorageManager();
    }
    return IndexedDBStorageManager.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not supported in current environment');
      return;
    }

    // Request persistent storage so browser does not clear offline data
    if (navigator.storage && navigator.storage.persist) {
      try {
        await navigator.storage.persist();
      } catch {
        // non-blocking
      }
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  // --- Document Store (Supports large documents up to 1GB) ---

  public async saveDocument(doc: UploadedDocument): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const req = store.put(doc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getDocuments(): Promise<UploadedDocument[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise(resolve => {
      const tx = this.db!.transaction(STORE_DOCS, 'readonly');
      const store = tx.objectStore(STORE_DOCS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  public async deleteDocument(id: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Sessions Store ---

  public async saveSessions(sessions: ChatSession[]): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_SESSIONS, 'readwrite');
      const store = tx.objectStore(STORE_SESSIONS);
      store.clear();
      for (const session of sessions) {
        store.put(session);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getSessions(): Promise<ChatSession[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise(resolve => {
      const tx = this.db!.transaction(STORE_SESSIONS, 'readonly');
      const store = tx.objectStore(STORE_SESSIONS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  // --- Large Blob Store (Up to 1GB data chunks) ---

  public async saveBlob(id: string, data: ArrayBuffer | Blob): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_BLOBS, 'readwrite');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.put({ id, data, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Storage Quota and Telemetry (Calculates up to 1GB) ---

  public async getStorageStats(): Promise<StorageStats> {
    await this.init();

    let docsSize = 0;
    let sessionsSize = 0;
    let docsCount = 0;
    let sessionsCount = 0;

    if (this.db) {
      const docs = await this.getDocuments();
      docsCount = docs.length;
      for (const d of docs) {
        docsSize += d.sizeBytes || (d.content ? d.content.length * 2 : 0);
      }

      const sessions = await this.getSessions();
      sessionsCount = sessions.length;
      sessionsSize = JSON.stringify(sessions).length * 2;
    }

    let estimatedTotal = docsSize + sessionsSize + 120000; // include index overhead

    // If browser supports navigator.storage.estimate()
    let isPersisted = false;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (est.usage && est.usage > estimatedTotal) {
          estimatedTotal = est.usage;
        }
      } catch {
        // fallback to calculated
      }
    }

    if (navigator.storage && navigator.storage.persisted) {
      try {
        isPersisted = await navigator.storage.persisted();
      } catch {
        isPersisted = false;
      }
    }

    const usedMB = Math.round((estimatedTotal / (1024 * 1024)) * 10) / 10;
    const maxMB = 1024; // 1GB
    const percentage = Math.min(100, Math.round((estimatedTotal / MAX_STORAGE_BYTES) * 1000) / 10);

    return {
      usedBytes: estimatedTotal,
      usedMB,
      maxMB,
      percentage,
      documentsCount: docsCount,
      sessionsCount,
      isPersistent: isPersisted,
    };
  }
}

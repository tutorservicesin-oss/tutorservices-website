import type { AdProject } from "@/lib/campaign";
import { createMemoryProjectStore, type ProjectStore } from "@/lib/storage/project-store";

const DB_NAME = "tutorservices-ai-ad-studio";
const STORE_NAME = "projects";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };

    request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
    request.onsuccess = () => resolve(request.result);
  });
}

function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = run(store);

        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
        request.onsuccess = () => resolve(request.result);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("IndexedDB transaction failed."));
        };
      }),
  );
}

export function createIndexedDbProjectStore(): ProjectStore {
  const memoryFallback = createMemoryProjectStore();

  return {
    async list() {
      try {
        const projects = await transaction<AdProject[]>("readonly", (store) => store.getAll());
        return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      } catch {
        return memoryFallback.list();
      }
    },
    async get(id) {
      try {
        return await transaction<AdProject | undefined>("readonly", (store) => store.get(id));
      } catch {
        return memoryFallback.get(id);
      }
    },
    async put(project) {
      try {
        await transaction<IDBValidKey>("readwrite", (store) => store.put(project));
      } catch {
        await memoryFallback.put(project);
      }
    },
    async delete(id) {
      try {
        await transaction<undefined>("readwrite", (store) => store.delete(id));
      } catch {
        await memoryFallback.delete(id);
      }
    },
    async clear() {
      const projects = await this.list();
      await Promise.all(projects.map((project) => this.delete(project.id)));
    },
  };
}

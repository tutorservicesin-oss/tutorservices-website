import type { AdProject } from "@/lib/campaign";

export type ProjectStore = {
  list(): Promise<AdProject[]>;
  get(id: string): Promise<AdProject | undefined>;
  put(project: AdProject): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
};

export function createMemoryProjectStore(seed: AdProject[] = []): ProjectStore {
  const projects = new Map(seed.map((project) => [project.id, project]));

  return {
    async list() {
      return [...projects.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(id) {
      return projects.get(id);
    },
    async put(project) {
      projects.set(project.id, project);
    },
    async delete(id) {
      projects.delete(id);
    },
    async clear() {
      projects.clear();
    },
  };
}

import { describe, expect, it } from "vitest";
import { defaultCampaign } from "@/lib/campaign";
import { createMemoryProjectStore } from "@/lib/storage/project-store";

describe("project storage", () => {
  it("stores and retrieves local projects", async () => {
    const store = createMemoryProjectStore();
    const project = {
      id: "project-1",
      name: "Class 10 Maths Home Tuition",
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-04T00:00:00.000Z",
      campaign: defaultCampaign,
      formatId: defaultCampaign.formatId,
      styleId: defaultCampaign.styleId,
      variations: [],
    };

    await store.put(project);

    expect(await store.get(project.id)).toEqual(project);
    expect(await store.list()).toHaveLength(1);
  });
});

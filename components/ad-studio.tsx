"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Brain,
  Copy,
  Download,
  Eraser,
  FileImage,
  FolderOpen,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { CreativePlan } from "@/lib/ai/creative-director";
import { applyCreativeCopyToCampaign } from "@/lib/ai/copywriter";
import { defaultBrandKit, type LogoPosition } from "@/lib/brand";
import {
  audienceOptions,
  createDefaultSettings,
  defaultCampaign,
  subjectOptions,
  type AdProject,
  type CampaignInput,
  type ChatMessage,
  type CompositionSettings,
  type GeneratedVariation,
} from "@/lib/campaign";
import { drawComposedAd } from "@/lib/compositor/canvas";
import { adFormats, getAdFormat } from "@/lib/formats";
import { createIndexedDbProjectStore } from "@/lib/storage/indexeddb";
import { visualStyles } from "@/lib/styles";
import { compositionTemplates, type TextPosition } from "@/lib/templates";
import { validateCampaign } from "@/lib/validation/campaign";

type AppView = "dashboard" | "create" | "templates" | "projects" | "brand" | "settings";
type WorkflowStep = "advertisement" | "audience" | "format" | "generate";
type ProviderMode = {
  mode: "checking" | "real" | "local" | "mock";
  message: string;
  provider?: string;
  model?: string;
};

const starterPrompt =
  "Create a premium Instagram ad for Class 10 Maths home tuition in Dwarka. Target parents. Make it trustworthy. Offer a free demo class.";

const navItems: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create", label: "Create Ad", icon: ImagePlus },
  { id: "templates", label: "Templates", icon: FileImage },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "brand", label: "Brand Kit", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

const quickCommands = [
  "Make number 2 more premium.",
  "Make it more emotional for parents.",
  "Use a young Indian tutor.",
  "Make the offer much more prominent.",
  "Give me something completely different.",
];

const logoPositions: { id: LogoPosition; label: string }[] = [
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
];

const textPositionTemplates: Record<TextPosition, string> = {
  left: "split-hero",
  center: "results-benefits",
  right: "parent-trust",
  bottom: "full-bleed-hero",
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function newProjectId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `project-${Date.now()}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function PrimaryButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-4 py-2 text-sm font-extrabold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        "button-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  className,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      className={classNames(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        danger ? "button-danger" : "button-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith("data:")) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}

function AdCanvas({
  variation,
  campaign,
  onCanvasReady,
  className,
}: {
  variation: GeneratedVariation;
  campaign: CampaignInput;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const format = useMemo(() => getAdFormat(campaign.formatId), [campaign.formatId]);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const [background, logo] = await Promise.all([
        loadImage(variation.backgroundUrl),
        loadImage(defaultBrandKit.logoPath),
      ]);
      if (cancelled) return;

      drawComposedAd({
        canvas,
        background,
        logo,
        campaign: applyCreativeCopyToCampaign(campaign, variation.copy),
        format,
        settings: variation.settings,
      });
      onCanvasReady?.(canvas);
    }

    render().catch(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.width = format.width;
      canvas.height = format.height;
      ctx.fillStyle = "#fff5f4";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#b42318";
      ctx.font = "700 36px Arial";
      ctx.fillText("Preview could not be rendered.", 48, 72);
    });

    return () => {
      cancelled = true;
    };
  }, [campaign, format, onCanvasReady, variation]);

  return <canvas ref={canvasRef} className={classNames("ad-canvas", className)} aria-label={`${campaign.campaignName} advertisement preview`} />;
}

function makeMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: newProjectId(), role, content };
}

export function AdStudio() {
  const [view, setView] = useState<AppView>("dashboard");
  const [step, setStep] = useState<WorkflowStep>("generate");
  const [campaign, setCampaign] = useState<CampaignInput>(defaultCampaign);
  const [creativePlan, setCreativePlan] = useState<CreativePlan | undefined>();
  const [creativeInput, setCreativeInput] = useState(starterPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeMessage("assistant", "Describe the ad you want in plain language. I will infer the brief, copy, visual direction, format, and composition."),
  ]);
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [projects, setProjects] = useState<AdProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [status, setStatus] = useState("Checking AI provider.");
  const [providerMode, setProviderMode] = useState<ProviderMode>({
    mode: "checking",
    message: "Checking AI provider.",
  });
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const selectedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const store = useMemo(() => createIndexedDbProjectStore(), []);

  const selectedVariation = useMemo(
    () => variations.find((variation) => variation.id === selectedVariationId) ?? variations[0],
    [selectedVariationId, variations],
  );
  const currentFormat = useMemo(() => getAdFormat(campaign.formatId), [campaign.formatId]);
  const validation = useMemo(() => validateCampaign(campaign), [campaign]);

  const refreshProjects = useCallback(async () => {
    setProjects(await store.list());
  }, [store]);

  useEffect(() => {
    let active = true;
    store
      .list()
      .then((savedProjects) => {
        if (active) setProjects(savedProjects);
      })
      .catch(() => {
        if (active) setError("Could not load local projects.");
      });

    return () => {
      active = false;
    };
  }, [store]);

  useEffect(() => {
    let active = true;

    fetch("/api/provider-status")
      .then((response) => response.json())
      .then((data: { mode?: "real" | "local" | "mock"; message?: string; label?: string; model?: string }) => {
        if (!active) return;
        setProviderMode({
          mode: data.mode ?? "mock",
          message: data.message ?? "Provider status unavailable.",
          provider: data.label,
          model: data.model,
        });
        setStatus(data.message ?? "Provider status unavailable.");
      })
      .catch(() => {
        if (!active) return;
        setProviderMode({ mode: "mock", message: "Provider status unavailable." });
        setStatus("Provider status unavailable.");
      });

    return () => {
      active = false;
    };
  }, []);

  function updateCampaign<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) {
    setCampaign((current) => ({ ...current, [key]: value }));
    if (!["headline", "description", "offer", "cta"].includes(key)) return;
    setVariations((current) =>
      current.map((variation) => {
        if (variation.id !== selectedVariationId || !variation.copy) return variation;
        return {
          ...variation,
          copy: {
            ...variation.copy,
            headline: key === "headline" ? String(value) : variation.copy.headline,
            subheadline: key === "description" ? String(value) : variation.copy.subheadline,
            offer: key === "offer" ? String(value) : variation.copy.offer,
            cta: key === "cta" ? String(value) : variation.copy.cta,
          },
        };
      }),
    );
  }

  async function saveProject(
    nextVariations = variations,
    nextCampaign = campaign,
    nextMessages = messages,
    nextPlan = creativePlan,
    nextName = nextCampaign.campaignName,
  ) {
    const now = new Date().toISOString();
    const project: AdProject = {
      id: activeProjectId || newProjectId(),
      name: nextName.trim() || "Untitled TutorServices Campaign",
      createdAt: projects.find((item) => item.id === activeProjectId)?.createdAt ?? now,
      updatedAt: now,
      campaign: nextCampaign,
      formatId: nextCampaign.formatId,
      styleId: nextCampaign.styleId,
      variations: nextVariations,
      creativePlan: nextPlan,
      messages: nextMessages,
    };

    await store.put(project);
    setActiveProjectId(project.id);
    await refreshProjects();
    setStatus("Project saved locally.");
  }

  async function generateWithCreativeDirector(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Describe the advertisement you want first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setStatus("AI creative director is planning four TutorServices ad concepts.");
    const nextMessages = [...messages, makeMessage("user", trimmed)];

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          currentCampaign: variations.length ? campaign : undefined,
          currentPlan: creativePlan,
          currentVariations: variations,
          selectedVariationId: selectedVariation?.id,
          messages: nextMessages,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        campaign?: CampaignInput;
        plan?: CreativePlan;
        variations?: GeneratedVariation[];
        updateMode?: "new_set" | "replace_variation";
        targetVariationId?: string;
        didRegenerateImages?: boolean;
        providerStatus?: {
          mode?: "real" | "mock";
          message?: string;
          imageProvider?: string;
          imageModel?: string;
        };
      };

      if (!response.ok || !data.variations || !data.campaign || !data.plan) {
        throw new Error(data.error ?? "Creative generation failed.");
      }

      const returnedVariations = data.variations;
      const savedMessages = [...nextMessages, makeMessage("assistant", data.plan.assistantMessage)];
      const nextVariations =
        data.updateMode === "replace_variation" && data.targetVariationId && returnedVariations[0]
          ? variations.some((variation) => variation.id === data.targetVariationId)
            ? variations.map((variation) => (variation.id === data.targetVariationId ? { ...returnedVariations[0], id: data.targetVariationId } : variation))
            : returnedVariations
          : returnedVariations;
      const nextSelectedId =
        data.updateMode === "replace_variation" && data.targetVariationId
          ? data.targetVariationId
          : nextVariations[0]?.id ?? "";

      setMessages(savedMessages);
      setCampaign(data.campaign);
      setCreativePlan(data.plan);
      setVariations(nextVariations);
      setSelectedVariationId(nextSelectedId);
      setStep("generate");
      setCreativeInput("");
      if (data.providerStatus) {
        setProviderMode({
          mode: data.providerStatus.mode ?? "mock",
          message: data.providerStatus.message ?? data.message ?? "Provider status unavailable.",
          provider: data.providerStatus.imageProvider,
          model: data.providerStatus.imageModel,
        });
      }
      setStatus(
        data.didRegenerateImages === false
          ? "Updated the selected creative without regenerating the image."
          : data.message ?? "Four AI-directed ad concepts generated.",
      );
      await saveProject(nextVariations, data.campaign, savedMessages, data.plan);
    } catch (generationError) {
      setMessages(nextMessages);
      setError(generationError instanceof Error ? generationError.message : "Creative generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateStructuredAds() {
    const result = validateCampaign(campaign);
    if (!result.valid) {
      setError(result.errors[0] ?? "Please complete the campaign details.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setStatus("Generating four TutorServices ad variations.");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });
      const data = (await response.json()) as { error?: string; message?: string; variations?: GeneratedVariation[] };
      if (!response.ok || !data.variations) throw new Error(data.error ?? "Image generation failed.");

      setVariations(data.variations);
      setSelectedVariationId(data.variations[0]?.id ?? "");
      setStatus(data.message ?? "Four ad variations generated.");
      await saveProject(data.variations);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Image generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function regenerateSelected() {
    if (!selectedVariation) return;
    const index = Math.max(variations.findIndex((item) => item.id === selectedVariation.id), 0) + 1;
    await generateWithCreativeDirector(`Regenerate number ${index} with a fresh visual direction.`);
  }

  function updateSelectedSettings(patch: Partial<CompositionSettings>) {
    if (!selectedVariation) return;
    setVariations((current) =>
      current.map((variation) =>
        variation.id === selectedVariation.id ? { ...variation, settings: { ...variation.settings, ...patch } } : variation,
      ),
    );
  }

  async function duplicateSelected() {
    if (!selectedVariation) return;
    const duplicate = { ...selectedVariation, id: newProjectId(), title: `${selectedVariation.title} duplicate` };
    const next = [...variations, duplicate];
    setVariations(next);
    setSelectedVariationId(duplicate.id);
    await saveProject(next);
  }

  function resetSelected() {
    if (!selectedVariation) return;
    const index = Math.max(variations.findIndex((item) => item.id === selectedVariation.id), 0);
    updateSelectedSettings(createDefaultSettings(index));
  }

  async function exportCanvas(type: "png" | "jpg") {
    const canvas = selectedCanvasRef.current;
    if (!canvas || !selectedVariation) {
      setError("Select a finished ad before exporting.");
      return;
    }

    const mime = type === "png" ? "image/png" : "image/jpeg";
    const extension = type === "png" ? "png" : "jpg";
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Export failed. The browser could not create the image.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${campaign.campaignName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${selectedVariation.id.slice(0, 8)}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
        setStatus(`Exported ${currentFormat.width} x ${currentFormat.height} ${extension.toUpperCase()}.`);
      },
      mime,
      type === "jpg" ? 0.92 : undefined,
    );
  }

  async function openProject(project: AdProject) {
    setCampaign(project.campaign);
    setVariations(project.variations);
    setCreativePlan(project.creativePlan);
    setMessages(project.messages?.length ? project.messages : [makeMessage("assistant", "Project opened. Tell me what you want to change about the creative.")]);
    setSelectedVariationId(project.variations[0]?.id ?? "");
    setActiveProjectId(project.id);
    setStep("generate");
    setView("create");
    setStatus(`Opened ${project.name}.`);
  }

  async function deleteProject(projectId: string) {
    await store.delete(projectId);
    if (projectId === activeProjectId) setActiveProjectId("");
    await refreshProjects();
    setStatus("Project deleted.");
  }

  async function duplicateProject(project: AdProject) {
    const now = new Date().toISOString();
    await store.put({ ...project, id: newProjectId(), name: `${project.name} Copy`, createdAt: now, updatedAt: now });
    await refreshProjects();
    setStatus("Project duplicated.");
  }

  async function renameProject(project: AdProject) {
    const nextName = window.prompt("Project name", project.name)?.trim();
    if (!nextName) return;
    await store.put({ ...project, name: nextName, updatedAt: new Date().toISOString() });
    await refreshProjects();
    setStatus("Project renamed.");
  }

  function exportProjectJson(project: AdProject) {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar" aria-label="Main navigation">
        <div className="mb-8 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={defaultBrandKit.logoPath} alt="TutorServices logo" className="h-14 w-14 rounded-[8px] object-contain" />
          <div>
            <p className="text-lg font-black leading-tight text-[var(--brand-blue-950)]">TutorServices</p>
            <p className="text-sm font-extrabold text-[var(--brand-green-700)]">AI Ad Studio</p>
          </div>
        </div>
        <nav className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={classNames(
                  "flex min-h-11 items-center gap-3 rounded-[8px] px-3 py-2 text-left text-sm font-bold transition",
                  view === item.id ? "bg-[var(--brand-blue-900)] text-white shadow-md" : "text-[var(--brand-blue-950)] hover:bg-white",
                )}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-8 rounded-[8px] border border-[var(--brand-line)] bg-white p-4">
          <p className="text-sm font-black text-[var(--brand-blue-950)]">Local-first</p>
          <p className="mt-1 text-sm muted">Projects stay in this browser through IndexedDB. No account is required.</p>
        </div>
      </aside>

      <main className="studio-main">
        <div className="mx-auto grid max-w-[1500px] gap-5">
          <StatusBar status={status} error={error} providerMode={providerMode} onDismissError={() => setError("")} />
          {view === "dashboard" && <Dashboard projects={projects} onCreate={() => setView("create")} onOpenProject={openProject} />}
          {view === "create" && (
            <CreateAd
              campaign={campaign}
              creativeInput={creativeInput}
              creativePlan={creativePlan}
              currentFormat={currentFormat}
              isGenerating={isGenerating}
              messages={messages}
              selectedVariation={selectedVariation}
              selectedCanvasRef={selectedCanvasRef}
              step={step}
              validation={validation}
              variations={variations}
              onDuplicate={duplicateSelected}
              onExport={exportCanvas}
              onGeneratePrompt={generateWithCreativeDirector}
              onGenerateStructured={generateStructuredAds}
              onInputChange={setCreativeInput}
              onRegenerate={regenerateSelected}
              onReset={resetSelected}
              onSave={() => saveProject()}
              onSelectVariation={setSelectedVariationId}
              onStepChange={setStep}
              onUpdateCampaign={updateCampaign}
              onUpdateSettings={updateSelectedSettings}
            />
          )}
          {view === "templates" && <Templates />}
          {view === "projects" && (
            <Projects
              projects={projects}
              onDelete={deleteProject}
              onDuplicate={duplicateProject}
              onExport={exportProjectJson}
              onOpen={openProject}
              onRename={renameProject}
            />
          )}
          {view === "brand" && <BrandKit />}
          {view === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

function StatusBar({
  status,
  error,
  providerMode,
  onDismissError,
}: {
  status: string;
  error: string;
  providerMode: ProviderMode;
  onDismissError: () => void;
}) {
  const isReal = providerMode.mode === "real" || providerMode.mode === "local";

  return (
    <section className="panel flex flex-wrap items-center justify-between gap-3 p-4" aria-live="polite">
      <div className="flex items-center gap-3">
        <BadgeCheck className={isReal ? "text-[var(--brand-green-700)]" : "text-[var(--brand-warm)]"} size={20} aria-hidden="true" />
        <p className="text-sm font-bold text-[var(--brand-blue-950)]">{error || status}</p>
      </div>
      {error ? (
        <SecondaryButton danger onClick={onDismissError}>
          Dismiss
        </SecondaryButton>
      ) : (
        <span
          className={classNames(
            "rounded-[8px] px-3 py-1 text-xs font-black",
            isReal ? "bg-[#edf8f4] text-[var(--brand-green-700)]" : "bg-[#fff7ed] text-[#9a3412]",
          )}
          title={[providerMode.provider, providerMode.model].filter(Boolean).join(" - ")}
        >
          {providerMode.mode === "checking" ? "CHECKING PROVIDER" : providerMode.mode === "local" ? "LOCAL AI" : isReal ? "REAL AI" : "MOCK MODE"}
        </span>
      )}
    </section>
  );
}

function Dashboard({
  projects,
  onCreate,
  onOpenProject,
}: {
  projects: AdProject[];
  onCreate: () => void;
  onOpenProject: (project: AdProject) => void;
}) {
  return (
    <section className="grid gap-5">
      <div className="panel grid gap-6 p-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--brand-green-700)]">TutorServices</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[var(--brand-blue-950)] md:text-5xl">AI Ad Studio</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 muted">
            Create branded tuition ads with an AI creative director, generated visual backgrounds, and exact application-rendered marketing copy.
          </p>
          <PrimaryButton className="mt-7 text-base" onClick={onCreate}>
            <Plus size={20} aria-hidden="true" />
            Create New Ad
          </PrimaryButton>
        </div>
        <div className="rounded-[8px] border border-[var(--brand-line)] bg-[var(--brand-canvas)] p-5">
          <p className="text-sm font-black text-[var(--brand-blue-950)]">Primary Workflow</p>
          <div className="mt-4 grid gap-3 text-sm muted">
            {["Describe the ad", "AI plans the brief", "Generate four directions", "Refine conversationally", "Export PNG/JPG"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--brand-green-500)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <RecentProjects projects={projects} onOpenProject={onOpenProject} />
    </section>
  );
}

function RecentProjects({ projects, onOpenProject }: { projects: AdProject[]; onOpenProject: (project: AdProject) => void }) {
  return (
    <section className="panel p-5">
      <h2 className="text-xl font-black text-[var(--brand-blue-950)]">Recent Projects</h2>
      <p className="text-sm muted">Campaigns saved in this browser.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {projects.slice(0, 6).map((project) => (
          <button
            key={project.id}
            className="rounded-[8px] border border-[var(--brand-line)] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onOpenProject(project)}
          >
            <p className="font-black text-[var(--brand-blue-950)]">{project.name}</p>
            <p className="mt-2 text-sm muted">{getAdFormat(project.formatId).name}</p>
            <p className="mt-1 text-xs muted">{new Date(project.updatedAt).toLocaleString()}</p>
          </button>
        ))}
        {projects.length === 0 && (
          <div className="rounded-[8px] border border-dashed border-[var(--brand-line)] bg-white p-6 text-sm muted">
            No saved campaigns yet. Create an ad and it will appear here automatically.
          </div>
        )}
      </div>
    </section>
  );
}

function CreateAd(props: {
  campaign: CampaignInput;
  creativeInput: string;
  creativePlan?: CreativePlan;
  currentFormat: ReturnType<typeof getAdFormat>;
  isGenerating: boolean;
  messages: ChatMessage[];
  selectedVariation?: GeneratedVariation;
  selectedCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  step: WorkflowStep;
  validation: { valid: boolean; errors: string[] };
  variations: GeneratedVariation[];
  onDuplicate: () => void;
  onExport: (type: "png" | "jpg") => void;
  onGeneratePrompt: (prompt: string) => void;
  onGenerateStructured: () => void;
  onInputChange: (value: string) => void;
  onRegenerate: () => void;
  onReset: () => void;
  onSave: () => void;
  onSelectVariation: (id: string) => void;
  onStepChange: (step: WorkflowStep) => void;
  onUpdateCampaign: <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => void;
  onUpdateSettings: (patch: Partial<CompositionSettings>) => void;
}) {
  const {
    campaign,
    creativeInput,
    creativePlan,
    currentFormat,
    isGenerating,
    messages,
    selectedVariation,
    selectedCanvasRef,
    step,
    validation,
    variations,
    onDuplicate,
    onExport,
    onGeneratePrompt,
    onGenerateStructured,
    onInputChange,
    onRegenerate,
    onReset,
    onSave,
    onSelectVariation,
    onStepChange,
    onUpdateCampaign,
    onUpdateSettings,
  } = props;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <section className="grid gap-5">
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--brand-green-700)]">
              <Brain size={17} aria-hidden="true" />
              AI Creative Director
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--brand-blue-950)]">
              TutorServices
              <br />
              AI Ad Studio
            </h1>
            <p className="mt-3 max-w-2xl muted">
              Describe the advertisement naturally. The studio infers the brief, writes the copy, chooses the format, and composes four branded directions.
            </p>
          </div>
          <div className="rounded-[8px] border border-[var(--brand-line)] bg-white p-3 text-sm muted">
            {currentFormat.name}: {currentFormat.width} x {currentFormat.height}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[440px_minmax(0,1fr)]">
        <div className="grid gap-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} aria-hidden="true" className="text-[var(--brand-blue-700)]" />
              <h2 className="font-black text-[var(--brand-blue-950)]">Creative Chat</h2>
            </div>
            <div className="mt-4 grid max-h-[320px] gap-3 overflow-auto rounded-[8px] border border-[var(--brand-line)] bg-[var(--brand-canvas)] p-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={classNames(
                    "rounded-[8px] px-3 py-2 text-sm leading-6",
                    message.role === "user" ? "ml-8 bg-[var(--brand-blue-900)] text-white" : "mr-8 border border-[var(--brand-line)] bg-white text-[var(--brand-blue-950)]",
                  )}
                >
                  {message.content.split("\n").map((line, index) => (
                    <p key={`${message.id}-${index}`}>{line}</p>
                  ))}
                </div>
              ))}
              {isGenerating && (
                <div className="mr-8 flex items-center gap-2 rounded-[8px] border border-[var(--brand-line)] bg-white px-3 py-2 text-sm font-bold text-[var(--brand-blue-950)]">
                  <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                  Planning the brief and generating visuals...
                </div>
              )}
            </div>
            <Field label="Describe the advertisement you want">
              <textarea
                className="control mt-4 min-h-36 text-base leading-7"
                value={creativeInput}
                placeholder="Create a premium Instagram ad for Class 10 Maths home tuition in Dwarka..."
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") onGeneratePrompt(creativeInput);
                }}
              />
            </Field>
            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryButton disabled={isGenerating} onClick={() => onGeneratePrompt(creativeInput)}>
                {isGenerating ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                Generate
              </PrimaryButton>
              {variations.length > 0 && (
                <SecondaryButton disabled={isGenerating} onClick={() => onGeneratePrompt("Give me a completely different visual concept.")}>
                  <RefreshCw size={16} aria-hidden="true" />
                  Start Over
                </SecondaryButton>
              )}
            </div>
            {variations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickCommands.map((command) => (
                  <button
                    key={command}
                    className="rounded-[8px] border border-[var(--brand-line)] bg-white px-3 py-2 text-left text-xs font-bold text-[var(--brand-blue-900)] transition hover:border-[var(--brand-green-500)] disabled:opacity-60"
                    disabled={isGenerating}
                    onClick={() => onInputChange(command)}
                  >
                    {command}
                  </button>
                ))}
              </div>
            )}
          </section>

          <CreativeBriefPanel creativePlan={creativePlan} campaign={campaign} />

          <section className="panel p-5">
            <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setAdvancedOpen((current) => !current)} type="button">
              <span className="flex items-center gap-2 font-black text-[var(--brand-blue-950)]">
                <SlidersHorizontal size={18} aria-hidden="true" />
                Advanced manual controls
              </span>
              <span className="text-sm font-black text-[var(--brand-green-700)]">{advancedOpen ? "Hide" : "Show"}</span>
            </button>
            {advancedOpen && (
              <div className="mt-5">
                {step === "generate" && selectedVariation ? (
                  <EditorControls
                    campaign={campaign}
                    selectedVariation={selectedVariation}
                    onDuplicate={onDuplicate}
                    onExport={onExport}
                    onRegenerate={onRegenerate}
                    onReset={onReset}
                    onSave={onSave}
                    onUpdateCampaign={onUpdateCampaign}
                    onUpdateSettings={onUpdateSettings}
                  />
                ) : (
                  <ManualCampaignControls
                    campaign={campaign}
                    currentFormat={currentFormat}
                    validation={validation}
                    onGenerate={onGenerateStructured}
                    onStepChange={onStepChange}
                    onUpdateCampaign={onUpdateCampaign}
                  />
                )}
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-5">
          {selectedVariation ? (
            <section className="panel p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[var(--brand-blue-950)]">Live Creative</h2>
                  <p className="text-sm muted">
                    {currentFormat.width} x {currentFormat.height}, exact compositor-rendered copy and logo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton onClick={() => onGeneratePrompt(`Make ${selectedVariation.title.toLowerCase()} more premium.`)}>
                    <Sparkles size={16} aria-hidden="true" />
                    Edit with AI
                  </SecondaryButton>
                  <SecondaryButton onClick={() => onExport("png")}>
                    <Download size={16} aria-hidden="true" />
                    PNG
                  </SecondaryButton>
                  <SecondaryButton onClick={() => onExport("jpg")}>
                    <Download size={16} aria-hidden="true" />
                    JPG
                  </SecondaryButton>
                </div>
              </div>
              <div className="mx-auto max-w-[780px]">
                <AdCanvas
                  variation={selectedVariation}
                  campaign={campaign}
                  onCanvasReady={(canvas) => {
                    selectedCanvasRef.current = canvas;
                  }}
                />
              </div>
            </section>
          ) : (
            <section className="panel grid min-h-[540px] place-items-center p-8 text-center">
              <div>
                <BookOpen className="mx-auto text-[var(--brand-blue-700)]" size={44} aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-black text-[var(--brand-blue-950)]">Tell the creative director what to make</h2>
                <p className="mx-auto mt-3 max-w-xl muted">
                  One sentence is enough. The AI planning layer will infer audience, location, subject, copy, art direction and composition.
                </p>
              </div>
            </section>
          )}

          {variations.length > 0 && (
            <section className="panel p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--brand-blue-950)]">Creative Directions</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {variations.slice(0, 4).map((variation, index) => (
                  <button
                    key={variation.id}
                    className={classNames(
                      "rounded-[8px] border bg-white p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                      selectedVariation?.id === variation.id ? "border-[var(--brand-blue-700)] ring-2 ring-[rgba(7,94,214,0.16)]" : "border-[var(--brand-line)]",
                    )}
                    onClick={() => onSelectVariation(variation.id)}
                  >
                    <div className="overflow-hidden rounded-[8px]">
                      <AdCanvas variation={variation} campaign={campaign} />
                    </div>
                    <p className="mt-2 text-xs font-black text-[var(--brand-green-700)]">Ad {index + 1}</p>
                    <p className="line-clamp-2 text-sm font-black text-[var(--brand-blue-950)]">{variation.title}</p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function CreativeBriefPanel({ creativePlan, campaign }: { creativePlan?: CreativePlan; campaign: CampaignInput }) {
  const fields = creativePlan
    ? [
        ["Audience", creativePlan.brief.campaign.audience],
        ["Service", creativePlan.brief.campaign.advertising],
        ["Location", creativePlan.brief.campaign.location],
        ["Tone", creativePlan.brief.tone.join(", ")],
        ["Objective", creativePlan.brief.objective],
      ]
    : [
        ["Brand", defaultBrandKit.name],
        ["Default format", getAdFormat(campaign.formatId).name],
        ["Text safety", "Compositor-rendered copy"],
      ];

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <Brain size={18} aria-hidden="true" className="text-[var(--brand-green-700)]" />
        <h2 className="font-black text-[var(--brand-blue-950)]">Inferred Brief</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {fields.map(([label, value]) => (
          <div key={label} className="rounded-[8px] border border-[var(--brand-line)] bg-white p-3">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-green-700)]">{label}</p>
            <p className="mt-1 text-sm font-bold text-[var(--brand-blue-950)]">{value}</p>
          </div>
        ))}
      </div>
      {creativePlan && <p className="mt-4 text-sm leading-6 muted">{creativePlan.brief.visualDirection}</p>}
    </section>
  );
}

function ManualCampaignControls({
  campaign,
  currentFormat,
  validation,
  onGenerate,
  onStepChange,
  onUpdateCampaign,
}: {
  campaign: CampaignInput;
  currentFormat: ReturnType<typeof getAdFormat>;
  validation: { valid: boolean; errors: string[] };
  onGenerate: () => void;
  onStepChange: (step: WorkflowStep) => void;
  onUpdateCampaign: <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        {(["advertisement", "audience", "format"] as WorkflowStep[]).map((item) => (
          <SecondaryButton key={item} onClick={() => onStepChange(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </SecondaryButton>
        ))}
      </div>
      <Field label="Campaign / Ad Name">
        <input className="control" value={campaign.campaignName} onChange={(event) => onUpdateCampaign("campaignName", event.target.value)} />
      </Field>
      <Field label="What are you advertising?">
        <textarea className="control min-h-20" value={campaign.advertising} onChange={(event) => onUpdateCampaign("advertising", event.target.value)} />
      </Field>
      <Field label="Headline">
        <input className="control" value={campaign.headline} onChange={(event) => onUpdateCampaign("headline", event.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className="control min-h-20" value={campaign.description} onChange={(event) => onUpdateCampaign("description", event.target.value)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Offer">
          <input className="control" value={campaign.offer} onChange={(event) => onUpdateCampaign("offer", event.target.value)} />
        </Field>
        <Field label="CTA">
          <input className="control" value={campaign.cta} onChange={(event) => onUpdateCampaign("cta", event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Audience">
          <select className="control" value={campaign.audience} onChange={(event) => onUpdateCampaign("audience", event.target.value)}>
            {audienceOptions.map((audience) => (
              <option key={audience}>{audience}</option>
            ))}
          </select>
        </Field>
        <Field label="Location">
          <input className="control" value={campaign.location} onChange={(event) => onUpdateCampaign("location", event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Subject / Service">
          <select className="control" value={campaign.subject} onChange={(event) => onUpdateCampaign("subject", event.target.value)}>
            {subjectOptions.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </Field>
        <Field label="Format">
          <select className="control" value={campaign.formatId} onChange={(event) => onUpdateCampaign("formatId", event.target.value)}>
            {adFormats.map((format) => (
              <option key={format.id} value={format.id}>
                {format.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Visual Style">
        <select className="control" value={campaign.styleId} onChange={(event) => onUpdateCampaign("styleId", event.target.value)}>
          {visualStyles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="rounded-[8px] border border-[var(--brand-line)] bg-white p-3 text-sm muted">
        Export size: {currentFormat.width} x {currentFormat.height}
      </div>
      <PrimaryButton disabled={!validation.valid} onClick={onGenerate}>
        <Sparkles size={18} aria-hidden="true" />
        Generate From Manual Brief
      </PrimaryButton>
      {!validation.valid && <p className="text-sm text-[var(--brand-danger)]">{validation.errors[0]}</p>}
    </div>
  );
}

function EditorControls({
  campaign,
  selectedVariation,
  onDuplicate,
  onExport,
  onRegenerate,
  onReset,
  onSave,
  onUpdateCampaign,
  onUpdateSettings,
}: {
  campaign: CampaignInput;
  selectedVariation?: GeneratedVariation;
  onDuplicate: () => void;
  onExport: (type: "png" | "jpg") => void;
  onRegenerate: () => void;
  onReset: () => void;
  onSave: () => void;
  onUpdateCampaign: <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => void;
  onUpdateSettings: (patch: Partial<CompositionSettings>) => void;
}) {
  if (!selectedVariation) return <p className="text-sm muted">Generate ads to unlock the editor.</p>;
  const settings = selectedVariation.settings;

  return (
    <div className="grid gap-4">
      <Field label="Headline">
        <input className="control" value={campaign.headline} onChange={(event) => onUpdateCampaign("headline", event.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className="control min-h-20" value={campaign.description} onChange={(event) => onUpdateCampaign("description", event.target.value)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Offer">
          <input className="control" value={campaign.offer} onChange={(event) => onUpdateCampaign("offer", event.target.value)} />
        </Field>
        <Field label="CTA">
          <input className="control" value={campaign.cta} onChange={(event) => onUpdateCampaign("cta", event.target.value)} />
        </Field>
      </div>
      <Field label="Template">
        <select
          className="control"
          value={settings.templateId}
          onChange={(event) => {
            const template = compositionTemplates.find((item) => item.id === event.target.value);
            onUpdateSettings({ templateId: event.target.value, textPosition: template?.textPosition ?? settings.textPosition });
          }}
        >
          {compositionTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Text Position">
        <select
          className="control"
          value={settings.textPosition}
          onChange={(event) => {
            const next = event.target.value as TextPosition;
            onUpdateSettings({ textPosition: next, templateId: textPositionTemplates[next] });
          }}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
        </select>
      </Field>
      <Field label="Logo Position">
        <select className="control" value={settings.logoPosition} onChange={(event) => onUpdateSettings({ logoPosition: event.target.value as LogoPosition })}>
          {logoPositions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`Logo Size ${Math.round(settings.logoScale * 100)}%`}>
        <input className="control" type="range" min="10" max="28" value={Math.round(settings.logoScale * 100)} onChange={(event) => onUpdateSettings({ logoScale: Number(event.target.value) / 100 })} />
      </Field>
      <Field label={`Font Size ${Math.round(settings.fontScale * 100)}%`}>
        <input className="control" type="range" min="80" max="122" value={Math.round(settings.fontScale * 100)} onChange={(event) => onUpdateSettings({ fontScale: Number(event.target.value) / 100 })} />
      </Field>
      <Field label={`Overlay Strength ${Math.round(settings.overlayOpacity * 100)}%`}>
        <input className="control" type="range" min="40" max="92" value={Math.round(settings.overlayOpacity * 100)} onChange={(event) => onUpdateSettings({ overlayOpacity: Number(event.target.value) / 100 })} />
      </Field>
      <Field label="Image Position">
        <select className="control" value={settings.imagePosition} onChange={(event) => onUpdateSettings({ imagePosition: event.target.value as CompositionSettings["imagePosition"] })}>
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </Field>
      <Field label={`Image Zoom ${Math.round((settings.imageZoom ?? 1.15) * 100)}%`}>
        <input className="control" type="range" min="100" max="160" value={Math.round((settings.imageZoom ?? 1.15) * 100)} onChange={(event) => onUpdateSettings({ imageZoom: Number(event.target.value) / 100 })} />
      </Field>
      <Field label={`Focal X ${Math.round((settings.focalX ?? 0.5) * 100)}%`}>
        <input className="control" type="range" min="15" max="85" value={Math.round((settings.focalX ?? 0.5) * 100)} onChange={(event) => onUpdateSettings({ focalX: Number(event.target.value) / 100 })} />
      </Field>
      <Field label={`Focal Y ${Math.round((settings.focalY ?? 0.48) * 100)}%`}>
        <input className="control" type="range" min="20" max="80" value={Math.round((settings.focalY ?? 0.48) * 100)} onChange={(event) => onUpdateSettings({ focalY: Number(event.target.value) / 100 })} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <SecondaryButton onClick={onRegenerate}>
          <RefreshCw size={16} aria-hidden="true" />
          Regenerate
        </SecondaryButton>
        <SecondaryButton onClick={onDuplicate}>
          <Copy size={16} aria-hidden="true" />
          Duplicate
        </SecondaryButton>
        <SecondaryButton onClick={onReset}>
          <Eraser size={16} aria-hidden="true" />
          Reset
        </SecondaryButton>
        <SecondaryButton onClick={onSave}>
          <Save size={16} aria-hidden="true" />
          Save
        </SecondaryButton>
        <SecondaryButton onClick={() => onExport("png")}>
          <Download size={16} aria-hidden="true" />
          PNG
        </SecondaryButton>
        <SecondaryButton onClick={() => onExport("jpg")}>
          <Download size={16} aria-hidden="true" />
          JPG
        </SecondaryButton>
      </div>
    </div>
  );
}

function Templates() {
  return (
    <section className="panel p-5">
      <h1 className="text-2xl font-black text-[var(--brand-blue-950)]">Templates</h1>
      <p className="mt-1 text-sm muted">Fallback composition systems used by the creative director for exact text rendering.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {compositionTemplates.map((template) => (
          <article key={template.id} className="rounded-[8px] border border-[var(--brand-line)] bg-white p-4">
            <p className="font-black text-[var(--brand-blue-950)]">{template.name}</p>
            <p className="mt-2 text-sm muted">{template.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Projects({
  projects,
  onDelete,
  onDuplicate,
  onExport,
  onOpen,
  onRename,
}: {
  projects: AdProject[];
  onDelete: (projectId: string) => void;
  onDuplicate: (project: AdProject) => void;
  onExport: (project: AdProject) => void;
  onOpen: (project: AdProject) => void;
  onRename: (project: AdProject) => void;
}) {
  return (
    <section className="panel p-5">
      <h1 className="text-2xl font-black text-[var(--brand-blue-950)]">Projects</h1>
      <p className="mt-1 text-sm muted">Saved campaigns, conversations, creative briefs and generated ad sets.</p>
      <div className="mt-5 grid gap-3">
        {projects.map((project) => (
          <article key={project.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-[var(--brand-line)] bg-white p-4">
            <div>
              <p className="font-black text-[var(--brand-blue-950)]">{project.name}</p>
              <p className="mt-1 text-sm muted">
                {getAdFormat(project.formatId).name} - {project.variations.length} variations - {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SecondaryButton onClick={() => onOpen(project)}>Open</SecondaryButton>
              <SecondaryButton onClick={() => onDuplicate(project)}>Duplicate</SecondaryButton>
              <SecondaryButton onClick={() => onRename(project)}>Rename</SecondaryButton>
              <SecondaryButton onClick={() => onExport(project)}>Export</SecondaryButton>
              <SecondaryButton danger onClick={() => onDelete(project.id)}>
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </SecondaryButton>
            </div>
          </article>
        ))}
        {projects.length === 0 && (
          <div className="rounded-[8px] border border-dashed border-[var(--brand-line)] bg-white p-8 text-center muted">
            No projects yet. Generated campaigns are saved here automatically.
          </div>
        )}
      </div>
    </section>
  );
}

function BrandKit() {
  const colors = Object.entries(defaultBrandKit.colors);

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="panel p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={defaultBrandKit.logoPath} alt="TutorServices logo" className="w-full rounded-[8px] border border-[var(--brand-line)] bg-white object-contain p-6" />
        <h1 className="mt-5 text-2xl font-black text-[var(--brand-blue-950)]">{defaultBrandKit.name}</h1>
        <p className="mt-1 text-lg font-bold text-[var(--brand-green-700)]">{defaultBrandKit.tagline}</p>
      </div>
      <div className="panel p-5">
        <h2 className="text-xl font-black text-[var(--brand-blue-950)]">Brand Settings</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Info label="Brand Name" value={defaultBrandKit.name} />
          <Info label="Default CTA" value={defaultBrandKit.defaultCta} />
          <Info label="Headline Font" value={defaultBrandKit.typography.headline} />
          <Info label="Default Logo Placement" value="Top Left" />
        </div>
        <h3 className="mt-6 font-black text-[var(--brand-blue-950)]">Brand Colors</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {colors.map(([name, value]) => (
            <div key={name} className="rounded-[8px] border border-[var(--brand-line)] bg-white p-3">
              <div className="h-10 rounded-[8px]" style={{ background: value }} />
              <p className="mt-2 text-sm font-black text-[var(--brand-blue-950)]">{name}</p>
              <p className="text-xs muted">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-line)] bg-white p-4">
      <p className="text-sm font-black text-[var(--brand-blue-950)]">{label}</p>
      <p className="mt-1 text-sm muted">{value}</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <section className="panel p-5">
      <h1 className="text-2xl font-black text-[var(--brand-blue-950)]">Settings</h1>
      <p className="mt-1 text-sm muted">Provider settings are read from server environment variables.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Info label="Provider Status" value="REAL AI when OPENAI_API_KEY is configured; otherwise Mock Mode." />
        <Info label="Creative Director" value="OpenAI structured-output planning when OPENAI_API_KEY is available; deterministic mock fallback otherwise." />
        <Info label="Provider Options" value="IMAGE_PROVIDER=openai, local, cloud, or mock." />
        <Info label="Local Provider" value="LOCAL_IMAGE_API_URL can point to a ComfyUI, Stable Diffusion, or Flux bridge." />
        <Info label="OpenAI Provider" value="OPENAI_API_KEY, OPENAI_TEXT_MODEL, OPENAI_IMAGE_MODEL and OPENAI_IMAGE_QUALITY stay server-side." />
      </div>
    </section>
  );
}

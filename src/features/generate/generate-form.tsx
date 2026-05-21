"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  generateBlueprintAction,
  type GenerateActionState,
} from "@/actions/blueprint";
import { generateSchema } from "@/lib/validations/generate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/ui/tag-input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratingOverlay } from "@/components/shared/generating-overlay";
import { useSimulatedProgress } from "@/hooks/use-simulated-progress";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useActionState, startTransition } from "react";

const initialState: GenerateActionState = {};

const COMPLEXITY_LABELS = [
  "MVP",
  "Simple",
  "Moderate",
  "Complex",
  "Enterprise",
];

type OverlayPhase = "generating" | "success" | "error";

export function GenerateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    generateBlueprintAction,
    initialState
  );
  const { progress } = useSimulatedProgress(isPending);
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>("generating");
  const [displayProgress, setDisplayProgress] = useState(0);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const handledResultRef = useRef<string | null>(null);

  const form = useForm({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      features: [],
      expectedUsers: "",
      budget: "",
      preferredStack: "",
      authType: "",
      realtimeRequirements: "",
      fileUploadNeeds: "",
      aiFeatures: "",
      deploymentPreference: "",
      complexityLevel: 5,
      needsRealtime: false,
      needsFileUpload: false,
      needsAi: false,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const complexityLevel = Number(watch("complexityLevel") ?? 5);
  const needsRealtime = watch("needsRealtime");
  const needsFileUpload = watch("needsFileUpload");
  const needsAi = watch("needsAi");

  useEffect(() => {
    if (isPending) {
      setShowResultOverlay(false);
      setOverlayPhase("generating");
      setDisplayProgress(0);
      handledResultRef.current = null;
      return;
    }

    setDisplayProgress(progress);
  }, [isPending, progress]);

  useEffect(() => {
    if (isPending) return;

    const resultKey = state.blueprintId
      ? `ok:${state.blueprintId}`
      : state.error
        ? `err:${state.error}`
        : null;

    if (!resultKey || handledResultRef.current === resultKey) return;
    handledResultRef.current = resultKey;

    if (state.blueprintId) {
      setDisplayProgress(100);
      setOverlayPhase("success");
      setShowResultOverlay(true);
      toast.success("Blueprint generated successfully!");
      return;
    }

    if (state.error) {
      setDisplayProgress(100);
      setOverlayPhase("error");
      setShowResultOverlay(true);
      toast.error(state.error);
    }
  }, [isPending, state]);

  const dismissResultOverlay = () => {
    setShowResultOverlay(false);
  };

  const viewBlueprint = () => {
    if (state.blueprintId) {
      router.push(`/blueprints/${state.blueprintId}`);
    }
  };

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "features") {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else {
        formData.append(key, value == null ? "" : String(value));
      }
    });

    if (data.needsRealtime && !data.realtimeRequirements) {
      formData.set("realtimeRequirements", "Realtime features required");
    }
    if (data.needsFileUpload && !data.fileUploadNeeds) {
      formData.set("fileUploadNeeds", "File upload required");
    }
    if (data.needsAi && !data.aiFeatures) {
      formData.set("aiFeatures", "AI/ML features required");
    }

    startTransition(() => {
      formAction(formData);
    });
  });

  const overlayOpen = isPending || showResultOverlay;
  const overlayProgress = isPending ? progress : displayProgress;

  return (
    <div className="space-y-4 sm:space-y-6">
      <GeneratingOverlay
        open={overlayOpen}
        progress={overlayProgress}
        phase={isPending ? "generating" : overlayPhase}
        errorMessage={state.error}
        onDismiss={showResultOverlay ? dismissResultOverlay : undefined}
        onViewBlueprint={
          showResultOverlay && state.blueprintId ? viewBlueprint : undefined
        }
      />

      {!isPending && !showResultOverlay && state.error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Generation failed</p>
            <p className="mt-1 text-destructive/90">{state.error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Check your{" "}
              <Link href="/projects" className="text-primary underline">
                projects
              </Link>{" "}
              for failed entries, fix the issue above, and try again.
            </p>
          </div>
        </div>
      )}

      {!isPending && !showResultOverlay && state.blueprintId && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-400">Blueprint created</p>
            <Button variant="link" className="h-auto p-0 text-primary" asChild>
              <Link href={`/blueprints/${state.blueprintId}`}>
                View your blueprint →
              </Link>
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-8">
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Project basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input
                id="projectName"
                placeholder="e.g. TaskFlow SaaS"
                {...register("projectName")}
              />
              {errors.projectName && (
                <p className="text-xs text-destructive">
                  {errors.projectName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project description</Label>
              <Textarea
                id="projectDescription"
                placeholder="Describe your product vision, target users, and core value proposition..."
                {...register("projectDescription")}
              />
              {errors.projectDescription && (
                <p className="text-xs text-destructive">
                  {errors.projectDescription.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <Controller
                name="features"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add feature and press Enter"
                  />
                )}
              />
              {errors.features && (
                <p className="text-xs text-destructive">
                  {errors.features.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>System complexity</Label>
                <span className="text-sm font-medium text-primary">
                  {COMPLEXITY_LABELS[Math.min(4, Math.floor((complexityLevel - 1) / 2.5))]}
                </span>
              </div>
              <Controller
                name="complexityLevel"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[Number(field.value) || 5]}
                    onValueChange={([v]) => field.onChange(v)}
                  />
                )}
              />
              <input
                type="hidden"
                {...register("complexityLevel", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Scale & constraints</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Expected users</Label>
              <Controller
                name="expectedUsers"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 1K">&lt; 1K users</SelectItem>
                      <SelectItem value="1K - 10K">1K - 10K users</SelectItem>
                      <SelectItem value="10K - 100K">10K - 100K users</SelectItem>
                      <SelectItem value="100K - 1M">100K - 1M users</SelectItem>
                      <SelectItem value="1M+">1M+ users</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.expectedUsers && (
                <p className="text-xs text-destructive">
                  {errors.expectedUsers.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< $100/mo">&lt; $100/mo</SelectItem>
                      <SelectItem value="$100 - $500/mo">$100 - $500/mo</SelectItem>
                      <SelectItem value="$500 - $2K/mo">$500 - $2K/mo</SelectItem>
                      <SelectItem value="$2K - $10K/mo">$2K - $10K/mo</SelectItem>
                      <SelectItem value="$10K+/mo">$10K+/mo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred stack</Label>
              <Controller
                name="preferredStack"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Next.js + Supabase">Next.js + Supabase</SelectItem>
                      <SelectItem value="Next.js + PostgreSQL">Next.js + PostgreSQL</SelectItem>
                      <SelectItem value="React + Node.js">React + Node.js</SelectItem>
                      <SelectItem value="Python + FastAPI">Python + FastAPI</SelectItem>
                      <SelectItem value="Go + gRPC">Go + gRPC</SelectItem>
                      <SelectItem value="No preference">No preference</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Deployment preference</Label>
              <Controller
                name="deploymentPreference"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vercel">Vercel</SelectItem>
                      <SelectItem value="AWS">AWS</SelectItem>
                      <SelectItem value="GCP">Google Cloud</SelectItem>
                      <SelectItem value="Railway">Railway</SelectItem>
                      <SelectItem value="Self-hosted">Self-hosted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Technical requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Authentication type</Label>
                <Controller
                  name="authType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select auth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email/Password">Email/Password</SelectItem>
                        <SelectItem value="OAuth (Google, GitHub)">OAuth</SelectItem>
                        <SelectItem value="Magic Link">Magic Link</SelectItem>
                        <SelectItem value="SSO/SAML">SSO/SAML</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.authType && (
                  <p className="text-xs text-destructive">
                    {errors.authType.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/30 px-4 py-3">
                <Label htmlFor="needsRealtime" className="cursor-pointer">
                  Realtime
                </Label>
                <Switch
                  id="needsRealtime"
                  checked={needsRealtime}
                  onCheckedChange={(v) => setValue("needsRealtime", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/30 px-4 py-3">
                <Label htmlFor="needsFileUpload" className="cursor-pointer">
                  File uploads
                </Label>
                <Switch
                  id="needsFileUpload"
                  checked={needsFileUpload}
                  onCheckedChange={(v) => setValue("needsFileUpload", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/30 px-4 py-3">
                <Label htmlFor="needsAi" className="cursor-pointer">
                  AI features
                </Label>
                <Switch
                  id="needsAi"
                  checked={needsAi}
                  onCheckedChange={(v) => setValue("needsAi", v)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="realtimeRequirements">Realtime details</Label>
                <Input
                  id="realtimeRequirements"
                  placeholder="e.g. WebSockets for chat"
                  disabled={!needsRealtime}
                  {...register("realtimeRequirements")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUploadNeeds">File upload details</Label>
                <Input
                  id="fileUploadNeeds"
                  placeholder="e.g. S3 for images up to 10MB"
                  disabled={!needsFileUpload}
                  {...register("fileUploadNeeds")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="aiFeatures">AI feature details</Label>
                <Input
                  id="aiFeatures"
                  placeholder="e.g. GPT-4 for content generation"
                  disabled={!needsAi}
                  {...register("aiFeatures")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full sm:w-auto"
          disabled={isPending}
        >
          <Sparkles className="h-4 w-4" />
          {isPending
            ? `Generating… ${progress}%`
            : "Generate system blueprint"}
        </Button>
      </form>
    </div>
  );
}

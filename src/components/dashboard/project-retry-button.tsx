"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { retryProjectBlueprintAction } from "@/actions/project";

interface ProjectRetryButtonProps {
  projectId: string;
}

export function ProjectRetryButton({ projectId }: ProjectRetryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(async () => {
      const result = await retryProjectBlueprintAction(projectId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.blueprintId) {
        toast.success("Blueprint generated successfully!");
        router.push(`/blueprints/${result.blueprintId}`);
      }
      router.refresh();
    });
  };

  return (
    <Button
      variant="gradient"
      size="sm"
      className="w-full"
      disabled={isPending}
      onClick={handleRetry}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RotateCcw className="h-3.5 w-3.5" />
      )}
      {isPending ? "Retrying…" : "Retry generation"}
    </Button>
  );
}

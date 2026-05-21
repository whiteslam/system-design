"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreVertical,
  Share2,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteProjectAction,
  retryProjectBlueprintAction,
} from "@/actions/project";
import type { ProjectStatus } from "@/types";

interface ProjectCardMenuProps {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  blueprintId?: string | null;
}

export function ProjectCardMenu({
  projectId,
  projectName,
  status,
  blueprintId,
}: ProjectCardMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleShare = async (e: Event) => {
    e.preventDefault();
    const url =
      blueprintId != null
        ? `${window.location.origin}/blueprints/${blueprintId}`
        : `${window.location.origin}/studio/${projectId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: projectName,
          url,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Could not share link");
      }
    }
    setOpen(false);
  };

  const handleDelete = (e: Event) => {
    e.preventDefault();
    if (
      !confirm(
        `Delete "${projectName}"? This removes the project and its blueprints.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project deleted");
        router.refresh();
      }
      setOpen(false);
    });
  };

  const handleRetry = (e: Event) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await retryProjectBlueprintAction(projectId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.blueprintId) {
        toast.success("Blueprint generated successfully!");
        router.push(`/blueprints/${result.blueprintId}`);
      }
      router.refresh();
      setOpen(false);
    });
  };

  const canRetry = status === "failed" || status === "draft";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={isPending}
          onClick={(e) => e.preventDefault()}
          aria-label="Project options"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={handleShare}>
          <Share2 className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        {canRetry && (
          <DropdownMenuItem onSelect={handleRetry}>
            <RotateCcw className="h-4 w-4" />
            Retry generation
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

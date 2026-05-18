"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProjectOption {
  id: string;
  name: string;
}

interface ProjectPickerProps {
  projects: ProjectOption[];
  currentProjectId?: string;
  basePath: string;
}

export function ProjectPicker({
  projects,
  currentProjectId,
  basePath,
}: ProjectPickerProps) {
  const router = useRouter();
  const selected = currentProjectId ?? projects[0]?.id;

  if (projects.length === 0) {
    return (
      <Card className="border-dashed border-border/50 bg-card/30">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">
            Create a project first to use intelligence features.
          </p>
          <Button variant="gradient" asChild>
            <Link href="/generate">Create project</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground">Project:</span>
      <Select
        value={selected}
        onValueChange={(id) => router.push(`${basePath}/${id}`)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

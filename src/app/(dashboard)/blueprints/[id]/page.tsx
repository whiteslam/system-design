import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlueprint } from "@/actions/blueprint";
import { BlueprintViewer } from "@/features/blueprints/blueprint-viewer";
import { ExportBlueprintButton } from "@/features/blueprints/export-blueprint-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface BlueprintPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlueprintPage({ params }: BlueprintPageProps) {
  const { id } = await params;
  const blueprint = await getBlueprint(id);

  if (!blueprint) {
    notFound();
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:mb-4 sm:text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="line-clamp-2 text-lg font-bold tracking-tight sm:text-2xl lg:text-3xl">
              {blueprint.title}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
              {formatDate(blueprint.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/studio/${blueprint.project_id}`}>
                Open Studio
              </Link>
            </Button>
            <ExportBlueprintButton blueprint={blueprint} />
            <Badge variant="success">Completed</Badge>
          </div>
        </div>
      </div>

      <BlueprintViewer blueprint={blueprint} />
    </div>
  );
}

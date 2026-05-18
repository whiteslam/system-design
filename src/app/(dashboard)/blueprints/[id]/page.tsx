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
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {blueprint.title}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Generated {formatDate(blueprint.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
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

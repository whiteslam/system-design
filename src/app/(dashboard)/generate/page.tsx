import { GenerateForm } from "@/features/generate/generate-form";

export default function GeneratePage() {
  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          Generate blueprint
        </h1>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
          Describe your project — AI architects your system
        </p>
      </div>
      <GenerateForm />
    </div>
  );
}

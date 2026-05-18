import { GenerateForm } from "@/features/generate/generate-form";

export default function GeneratePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Generate blueprint
        </h1>
        <p className="mt-1 text-muted-foreground">
          Describe your project and let AI architect your system
        </p>
      </div>
      <GenerateForm />
    </div>
  );
}

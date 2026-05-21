import { PenLine, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Describe your project",
    description:
      "Enter your idea, features, scale, budget, and tech preferences in our guided form.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI architects your system",
    description:
      "Our AI panel generates architecture, database, APIs, security, and deployment plans.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Ship with confidence",
    description:
      "Export production-ready blueprints and start building with a clear roadmap.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 safe-x sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps from idea to production blueprint
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-xl sm:p-8"
            >
              <span className="text-4xl font-bold text-primary/20">
                {item.step}
              </span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section id="how-it-works" className="px-4 py-12 safe-x sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-16">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps from idea to production blueprint
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-8">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className={`relative rounded-xl border border-border/50 bg-card/30 p-3 backdrop-blur-xl sm:rounded-2xl sm:p-8 ${
                index === 2 ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <span className="text-2xl font-bold text-primary/20 sm:text-4xl">
                {item.step}
              </span>
              <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 sm:mt-4 sm:h-12 sm:w-12 sm:rounded-xl">
                <item.icon className="h-4 w-4 text-primary sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-2 text-xs font-semibold leading-snug text-foreground sm:mt-4 sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

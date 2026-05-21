import {
  Database,
  Shield,
  Cloud,
  Layers,
  GitBranch,
  Gauge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Layers,
    title: "System Architecture",
    description:
      "High-level component diagrams, service boundaries, and data flow designed for your scale.",
  },
  {
    icon: Database,
    title: "Database Design",
    description:
      "Production-ready schemas with relationships, indexes, and migration strategies.",
  },
  {
    icon: GitBranch,
    title: "API Structure",
    description:
      "RESTful or GraphQL endpoints with versioning, auth flows, and request examples.",
  },
  {
    icon: Shield,
    title: "Security Plan",
    description:
      "OWASP mitigations, encryption, RBAC, and secrets management recommendations.",
  },
  {
    icon: Cloud,
    title: "Deployment Strategy",
    description:
      "CI/CD pipelines, infrastructure as code, and environment configuration.",
  },
  {
    icon: Gauge,
    title: "Scalability",
    description:
      "Caching layers, CDN strategy, queue systems, and cost optimization.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-12 safe-x sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-16">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Everything you need to ship
          </h2>
          <p className="mt-4 text-muted-foreground">
            From idea to production-ready blueprint in one workflow
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group h-full border-border/50 bg-card/30 transition-colors hover:border-primary/30 hover:bg-card/50"
            >
              <CardHeader className="space-y-0 p-3 sm:space-y-1.5 sm:p-6">
                <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20 sm:mb-2 sm:h-10 sm:w-10 sm:rounded-xl">
                  <feature.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
                <CardTitle className="text-xs leading-snug sm:text-base">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

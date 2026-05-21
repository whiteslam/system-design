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
    <section id="features" className="px-4 py-16 safe-x sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Everything you need to ship
          </h2>
          <p className="mt-4 text-muted-foreground">
            From idea to production-ready blueprint in one workflow
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group h-full border-border/50 bg-card/30 transition-colors hover:border-primary/30 hover:bg-card/50"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
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

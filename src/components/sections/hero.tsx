import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative flex min-h-screen-safe flex-col items-center justify-center px-4 pt-28 pb-16 text-center safe-x sm:px-6 sm:pt-24 sm:pb-20">
      <div className="mb-6">
        <Badge variant="outline" className="gap-1.5 px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          AI-Powered System Design
        </Badge>
      </div>

      <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
        Design production-grade{" "}
        <span className="gradient-text">systems with AI</span>
      </h1>

      <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
        Transform your project idea into complete architecture blueprints —
        database schemas, APIs, security plans, and deployment strategies in
        minutes.
      </p>

      <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        <Button variant="gradient" size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/signup">
            Start designing free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="glass" size="lg" className="w-full sm:w-auto" asChild>
          <Link href="#demo">View demo blueprint</Link>
        </Button>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Trusted by developers building the next generation of products
      </p>
    </section>
  );
}

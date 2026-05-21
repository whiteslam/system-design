import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-4 py-16 safe-x sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/50 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent p-6 text-center sm:rounded-3xl sm:p-10 md:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Ready to architect your next project?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Join developers who ship faster with AI-powered system design
          blueprints.
        </p>
        <Button variant="gradient" size="lg" className="mt-8" asChild>
          <Link href="/signup">
            Get started for free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

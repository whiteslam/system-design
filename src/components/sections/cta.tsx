"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl border border-border/50 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent p-12 text-center backdrop-blur-xl"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
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
      </motion.div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Badge variant="outline" className="gap-1.5 px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          AI-Powered System Design
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
      >
        Design production-grade{" "}
        <span className="gradient-text">systems with AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
      >
        Transform your project idea into complete architecture blueprints —
        database schemas, APIs, security plans, and deployment strategies in
        minutes.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Button variant="gradient" size="lg" asChild>
          <Link href="/signup">
            Start designing free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="glass" size="lg" asChild>
          <Link href="#demo">View demo blueprint</Link>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        Trusted by developers building the next generation of products
      </motion.p>
    </section>
  );
}

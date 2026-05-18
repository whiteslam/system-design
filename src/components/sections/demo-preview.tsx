"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const demoSections = {
  architecture: `┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  API Gateway │────▶│  Services   │
│   Frontend  │     │   (Edge)     │     │  (Node.js)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                   │
                     ┌──────────────┐     ┌───────▼──────┐
                     │    Redis     │◀────│  PostgreSQL  │
                     │   (Cache)    │     │   (Primary)  │
                     └──────────────┘     └──────────────┘`,
  database: `-- Users & Auth
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core entities with RLS
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL
);`,
  apis: `POST /api/v1/projects
GET  /api/v1/projects/:id
POST /api/v1/blueprints/generate

Authorization: Bearer <jwt>
Rate Limit: 100 req/min`,
};

export function DemoPreview() {
  return (
    <section id="demo" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See a blueprint in action
          </h2>
          <p className="mt-4 text-muted-foreground">
            Preview the quality of AI-generated system designs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden border-border/50 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
              <div>
                <CardTitle className="text-base">E-Commerce Platform</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Next.js · PostgreSQL · Redis · Vercel
                </p>
              </div>
              <Badge variant="success">Completed</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="architecture" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-6">
                  <TabsTrigger value="architecture">Architecture</TabsTrigger>
                  <TabsTrigger value="database">Database</TabsTrigger>
                  <TabsTrigger value="apis">APIs</TabsTrigger>
                </TabsList>
                {Object.entries(demoSections).map(([key, content]) => (
                  <TabsContent key={key} value={key} className="p-6">
                    <pre className="overflow-x-auto rounded-xl bg-muted/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                      {content}
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

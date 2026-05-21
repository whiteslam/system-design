"use client";

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
    <section id="demo" className="px-4 py-12 safe-x sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center sm:mb-12">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            See a blueprint in action
          </h2>
          <p className="mt-4 text-muted-foreground">
            Preview the quality of AI-generated system designs
          </p>
        </div>

        <Card className="overflow-hidden border-border/50 bg-card/40">
            <CardHeader className="flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-base">E-Commerce Platform</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Next.js · PostgreSQL · Redis · Vercel
                </p>
              </div>
              <Badge variant="success">Completed</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="architecture" className="w-full">
                <TabsList className="scrollbar-none w-full justify-start overflow-x-auto rounded-none border-b border-border/50 bg-transparent px-4 sm:px-6">
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
      </div>
    </section>
  );
}

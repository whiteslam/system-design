"use client";

import { useState, useTransition } from "react";
import { askInfrastructureChat } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function InfrastructureChat({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    startTransition(async () => {
      const result = await askInfrastructureChat(projectId, q);
      if (result.error) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Error: ${result.error}` },
        ]);
        return;
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", content: result.data ?? "No response." },
      ]);
    });
  };

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Infrastructure AI chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ask about scaling, incidents, or deployment — e.g. &quot;What happens if Redis
              fails?&quot;
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user"
                    ? "ml-8 rounded-xl bg-primary/10 px-3 py-2 text-sm"
                    : "mr-8 rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                }
              >
                {msg.content}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How do I scale WebSockets?"
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button variant="gradient" onClick={send} disabled={pending} className="shrink-0">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

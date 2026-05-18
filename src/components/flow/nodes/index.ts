import { createNode } from "./base-node";

export const studioNodeTypes = {
  frontend: createNode("▲", "#61dafb"),
  api: createNode("⬡", "#8b5cf6"),
  database: createNode("🐘", "#336791"),
  cache: createNode("◉", "#dc382d"),
  queue: createNode("≡", "#f59e0b"),
  cdn: createNode("☁", "#22d3ee"),
  ai: createNode("✦", "#10a37f"),
  storage: createNode("🪣", "#ff9900"),
  auth: createNode("🔐", "#eb5424"),
  monitoring: createNode("📊", "#632ca6"),
  devops: createNode("☸", "#326ce5"),
};

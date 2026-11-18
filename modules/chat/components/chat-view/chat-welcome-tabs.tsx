"use client";

import React, { useState } from "react";
import {
  Layers,
  Code2,
  Lightbulb,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles,
  Database,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
  category: "all" | "code" | "architecture" | "learning";
  badge?: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "system-design",
    title: "System Design Architecture",
    description: "Architect a resilient, distributed rate-limiting service with Redis and Token Bucket.",
    prompt:
      "Design a scalable, distributed rate-limiting system capable of handling 100,000 requests/second. Detail the architecture, data structures (Token Bucket vs Leaky Bucket), Redis integration, failure modes, and trade-offs.",
    icon: Layers,
    category: "architecture",
    badge: "Architecture",
  },
  {
    id: "debug-react",
    title: "Debug React/Next.js Code",
    description: "Identify subtle re-render loops, hook dependency pitfalls, and state desynchronization.",
    prompt:
      "Review the following Next.js component for performance bottlenecks, unnecessary re-renders, and memory leaks. Provide optimized TypeScript code with explanations of what changed:\n\n```tsx\n// Paste your component here\n```",
    icon: Code2,
    category: "code",
    badge: "Next.js",
  },
  {
    id: "explain-simply",
    title: "Explain a Concept Simply",
    description: "Break down complex engineering or computer science concepts into clear analogies.",
    prompt:
      "Explain the CAP theorem and distributed consensus (Raft) to me as if I'm a junior engineer. Use an intuitive real-world analogy first, then explain the technical mechanisms and practical industry trade-offs.",
    icon: Lightbulb,
    category: "learning",
    badge: "Concepts",
  },
  {
    id: "summarize-data",
    title: "Summarize & Format Data",
    description: "Transform raw unstructured logs, notes, or research into clean Markdown tables.",
    prompt:
      "Please parse and summarize the following unstructured data. Organize key findings into a clear Executive Summary, followed by a structured Markdown comparison table and prioritized action items:\n\n[Paste raw data here]",
    icon: FileSpreadsheet,
    category: "learning",
    badge: "Data",
  },
  {
    id: "db-optimization",
    title: "PostgreSQL & Prisma Tuning",
    description: "Optimize query execution plans, compound indexes, and connection pooling.",
    prompt:
      "What are the best practices for indexing compound query patterns in PostgreSQL with Prisma ORM? Explain when to use B-Tree vs Hash vs GIN indexes, and how to analyze slow queries using EXPLAIN ANALYZE.",
    icon: Database,
    category: "code",
    badge: "Database",
  },
  {
    id: "interview-prep",
    title: "Technical Interview Coach",
    description: "Simulate a senior system architecture interview with interactive feedback.",
    prompt:
      "Act as an engineering manager interviewing me for a Senior Full-Stack role. Ask me one deep architectural question about designing an event-driven notification service with WebSockets and message queues. Wait for my response before evaluating.",
    icon: GraduationCap,
    category: "architecture",
    badge: "Career",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Starters", icon: Sparkles },
  { id: "architecture", label: "System Design", icon: Layers },
  { id: "code", label: "Code & Debug", icon: Code2 },
  { id: "learning", label: "Explain & Analyze", icon: Lightbulb },
] as const;

interface ChatWelcomeTabsProps {
  userName?: string | null;
  onMessageSelect: (message: string) => void;
}

const ChatWelcomeTabs = ({
  userName = "Developer",
  onMessageSelect,
}: ChatWelcomeTabsProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPrompts =
    activeCategory === "all"
      ? PROMPT_TEMPLATES
      : PROMPT_TEMPLATES.filter((p) => p.category === activeCategory);

  const firstName = userName?.trim().split(" ")[0] || "there";

  return (
    <div className="flex flex-col items-center justify-center px-4 w-full">
      <div className="w-full max-w-3xl space-y-5">
        {/* Header Greeting */}
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How can I help you today,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {firstName}
            </span>
            ?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pick a starter template below or ask any technical question.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "h-7 px-3 text-xs gap-1.5 rounded-full transition-all cursor-pointer",
                  !isActive && "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="size-3" />
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
          {filteredPrompts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onMessageSelect(item.prompt)}
                className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      <Icon className="size-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className="text-[9px] font-medium text-muted-foreground/80 uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="size-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatWelcomeTabs;

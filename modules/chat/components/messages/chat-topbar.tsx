"use client";

import React, { useMemo } from "react";
import { Download, Copy, FileText, Code2, Sparkles, Check, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { UIMessage } from "ai";
import type { AIModel } from "../chat-view/model-selector";

interface ChatTopbarProps {
  chatTitle?: string;
  modelInfo?: AIModel | null;
  messages: UIMessage[];
}

export function ChatTopbar({ chatTitle = "Conversation", modelInfo, messages }: ChatTopbarProps) {
  const [copied, setCopied] = React.useState(false);

  // Calculate session tokens and estimated cost
  const stats = useMemo(() => {
    let totalChars = 0;
    let userChars = 0;
    let assistantChars = 0;

    messages.forEach((msg) => {
      let text = "";
      if (Array.isArray(msg.parts)) {
        msg.parts.forEach((p: any) => {
          if (p.type === "text" && typeof p.text === "string") {
            text += p.text;
          }
        });
      } else if (typeof (msg as any).content === "string") {
        text = (msg as any).content;
      }

      totalChars += text.length;
      if (msg.role === "user") {
        userChars += text.length;
      } else {
        assistantChars += text.length;
      }
    });

    // Approximate 1 token ~= 4 chars (standard rule of thumb)
    const promptTokens = Math.ceil(userChars / 4);
    const completionTokens = Math.ceil(assistantChars / 4);
    const totalTokens = promptTokens + completionTokens;

    const isFree =
      modelInfo?.pricing?.prompt === "0" &&
      modelInfo?.pricing?.completion === "0";

    const promptPricePerMillion = parseFloat(modelInfo?.pricing?.prompt || "0");
    const completionPricePerMillion = parseFloat(modelInfo?.pricing?.completion || "0");

    const estimatedCost = isFree
      ? 0
      : (promptTokens / 1_000_000) * promptPricePerMillion +
        (completionTokens / 1_000_000) * completionPricePerMillion;

    return {
      promptTokens,
      completionTokens,
      totalTokens,
      isFree,
      estimatedCost,
      costDisplay: isFree
        ? "FREE"
        : estimatedCost === 0
        ? "$0.00"
        : estimatedCost < 0.001
        ? "<$0.001"
        : `$${estimatedCost.toFixed(4)}`,
    };
  }, [messages, modelInfo]);

  // Extract clean text from message parts
  const formatChatToMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# ${chatTitle}`);
    lines.push(`*Exported from NexusChat on ${new Date().toLocaleDateString()}*`);
    if (modelInfo?.name) {
      lines.push(`*Model: ${modelInfo.name}*`);
    }
    lines.push("\n---\n");

    messages.forEach((msg) => {
      const roleName = msg.role === "user" ? "You" : modelInfo?.name || "Nexus Assistant";
      lines.push(`### ${roleName}\n`);

      if (Array.isArray(msg.parts)) {
        msg.parts.forEach((p: any) => {
          if (p.type === "text" && p.text) {
            lines.push(p.text);
          } else if (p.type === "reasoning" && p.text) {
            lines.push(`> *Thinking process:*\n> ${p.text.split("\n").join("\n> ")}`);
          }
        });
      } else if (typeof (msg as any).content === "string") {
        lines.push((msg as any).content);
      }
      lines.push("\n---\n");
    });

    return lines.join("\n");
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const md = formatChatToMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chatTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30) || "chat"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exported conversation as Markdown (.md)");
  };

  const handleExportJSON = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const data = {
      title: chatTitle,
      model: modelInfo?.id || "unknown",
      modelName: modelInfo?.name || "unknown",
      exportedAt: new Date().toISOString(),
      stats,
      messages,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chatTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30) || "chat"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exported conversation as JSON");
  };

  const handleCopyToClipboard = async () => {
    if (messages.length === 0) {
      toast.error("No messages to copy");
      return;
    }
    const md = formatChatToMarkdown();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Copied conversation to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/60">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-semibold truncate max-w-[220px] sm:max-w-xs md:max-w-md">
          {chatTitle}
        </h2>
        {modelInfo?.name && (
          <Badge variant="outline" className="text-[11px] h-5 px-1.5 shrink-0 hidden sm:inline-flex">
            {modelInfo.name}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Token & Cost Popover Badge */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 gap-1.5 font-normal text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Sparkles className="size-3 text-primary" />
              <span>~{stats.totalTokens.toLocaleString()} tokens</span>
              <span className="text-[10px] px-1 py-0.2 rounded font-semibold bg-primary/10 text-primary">
                {stats.costDisplay}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-3 text-xs space-y-2">
            <div className="font-semibold text-foreground flex items-center justify-between">
              <span>Session Usage</span>
              <Badge variant={stats.isFree ? "secondary" : "default"} className="text-[10px] h-4">
                {stats.costDisplay}
              </Badge>
            </div>
            <div className="space-y-1 text-muted-foreground border-t pt-2">
              <div className="flex justify-between">
                <span>Prompt Tokens:</span>
                <span className="font-mono text-foreground">{stats.promptTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Tokens:</span>
                <span className="font-mono text-foreground">{stats.completionTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tokens:</span>
                <span className="font-mono text-foreground">{stats.totalTokens.toLocaleString()}</span>
              </div>
              {modelInfo?.context_length && (
                <div className="flex justify-between">
                  <span>Context Limit:</span>
                  <span className="font-mono text-foreground">{modelInfo.context_length.toLocaleString()}</span>
                </div>
              )}
            </div>
            {modelInfo && (
              <div className="text-[11px] text-muted-foreground border-t pt-1.5">
                Model: <span className="font-medium text-foreground">{modelInfo.name}</span>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 cursor-pointer">
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Export Conversation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleExportMarkdown} className="cursor-pointer text-xs">
                <FileText className="size-4 mr-2" />
                Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer text-xs">
                <Code2 className="size-4 mr-2" />
                JSON (.json)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer text-xs">
                {copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}
                Copy to Clipboard
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported?: boolean;
  onToggle: () => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInputButton({
  isListening,
  isSupported = true,
  onToggle,
  className,
  disabled = false,
}: VoiceInputButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isListening ? "destructive" : "ghost"}
          size="sm"
          disabled={disabled}
          onClick={onToggle}
          className={cn(
            "relative size-8 p-0 rounded-full transition-all cursor-pointer shrink-0",
            isListening
              ? "animate-pulse ring-2 ring-destructive ring-offset-1 bg-destructive text-destructive-foreground hover:bg-destructive"
              : "hover:bg-accent text-muted-foreground hover:text-foreground",
            className
          )}
          aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
        >
          {isListening ? (
            <MicOff className="size-4 animate-bounce" />
          ) : (
            <Mic className="size-4" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{isListening ? "Listening... Click to stop" : "Voice dictation (speech-to-text)"}</p>
      </TooltipContent>
    </Tooltip>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { Send, Paperclip, Mic, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAIModels } from "../../hooks/use-ai-models";
import { ModelSelector } from "./model-selector";
import { useCreateChat } from "../../hooks/use-chats";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { VoiceInputButton } from "@/components/voice-input-button";

interface ChatMessageFormProps {
  initialMessage?: string;
  onMessageChange?: (msg: string) => void;
}

export default function ChatMessageForm({
  initialMessage,
  onMessageChange,
}: ChatMessageFormProps) {
  const { data: models, isPending } = useAIModels();
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    models?.models?.[0]?.id
  );

  const { mutateAsync, isPending: isChatPending } = useCreateChat();
  const { isListening, isSupported, toggleListening } = useSpeechRecognition();
  const baseMessageRef = React.useRef("");

  const handleVoiceToggle = () => {
    if (!isListening) {
      baseMessageRef.current = message.trim();
    }
    toggleListening({
      onTranscript: (spokenText) => {
        const base = baseMessageRef.current;
        setMessage(base ? `${base} ${spokenText}` : spokenText);
      },
    });
  };

  useEffect(() => {
    if (!selectedModel && models?.models?.length) {
      const lingModel = models.models.find((m: { id: string }) => m.id.includes("ling-3.2"));
      setSelectedModel(lingModel ? lingModel.id : models.models[0].id);
    }
  }, [models, selectedModel]);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      onMessageChange?.("");
    }
  }, [initialMessage, onMessageChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const modelToUse = selectedModel || models?.models?.[0]?.id;
    if (!modelToUse) {
      toast.error("Please select a model first");
      return;
    }

    try {
      await mutateAsync({ content: message.trim(), model: modelToUse });
      toast.success("Message sent successfully");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <form onSubmit={handleSubmit} className="relative">
        {/* Main Input Container */}
        <div className="relative rounded-2xl border border-border shadow-sm   transition-all">
          {/* Textarea */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 "
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t ">
            {/* Left side tools */}
            <div className="flex items-center gap-1">
              {isPending ? (
                <>
                  <Spinner />
                </>
              ) : (
                <ModelSelector
                  models={models?.models}
                  selectedModelId={selectedModel}
                  onModelSelect={setSelectedModel}
                  className="ml-1"
                />
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5">
              <VoiceInputButton
                isListening={isListening}
                isSupported={isSupported}
                onToggle={handleVoiceToggle}
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                size="sm"
                variant={message.trim() ? "default" : "ghost"}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Send message"
                title={
                  message.trim() ? "Send message" : "Enter a message to enable"
                }
              >
                {isChatPending ? (
                  <Spinner />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

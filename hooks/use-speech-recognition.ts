"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface SpeechRecognitionOptions {
  onTranscript?: (text: string) => void;
  lang?: string;
  continuous?: boolean;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef<((text: string) => void) | undefined>(undefined);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      setIsSupported(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    ({ onTranscript, lang = "en-US", continuous = false }: SpeechRecognitionOptions = {}) => {
      if (typeof window === "undefined") return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser. Try Google Chrome or Edge.");
        return;
      }

      onTranscriptRef.current = onTranscript;

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {}
          recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          toast.info("Listening... speak into your microphone", { id: "voice-dictation-active" });
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          const currentTranscript = (finalTranscript + interimTranscript).trim();
          if (currentTranscript && onTranscriptRef.current) {
            onTranscriptRef.current(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          try {
            recognition.abort();
          } catch {}
          recognitionRef.current = null;
          setIsListening(false);

          if (event.error === "not-allowed") {
            toast.error("Microphone access was denied. Please allow microphone permissions in browser settings.", {
              id: "speech-error-not-allowed",
            });
          } else if (event.error === "network") {
            toast.error(
              "Speech service unavailable. If using Brave or a strict adblocker, please allow Google Speech Services or try Chrome.",
              { id: "speech-error-network" }
            );
          } else if (event.error === "no-speech") {
            // User paused without speaking; stop quietly
          } else {
            toast.error(`Voice recognition error: ${event.error}`, {
              id: "speech-error-generic",
            });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
        recognitionRef.current = null;
      }
    },
    []
  );

  const toggleListening = useCallback(
    (options?: SpeechRecognitionOptions) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(options);
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
    toggleListening,
  };
}

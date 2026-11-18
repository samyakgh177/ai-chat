import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className, iconOnly = false, size = "md", href }: LogoProps) {
  const iconSizes = {
    sm: "size-6 rounded-lg",
    md: "size-8 rounded-xl",
    lg: "size-10 rounded-2xl",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Nexus Icon Squircle */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-md shadow-violet-500/20 shrink-0",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-1/2"
        >
          <path d="M6 19V5l12 14V5" />
        </svg>
        <div className="absolute top-1 left-1 size-1 bg-white rounded-full opacity-90" />
        <div className="absolute bottom-1 right-1 size-1 bg-cyan-300 rounded-full opacity-90" />
      </div>

      {/* Typography */}
      {!iconOnly && (
        <div className={cn("tracking-tight leading-none flex items-center", textSizes[size])}>
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent font-extrabold">
            Nexus
          </span>
          <span className="text-foreground font-semibold ml-1">
            Chat
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

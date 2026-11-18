"use client"

import * as React from "react"
import { Sunrise, Sunset } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sunset className="size-5 dark:hidden" />
      <Sunrise className="size-5 hidden dark:block" />
    </Button>
  )
}
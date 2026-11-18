"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

const SignInPage = () => {
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const demoEmail = "demo.guest@nexuschat.io";
      const demoPassword = "DemoGuestSecure2025!";
      const demoName = "Recruiter Guest";

      // Attempt sign in with demo credentials
      const signInRes = await authClient.signIn.email({
        email: demoEmail,
        password: demoPassword,
        callbackURL: "/",
      });

      if (signInRes.error) {
        // If not found, create the demo account automatically
        const signUpRes = await authClient.signUp.email({
          email: demoEmail,
          password: demoPassword,
          name: demoName,
          callbackURL: "/",
        });

        if (signUpRes.error) {
          console.error("Sign up error:", signUpRes.error);
          toast.error("Could not initialize demo guest. Please try signing in with GitHub.");
          setIsGuestLoading(false);
          return;
        }
      }

      toast.success("Welcome to NexusChat! Launching demo...");
      window.location.href = "/";
    } catch (err) {
      console.error("Guest login error:", err);
      toast.error("Failed to start guest session.");
      setIsGuestLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (err) {
      console.error("GitHub login error:", err);
      toast.error("Failed to redirect to GitHub");
      setIsGitHubLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12 md:py-24">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Top Badge */}
        <Badge variant="outline" className="mb-6 px-3 py-1 gap-1.5 text-xs text-muted-foreground border-primary/20 bg-primary/5">
          <Sparkles className="size-3 text-primary animate-pulse" />
          <span>Interactive AI Portfolio Demo</span>
        </Badge>

        {/* Branding */}
        <Logo size="lg" />

        <p className="mt-3 text-center text-sm md:text-base text-muted-foreground max-w-xs">
          A multi-model AI conversational platform with real-time token tracking and conversation search.
        </p>

        {/* Action Card */}
        <div className="mt-8 w-full bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          {/* Guest / Demo Option */}
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              size="lg"
              disabled={isGuestLoading || isGitHubLoading}
              onClick={handleGuestLogin}
              className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/85 hover:opacity-95 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              {isGuestLoading ? (
                <>
                  <Spinner className="size-4" />
                  <span>Launching Demo Workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-primary-foreground" />
                  <span>Explore Demo as Guest</span>
                  <ArrowRight className="size-4 ml-auto" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              ⚡ Instant access — test models, token tracker & exports without an account.
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center my-1">
            <div className="flex-grow border-t border-border/70" />
            <span className="shrink-0 px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              or sign in with
            </span>
            <div className="flex-grow border-t border-border/70" />
          </div>

          {/* GitHub Login */}
          <Button
            variant="outline"
            size="lg"
            disabled={isGuestLoading || isGitHubLoading}
            onClick={handleGitHubLogin}
            className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2.5 border-border hover:bg-accent/50 cursor-pointer"
          >
            {isGitHubLoading ? (
              <>
                <Spinner className="size-4" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <Image src="/github.svg" alt="GitHub" width={20} height={20} className="dark:invert" />
                <span>Continue with GitHub</span>
              </>
            )}
          </Button>

          {/* Security / Safe Note */}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-muted-foreground/80" />
            <span>Secure authentication powered by Better Auth</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;

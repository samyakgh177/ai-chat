"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  submitVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  cancelText?: string;
  showFooter?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText = "Continue",
  submitVariant = "default",
  cancelText = "Cancel",
  showFooter = true,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="py-2">{children}</div>}

        {showFooter && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            {onSubmit && (
              <Button variant={submitVariant} onClick={onSubmit}>
                {submitText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

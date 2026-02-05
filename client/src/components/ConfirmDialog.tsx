import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onOpenChange,
  destructive,
  "data-testid": testId,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  "data-testid"?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid={testId} className="glass-strong border-border/70">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-glow">{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription className="text-muted-foreground">{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-xl border-border/70 bg-white/3 hover:bg-white/6 transition-all"
            data-testid={`${testId}-cancel`}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            data-testid={`${testId}-confirm`}
            className={
              destructive
                ? "rounded-xl bg-destructive text-destructive-foreground hover:brightness-110 transition-all"
                : "rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all"
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

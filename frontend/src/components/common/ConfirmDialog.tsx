"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
}: ConfirmDialogProps) => {
  const getIconColor = () => {
    switch (variant) {
      case "danger":
        return "text-destructive"
      case "warning":
        return "text-amber-500"
      case "info":
        return "text-primary"
      default:
        return "text-destructive"
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "default"
      default:
        return "destructive"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md animate-slideUp">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className={`h-6 w-6 ${getIconColor()}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button variant={getConfirmButtonVariant() as any} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

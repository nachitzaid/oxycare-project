"use client"

import type React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          "relative bg-card border border-border rounded-lg shadow-lg w-full animate-slideUp",
          sizeClasses[size],
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default Modal

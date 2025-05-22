"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

const Pagination = ({ currentPage, totalPages, onPageChange, siblingCount = 1 }: PaginationProps) => {
  // Fonction pour générer la plage de pages à afficher
  const generatePaginationItems = () => {
    const items = []

    // Toujours afficher la première page
    items.push(1)

    // Calculer la plage de pages autour de la page courante
    const leftSibling = Math.max(2, currentPage - siblingCount)
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount)

    // Ajouter des points de suspension si nécessaire à gauche
    if (leftSibling > 2) {
      items.push("ellipsis-left")
    }

    // Ajouter les pages entre les points de suspension
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(i)
      }
    }

    // Ajouter des points de suspension si nécessaire à droite
    if (rightSibling < totalPages - 1) {
      items.push("ellipsis-right")
    }

    // Toujours afficher la dernière page si elle existe
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  const paginationItems = generatePaginationItems()

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center mt-6 space-x-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Page précédente</span>
      </Button>

      {paginationItems.map((item, index) => {
        if (item === "ellipsis-left" || item === "ellipsis-right") {
          return (
            <Button key={`ellipsis-${index}`} variant="ghost" size="icon" disabled className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }

        return (
          <Button
            key={index}
            variant={currentPage === item ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(item as number)}
            className={cn("h-8 w-8", currentPage === item ? "pointer-events-none" : "")}
          >
            {item}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Page suivante</span>
      </Button>
    </div>
  )
}

export default Pagination

"use client"

import { useState } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { Bell, Search, Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  onMobileMenuToggle?: () => void
}

const Navbar = ({ onMobileMenuToggle }: NavbarProps) => {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<number>(3)

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }

  return (
    <header className="bg-card text-card-foreground border-b border-border sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={onMobileMenuToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-end md:justify-between">
            <div className="flex-1 flex justify-start max-w-md">
              <div className="w-full max-w-md lg:max-w-xs relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-10 bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.prenom && user?.nom ? getInitials(user.prenom, user.nom) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.prenom} {user?.nom}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.role === "admin" ? "Administrateur" : "Technicien"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profil</DropdownMenuItem>
                  <DropdownMenuItem>Paramètres</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Se déconnecter</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

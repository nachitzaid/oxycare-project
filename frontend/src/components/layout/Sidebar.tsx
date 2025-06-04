"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import {
  Home,
  Users,
  Cpu,
  PenToolIcon as Tool,
  ClipboardCheck,
  ChevronLeft,
  Menu,
  Settings,
  LogOut,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  role: "all" | "admin" | "technicien"
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const currentPath = usePathname()
  const { isAdmin, isTechnician, logout } = useAuth()

  // Navigation selon les rôles
  const navigation: NavigationItem[] = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      role: "all",
    },
    {
      name: "Rappels",
      href: "/reminders",
      icon: <Bell className="h-5 w-5" />,
      role: "technicien",
    },
    {
      name: "Patients",
      href: "/patients",
      icon: <Users className="h-5 w-5" />,
      role: "admin",
    },
    {
      name: "Dispositifs",
      href: "/devices",
      icon: <Cpu className="h-5 w-5" />,
      role: "admin",
    },
    {
      name: "Interventions",
      href: "/interventions",
      icon: <Tool className="h-5 w-5" />,
      role: "admin",
    },
    {
      name: "Mes Interventions",
      href: "/technicien/interventions",
      icon: <Tool className="h-5 w-5" />,
      role: "technicien",
    },
    {
      name: "Contrôles",
      href: "/controls",
      icon: <ClipboardCheck className="h-5 w-5" />,
      role: "technicien",
    },
    {
      name: "Paramètres",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      role: "admin",
    },
  ]

  // Filtrer selon le rôle
  const filteredNavigation = navigation.filter(
    (item) =>
      item.role === "all" ||
      (item.role === "admin" && isAdmin()) ||
      (item.role === "technicien" && isTechnician()),
  )

  return (
    <div
      className={cn(
        "h-screen bg-card text-card-foreground border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          {!collapsed && <span className="text-xl font-bold text-primary">OxyCare</span>}
          {collapsed && <span className="text-xl font-bold text-primary">O2</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-2 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all",
                currentPath === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center" : "",
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  currentPath === item.href
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {item.icon}
              </div>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          title="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
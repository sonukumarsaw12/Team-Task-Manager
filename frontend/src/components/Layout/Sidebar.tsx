"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  User,
  LogOut,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  mobile?: boolean;
}

export default function Sidebar({ mobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Projects",
      icon: FolderKanban,
      href: "/projects",
      active: pathname === "/projects" || pathname.startsWith("/projects/"),
    },
    {
      label: "Activity Log",
      icon: Activity,
      href: "/activity",
      active: pathname === "/activity",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
  ];

  return (
    <div className={`flex flex-col h-full bg-white/40 dark:bg-card/50 backdrop-blur-3xl border-r border-foreground/5 ${!mobile ? "w-64 hidden lg:flex" : "w-full"}`}>
      {/* Sidebar Header with Logo */}
      <div className="flex items-center justify-between h-16 border-b border-foreground/5 px-6">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            TaskFlow
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-3">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="relative group block"
            >
              <div
                className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${route.active
                    ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
              >
                <route.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${route.active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{route.label}</span>
                {route.active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-foreground/5 space-y-4">
        <div className="px-2 space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Appearance</span>
          <ThemeToggle variant="sidebar" />
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-foreground/5 backdrop-blur-md">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-none">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground mt-1 capitalize">{user.role}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-4 h-11"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

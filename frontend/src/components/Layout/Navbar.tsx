"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Bell, Moon, Sun, Menu, Check, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/Layout/Sidebar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useSocket();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0 border-r-border bg-background">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              TaskFlow
            </span>
          </Link>
        </div>

        {/* Desktop Logo & Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              TaskFlow
            </span>
          </Link>

          {!user && (
            <nav className="flex items-center space-x-8 text-sm font-medium text-muted-foreground">
              <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="/#product" className="hover:text-foreground transition-colors">Product</Link>
              <Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
              <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {user ? (
            <>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-full">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white border-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-80 p-0 border-border bg-background shadow-2xl" align="end">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300" onClick={markAllAsRead}>
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-white/30">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`p-4 border-b border-border text-sm flex gap-3 items-start ${n.isRead ? 'opacity-50' : 'bg-foreground/[0.02]'}`}>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{n.message}</p>
                            <span className="text-xs text-muted-foreground/50">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          {!n.isRead && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-500/20" onClick={() => markAsRead(n._id)}>
                              <Check className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-white/10 overflow-hidden ring-offset-background transition-colors hover:ring-2 hover:ring-primary/50">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.profilePicture} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-60 border-border bg-background shadow-2xl" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1 py-1">
                        <p className="text-sm font-semibold leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    render={
                      <Link href="/profile" className="w-full flex items-center">Profile</Link>
                    }
                    className="hover:bg-white/5 focus:bg-white/5"
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/dashboard" className="w-full flex items-center">Dashboard</Link>
                    }
                    className="hover:bg-white/5 focus:bg-white/5"
                  />
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Log in
              </Link>
              <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

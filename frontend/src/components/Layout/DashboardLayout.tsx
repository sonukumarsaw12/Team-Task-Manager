"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { Loader2, Menu, Bell, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we are on a project detail page (e.g., /projects/123)
  const isProjectDetailPage = /^\/projects\/[a-zA-Z0-9]+/.test(pathname) && pathname.split('/').length === 3;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <Sidebar />      {/* Top Right Actions */}
      {!isProjectDetailPage && (
        <div className="fixed top-6 right-8 z-40">
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon" className="relative hover:bg-foreground/5 rounded-xl h-10 w-10 shadow-2xl backdrop-blur-md border border-foreground/5">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white border-0 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-80 p-0 border-border dark:border-white/10 bg-white/95 dark:bg-card/95 shadow-2xl backdrop-blur-3xl rounded-2xl overflow-hidden" align="end" sideOffset={10}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5">
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
                    <div key={n._id} className={`p-4 border-b border-foreground/5 text-sm flex gap-3 items-start ${n.isRead ? 'opacity-50' : 'bg-foreground/5'}`}>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-xs">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground opacity-50">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      {!n.isRead && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-500/20" onClick={() => markAsRead(n._id)}>
                          <Check className="h-3 w-3 text-blue-500" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {/* Mobile Header & Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="glass border-white/10 shadow-2xl rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0 border-r border-foreground/5 bg-background">
            <Sidebar mobile />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:px-14 md:pb-10 md:pt-28 lg:p-8 relative pt-20 lg:pt-16 bg-gradient-to-br from-blue-50 via-indigo-50/50 via-white via-purple-50/50 to-pink-50/80 dark:bg-none dark:bg-background">
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

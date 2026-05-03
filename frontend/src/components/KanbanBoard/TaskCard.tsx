"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, Clock, GripVertical, MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: any;
  onTaskSelect?: (task: any) => void;
  isOverlay?: boolean;
}

export default function TaskCard({ task, onTaskSelect, isOverlay }: TaskCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isAssignedToMe = task.assignedTo?._id === user?._id;
  const canMove = isAdmin || isAssignedToMe;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task._id,
    disabled: !canMove || !!isOverlay
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.4 : undefined,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
  const isDone = task.status === "Done";

  // Priority-based styles
  const getPriorityConfig = () => {
    switch (task.priority?.toLowerCase()) {
      case "high": return {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        strip: "bg-red-500"
      };
      case "medium": return {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        strip: "bg-amber-500"
      };
      case "low": return {
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        strip: "bg-blue-500"
      };
      default: return {
        color: "text-muted-foreground",
        bg: "bg-black/5 dark:bg-white/5",
        border: "border-black/5 dark:border-white/10",
        glow: "shadow-none",
        strip: "bg-black/15 dark:bg-white/10"
      };
    }
  };

  const priority = getPriorityConfig();

  return (
    <Card
      ref={!isOverlay ? setNodeRef : undefined}
      style={!isOverlay ? style : undefined}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
      className={cn(
        "group border transition-all duration-300 rounded-xl overflow-hidden touch-none relative",
        canMove ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        // Base styling
        "bg-white/80 dark:bg-card/40 backdrop-blur-md border-black/15 dark:border-border shadow-sm",
        priority.border,
        // Hover effects
        "hover:bg-card/60 hover:shadow-2xl hover:-translate-y-1",
        !isDragging && priority.glow,
        // Dragging state
        isDragging && "ring-2 ring-primary/50 shadow-2xl z-50 rotate-3 scale-105",
        // Overlay card (floating)
        isOverlay && "shadow-2xl shadow-black/40 border-primary/40 bg-card/90 backdrop-blur-xl rotate-3 scale-105",
        // Done state
        isDone && "opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100",
      )}
      onClick={() => onTaskSelect && onTaskSelect(task)}
    >
      <CardContent className="p-0">
        {/* Subtle top gradient based on priority */}
        <div className={cn("absolute top-0 left-0 w-full h-[2px]", priority.strip)} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                  "font-bold text-sm tracking-tight leading-tight text-foreground/90 group-hover:text-foreground transition-colors",
                  isDone && "line-through text-muted-foreground/60"
                )}>
                  {task.title}
                </h4>

                <div className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/30",
                  (isOverlay || !canMove) && "opacity-0",
                  canMove && "opacity-100"
                )}>
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>

              {task.description && (
                <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      isOverdue
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : isDone
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-black/10 dark:bg-white/5 text-muted-foreground font-bold border-black/10 dark:border-white/5"
                    )}>
                      <Clock className="h-3 w-3" />
                      {format(new Date(task.dueDate), "MMM d")}
                    </div>
                  )}

                  {task.attachments?.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-medium">
                      <Paperclip className="h-3 w-3" />
                      {task.attachments.length}
                    </div>
                  )}
                </div>

                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">
                      {task.assignedTo.name.split(' ')[0]}
                    </span>
                    <Avatar className="h-7 w-7 border-2 border-white dark:border-background shadow-md transition-transform group-hover:scale-110" title={task.assignedTo.name}>
                      <AvatarImage src={task.assignedTo.profilePicture} />
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                        {task.assignedTo.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full border border-dashed border-black/20 dark:border-white/10 flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] text-muted-foreground/40">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

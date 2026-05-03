"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";
import { Circle, Loader2, CheckCircle2, Inbox } from "lucide-react";

interface ColumnProps {
  column: { id: string; title: string; color: string };
  tasks: any[];
  onTaskSelect: (task: any) => void;
  isOver: boolean;
  isDragging: boolean;
}

export default function Column({ column, tasks, onTaskSelect, isOver, isDragging }: ColumnProps) {
  const { setNodeRef, isOver: isDirectlyOver } = useDroppable({
    id: column.id,
  });

  const isHighlighted = isOver || isDirectlyOver;

  // Color configs
  const colorConfig: Record<string, {
    border: string;
    highlight: string;
    badge: string;
    icon: string;
    glow: string;
    dotBg: string;
  }> = {
    blue: {
      border: "border-t-blue-500 dark:border-t-blue-500",
      highlight: "border-blue-500/40 bg-blue-500/[0.08] dark:bg-blue-500/[0.06] shadow-blue-500/10",
      badge: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20",
      icon: "text-blue-400",
      glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
      dotBg: "bg-blue-500",
    },
    yellow: {
      border: "border-t-amber-500 dark:border-t-amber-500",
      highlight: "border-amber-500/40 bg-amber-500/[0.08] dark:bg-amber-500/[0.06] shadow-amber-500/10",
      badge: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20",
      icon: "text-amber-400",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
      dotBg: "bg-amber-500",
    },
    green: {
      border: "border-t-emerald-500 dark:border-t-emerald-500",
      highlight: "border-emerald-500/40 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.06] shadow-emerald-500/10",
      badge: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20",
      icon: "text-emerald-400",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      dotBg: "bg-emerald-500",
    },
  };

  const colors = colorConfig[column.color] || colorConfig.blue;

  const ColumnIcon = column.id === "Done"
    ? CheckCircle2
    : column.id === "In Progress"
      ? Loader2
      : Circle;

  return (
    <div
      className={cn(
        "flex flex-col flex-1 w-full min-w-[300px] max-w-md rounded-2xl border-t-[3px] min-h-[520px] max-h-[720px] transition-all duration-300 ease-out",
        "bg-white/50 dark:bg-card/20 backdrop-blur-md shadow-lg border-x border-b border-black/10 dark:border-white/10",
        colors.border,
        // Highlight when a task is being dragged over this column
        isHighlighted && [
          colors.highlight,
          colors.glow,
          "scale-[1.01] border-t-[3px]",
        ],
        // Subtle pulse when dragging but not over this column
        isDragging && !isHighlighted && "opacity-80",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2 h-2 rounded-full", colors.dotBg, isHighlighted && "animate-pulse")} />
          <h3 className="font-bold text-[15px] tracking-tight text-foreground/80 dark:text-foreground/90">
            {column.title}
          </h3>
        </div>
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums transition-all duration-200",
          colors.badge,
          isHighlighted && "scale-110"
        )}>
          {tasks.length}
        </span>
      </div>

      {/* Task List / Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 px-3 pb-4 min-h-[200px] mx-2 mb-2 rounded-xl overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-200",
          isHighlighted && "bg-black/[0.02] dark:bg-white/[0.03]",
        )}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} onTaskSelect={onTaskSelect} />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className={cn(
            "h-full flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-8 transition-all duration-300",
            isHighlighted
              ? "border-black/20 dark:border-white/20 bg-black/[0.04] dark:bg-white/[0.04]"
              : "border-black/10 dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]"
          )}>
            <Inbox className={cn(
              "h-8 w-8 transition-all duration-200",
              isHighlighted ? "text-foreground/40 scale-110" : "text-muted-foreground/30 dark:text-muted-foreground/20"
            )} />
            <span className={cn(
              "text-xs font-medium transition-colors duration-200",
              isHighlighted ? "text-foreground/40" : "text-muted-foreground/30"
            )}>
              {isDragging ? "Drop here" : "No tasks yet"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

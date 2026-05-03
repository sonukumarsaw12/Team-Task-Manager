"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import Column from "./Column";
import TaskCard from "./TaskCard";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const COLUMNS = [
  { id: "Todo", title: "To Do", color: "blue" },
  { id: "In Progress", title: "In Progress", color: "yellow" },
  { id: "Done", title: "Done", color: "green" },
] as const;

interface BoardProps {
  projectId: string;
  tasks: any[];
  onTaskUpdate: () => void;
  onTaskSelect: (task: any) => void;
}

export default function Board({ projectId, tasks, onTaskUpdate, onTaskSelect }: BoardProps) {
  const { user } = useAuth();
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = useCallback((taskId: string) => {
    const task = localTasks.find(t => t._id === taskId);
    return task?.status || null;
  }, [localTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find(t => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const overId = over.id as string;

    // Determine target column
    let targetColumn = COLUMNS.find(c => c.id === overId)?.id || null;
    if (!targetColumn) {
      const overTask = localTasks.find(t => t._id === overId);
      if (overTask) {
        targetColumn = overTask.status;
      }
    }

    setOverColumnId(targetColumn);

    // Move task to new column optimistically during drag
    const activeId = active.id as string;
    const activeTaskData = localTasks.find(t => t._id === activeId);

    if (activeTaskData && targetColumn && activeTaskData.status !== targetColumn) {
      setLocalTasks(prev =>
        prev.map(t => t._id === activeId ? { ...t, status: targetColumn } : t)
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setOverColumnId(null);

    if (!over) {
      // Revert if dropped outside
      setLocalTasks(tasks);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine final column
    let newStatus = COLUMNS.find(c => c.id === overId)?.id;
    if (!newStatus) {
      const overTask = localTasks.find(t => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    const originalTask = tasks.find(t => t._id === activeId);
    
    // Final permission check
    const isAdmin = user?.role === 'Admin';
    const isAssignedToMe = originalTask?.assignedTo?._id === user?._id;
    
    if (!isAdmin && !isAssignedToMe) {
      setLocalTasks(tasks);
      toast.error("You are not authorized to move this task");
      return;
    }

    if (originalTask && newStatus && originalTask.status !== newStatus) {
      try {
        await api.put(`/tasks/${activeId}`, { status: newStatus });
        toast.success(`Task moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
        onTaskUpdate();
      } catch (error) {
        // Revert on error
        setLocalTasks(tasks);
        toast.error("Failed to update task status");
        console.error("Failed to update task status", error);
      }
    } else {
      // No column change, revert any optimistic updates
      setLocalTasks(tasks);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setOverColumnId(null);
    setLocalTasks(tasks);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col md:flex-row gap-5 items-stretch w-full overflow-x-auto pb-6 custom-scrollbar">
        {COLUMNS.map((col) => {
          const columnTasks = localTasks.filter(t => t.status === col.id);
          return (
            <Column
              key={col.id}
              column={col}
              tasks={columnTasks}
              onTaskSelect={onTaskSelect}
              isOver={overColumnId === col.id}
              isDragging={!!activeTask}
            />
          );
        })}
      </div>

      {/* Drag Overlay — renders the floating card while dragging */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <div className="rotate-[3deg] scale-105">
            <TaskCard task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

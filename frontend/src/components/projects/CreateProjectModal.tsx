"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Calendar as CalendarIcon,
  ChevronDown, Info, Lock, Globe,
  Check, Smile, Palette, Loader2
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  icon: z.string().default("📁"),
  color: z.string().default("#3b82f6"),
  members: z.array(z.string()).default([]),
  deadline: z.date().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  visibility: z.enum(["Private", "Team"]).default("Team"),
});

type ProjectFormValues = z.input<typeof projectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project?: any; // Add optional project prop for editing
}

const EMOJIS = ["📁", "🚀", "💡", "🎨", "🔧", "📱", "🌐", "🔒", "⚡", "🌈", "🔥", "✨", "📊", "🎯", "💻"];
const COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Slate", value: "#64748b" },
];

export default function CreateProjectModal({ open, onOpenChange, onSuccess, project }: CreateProjectModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      icon: project?.icon || "📁",
      color: project?.color || "#3b82f6",
      members: project?.members?.map((m: any) => typeof m === 'string' ? m : m._id) || [],
      priority: project?.priority || "Medium",
      visibility: project?.visibility || "Team",
      deadline: project?.deadline ? new Date(project.deadline) : undefined,
    },
    mode: "onChange",
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  useEffect(() => {
    if (open) {
      fetchUsers();
      if (project) {
        reset({
          name: project.name,
          description: project.description || "",
          icon: project.icon || "📁",
          color: project.color || "#3b82f6",
          members: project.members?.map((m: any) => typeof m === 'string' ? m : m._id) || [],
          priority: project.priority || "Medium",
          visibility: project.visibility || "Team",
          deadline: project.deadline ? new Date(project.deadline) : undefined,
        });
      } else {
        reset({
          name: "",
          description: "",
          icon: "📁",
          color: "#3b82f6",
          members: [],
          priority: "Medium",
          visibility: "Team",
          deadline: undefined,
        });
      }
    }
  }, [open, project, reset]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.map((u: any) => ({ label: u.name, value: u._id, avatar: u.profilePicture })));
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (project) {
        await api.put(`/projects/${project._id}`, data);
        toast.success("Project updated successfully");
      } else {
        await api.post("/projects", data);
        toast.success("Project created successfully");
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${project ? 'update' : 'create'} project`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white/95 dark:bg-background/80 backdrop-blur-2xl border-black/5 dark:border-white/10 shadow-2xl rounded-3xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {project ? 'Edit Project' : 'Create New Project'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                Organize your work and collaborate with your team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2 max-h-[60vh] overflow-y-auto px-2 -mx-2 custom-scrollbar">
              {/* Icon and Color Section */}
              <div className="flex items-center gap-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all duration-300 group"
                  style={{ backgroundColor: `${selectedColor}20`, border: `2px solid ${selectedColor}40` }}
                >
                  <span className="group-hover:scale-110 transition-transform">{selectedIcon}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                          <Smile className="h-4 w-4" /> Pick Icon
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2" align="start">
                        <div className="grid grid-cols-5 gap-1">
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setValue("icon", emoji)}
                              className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-xl",
                                selectedIcon === emoji && "bg-muted ring-2 ring-primary/20"
                              )}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                          <Palette className="h-4 w-4" /> Custom Color
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="start">
                        <div className="grid grid-cols-3 gap-2">
                          {COLORS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setValue("color", color.value)}
                              className={cn(
                                "h-8 w-full rounded-md transition-all flex items-center justify-center",
                                selectedColor === color.value ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-105"
                              )}
                              style={{ backgroundColor: color.value }}
                            >
                              {selectedColor === color.value && <Check className="h-4 w-4 text-white" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

               <Separator className="bg-black/5 dark:bg-white/5" />

              {/* Name and Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Project Name</Label>
                   <Input
                    id="name"
                    placeholder="e.g. Website Redesign"
                    {...register("name")}
                    autoFocus
                    className="bg-black/[0.03] dark:bg-background/50 border-black/10 dark:border-white/10 focus:border-primary/40 dark:focus:border-white/20 focus:ring-4 focus:ring-primary/5 h-11 transition-all rounded-xl placeholder:text-muted-foreground/40"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                   <Textarea
                    id="description"
                    placeholder="Describe the project goals..."
                    {...register("description")}
                    className="bg-black/[0.03] dark:bg-background/50 border-black/10 dark:border-white/10 focus:border-primary/40 dark:focus:border-white/20 focus:ring-4 focus:ring-primary/5 min-h-[100px] resize-none transition-all rounded-xl placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              {/* Multi-Select and Date */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Team Members</Label>
                  <Controller
                    name="members"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        options={users}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select members..."
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        {["Low", "Medium", "High"].map((priority) => (
                          <Button
                            key={priority}
                            type="button"
                            variant={field.value === priority ? "default" : "outline"}
                            onClick={() => field.onChange(priority)}
                            className={cn(
                              "flex-1 h-11 transition-all duration-200",
                              field.value === priority && priority === "Low" && "bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                              field.value === priority && priority === "Medium" && "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent shadow-[0_0_8px_rgba(234,179,8,0.4)]",
                              field.value === priority && priority === "High" && "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                               field.value !== priority && "bg-black/[0.03] dark:bg-background/50 border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/5"
                             )}
                           >
                            <div className={cn(
                              "w-2 h-2 rounded-full mr-2",
                              priority === "Low" && "bg-blue-500",
                              priority === "Medium" && "bg-yellow-500",
                              priority === "High" && "bg-red-500",
                              field.value === priority && "bg-white"
                            )} />
                            {priority}
                          </Button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Visibility</Label>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                         <Button
                          type="button"
                          variant={field.value === "Team" ? "default" : "outline"}
                          onClick={() => field.onChange("Team")}
                          className={cn(
                            "flex-1 h-11 gap-2 transition-all rounded-xl",
                            field.value === "Team" 
                              ? "bg-primary text-primary-foreground shadow-lg dark:shadow-none" 
                              : "bg-black/[0.03] dark:bg-background/50 border-black/5 dark:border-white/10"
                          )}
                        >
                          <Globe className="h-4 w-4" /> Team
                        </Button>
                         <Button
                          type="button"
                          variant={field.value === "Private" ? "default" : "outline"}
                          onClick={() => field.onChange("Private")}
                          className={cn(
                            "flex-1 h-11 gap-2 transition-all rounded-xl",
                            field.value === "Private" 
                              ? "bg-primary text-primary-foreground shadow-lg dark:shadow-none" 
                              : "bg-black/[0.03] dark:bg-background/50 border-black/5 dark:border-white/10"
                          )}
                        >
                          <Lock className="h-4 w-4" /> Private
                        </Button>
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Deadline</Label>
                  <Controller
                    name="deadline"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                           <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-black/[0.03] dark:bg-background/50 border-black/5 dark:border-white/10 h-11 focus:ring-4 focus:ring-primary/5 focus:border-primary/40 dark:focus:border-white/20 rounded-xl transition-all",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

           <DialogFooter className="p-6 bg-black/[0.02] dark:bg-white/5 border-t border-black/5 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
               className="hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
             <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 font-bold transition-all px-8 shadow-xl dark:shadow-none rounded-xl h-11"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {project ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                project ? "Update Project" : "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

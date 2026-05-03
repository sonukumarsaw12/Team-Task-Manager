"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Board from "@/components/KanbanBoard/Board";
import TaskModal from "@/components/TaskModal";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Settings, Users, Trash2, Calendar, CheckCircle2, Circle, Clock, Activity, MoreVertical, FolderKanban, BarChart2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export default function ProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "unassigned", dueDate: "" });

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${params.id}`),
        api.get(`/tasks?projectId=${params.id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Not authorized to view this project");
        router.push("/projects");
      }
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [params.id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        projectId: params.id,
        assignedTo: newTask.assignedTo === "unassigned" ? null : newTask.assignedTo
      };
      await api.post('/tasks', taskData);
      toast.success("Task created");
      setIsNewTaskOpen(false);
      setNewTask({ title: "", description: "", assignedTo: "unassigned", dueDate: "" });
      fetchProjectAndTasks();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${params.id}`);
      toast.success("Project deleted successfully");
      router.push("/projects");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getProgressColor = (pct: number) => {
    if (pct < 30) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (pct < 70) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    if (pct < 100) return "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]";
    return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );
  if (!project) return <DashboardLayout><p className="text-center mt-20 text-muted-foreground">Project not found</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-start gap-4 flex-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-white/5 mt-1" asChild>
              <Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm shrink-0">
                  {project.icon || "📁"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{project.name}</h2>
                {project.priority && (
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase tracking-wider font-bold py-0 h-5 border-transparent",
                    project.priority === 'High' ? "text-red-400 bg-red-500/10" :
                      project.priority === 'Medium' ? "text-yellow-400 bg-yellow-500/10" :
                        "text-blue-400 bg-blue-500/10"
                  )}>
                    {project.priority}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed mb-4 line-clamp-2 sm:line-clamp-none">
                {project.description || "No description provided for this project."}
              </p>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider opacity-50">Team</span>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 5).map((member: any) => (
                      <Avatar key={member._id} title={member.name} className="h-7 w-7 border-2 border-background cursor-help shadow-lg">
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback className="text-[9px] bg-muted font-bold">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 5 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-bold">
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="opacity-70">Due</span> {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {user?.role === 'Admin' && (
              <>
                <Button 
                  onClick={() => setIsNewTaskOpen(true)} 
                  className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Add Task
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center h-11 w-11 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm">
                    <MoreVertical className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-border p-1.5 rounded-2xl shadow-2xl">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-xl h-10 font-medium">
                      <Settings className="mr-3 h-4 w-4" /> Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-xl h-10 font-medium">
                      <Users className="mr-3 h-4 w-4" /> Manage Members
                    </DropdownMenuItem>
                    <div className="h-px bg-foreground/5 my-1.5" />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 focus:bg-red-500/10 rounded-xl h-10 font-medium"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="mr-3 h-4 w-4" /> Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* 1. Project Stats — Horizontal row */}
        <div className="bg-white/70 dark:bg-card/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h3 className="font-bold text-lg flex items-center gap-2 shrink-0">
              <BarChart2 className="h-5 w-5 text-primary" /> Project Stats
            </h3>

            <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
              {/* Progress bar */}
              <div className="w-full md:flex-1 min-w-[200px]">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span className="text-muted-foreground/60">Overall Progress</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-black/5 dark:border-none">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", getProgressColor(progress))}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stat chips */}
               <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="bg-black/[0.03] dark:bg-white/5 rounded-2xl px-5 py-3.5 border border-black/5 dark:border-white/5 flex flex-col gap-1 shadow-sm group hover:bg-white dark:hover:bg-white/10 transition-all duration-300 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Tasks</span>
                  </div>
                  <div className="text-xl font-black">{totalTasks}</div>
                </div>
                <div className="bg-black/[0.03] dark:bg-white/5 rounded-2xl px-5 py-3.5 border border-black/5 dark:border-white/5 flex flex-col gap-1 shadow-sm group hover:bg-white dark:hover:bg-white/10 transition-all duration-300 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Done</span>
                  </div>
                  <div className="text-xl font-black">{completedTasks}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Kanban Board — Full width */}
        <div className="bg-black/5 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 p-4 backdrop-blur-sm">
          <Board
            projectId={project._id}
            tasks={tasks}
            onTaskUpdate={fetchProjectAndTasks}
            onTaskSelect={setSelectedTask}
          />
        </div>

        {/* 3. Recent Activity — Full width */}
        <div className="bg-white/70 dark:bg-card/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Recent Activity
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/5">
                  <th className="pb-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold">User</th>
                  <th className="pb-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold">Activity</th>
                  <th className="pb-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/5">
                {tasks.slice(0, 10).map((task, i) => (
                  <tr key={i} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-black/15 dark:border-white/10 shadow-sm">
                          <AvatarImage src={task.createdBy?.profilePicture} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {task.createdBy?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-foreground/90">{task.createdBy?.name || 'Someone'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                          task.status === 'Done' ? "bg-green-500/10" :
                            task.status === 'In Progress' ? "bg-yellow-500/10" :
                              "bg-blue-500/10"
                        )}>
                          {task.status === 'Done' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : task.status === 'In Progress' ? (
                            <Clock className="h-3.5 w-3.5 text-yellow-500" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm leading-snug">
                          <span className={cn(
                            "font-bold",
                            task.status === 'Done' ? "text-green-400" :
                              task.status === 'In Progress' ? "text-yellow-400" :
                                "text-blue-400"
                          )}>
                            {task.status === 'Done' ? 'Completed ' : task.status === 'In Progress' ? 'Working on ' : 'Created '}
                          </span>
                          <span className="font-semibold text-foreground/80">"{task.title}"</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        {format(new Date(task.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </td>
                  </tr>
                ))}

                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-sm text-muted-foreground text-center py-12">
                      No recent activity recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* New Task Modal */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-background/80 backdrop-blur-xl border-black/5 dark:border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Task Title</Label>
              <Input
                required
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="bg-black/[0.03] dark:bg-background/50 border-black/10 dark:border-white/10 h-11 focus:ring-0 focus:border-black/20 dark:focus:border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add more details..."
                className="bg-black/[0.03] dark:bg-background/50 border-black/10 dark:border-white/10 min-h-[100px] focus:ring-0 focus:border-black/20 dark:focus:border-white/20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assignee</Label>
                <Select value={newTask.assignedTo} onValueChange={v => setNewTask({ ...newTask, assignedTo: v || "unassigned" })}>
                  <SelectTrigger className="bg-black/[0.03] dark:bg-background/50 border-black/10 dark:border-white/10 h-11">
                    <SelectValue>
                      {newTask.assignedTo === "unassigned"
                        ? "Unassigned"
                        : project.members.find((m: any) => m._id === newTask.assignedTo)?.name || "Unassigned"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {project.members.map((m: any) => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="bg-black/[0.03] dark:bg-background/50 border-black/10 dark:border-white/10 h-11 focus:ring-0 focus:border-black/20 dark:focus:border-white/20"
                />
              </div>
            </div>
             <Button type="submit" className="w-full h-11 font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 shadow-xl dark:shadow-none rounded-xl">
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={fetchProjectAndTasks}
        projectMembers={project.members}
        currentUserRole={user?.role || 'Member'}
      />
      {/* Project Management Modals */}
      <CreateProjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={fetchProjectAndTasks}
        project={project}
      />

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] bg-background/90 backdrop-blur-2xl border-white/10 shadow-2xl p-0 rounded-2xl overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-2">Delete Project</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{project.name}"</span>? This will permanently remove the project and all its tasks.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex gap-3 p-5 pt-0 border-t border-white/5 bg-white/[0.02]">
            <Button
              variant="outline"
              className="flex-1 h-11 bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20"
              onClick={handleDeleteProject}
              disabled={deleting}
            >
              {deleting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</span>
              ) : (
                <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete Project</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

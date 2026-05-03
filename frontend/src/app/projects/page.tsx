"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderKanban, Users, Calendar, BarChart2, Search, MoreVertical, Edit2, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "All" || project.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const totalActiveTasks = projects.reduce((sum, p) => sum + (p.totalTasks || 0) - (p.completedTasks || 0), 0);

  const getProgressColor = (pct: number) => {
    if (pct < 30) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (pct < 70) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    if (pct < 100) return "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]";
    return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 mb-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent drop-shadow-sm">
              Projects
            </h2>
            <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80">
              Manage your team projects and workspaces.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="relative group flex-1 xl:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-all duration-300 z-10" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 w-full bg-foreground/[0.03] border-foreground/10 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl backdrop-blur-md placeholder:text-muted-foreground/30 font-medium text-sm shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || "All")}>
                <SelectTrigger className="w-[130px] h-11 bg-foreground/[0.03] border-foreground/10 rounded-2xl focus:ring-4 focus:ring-primary/5 backdrop-blur-md font-medium text-sm shadow-inner">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-2xl border-border rounded-2xl">
                  <SelectItem value="All">All Priorities</SelectItem>
                  <SelectItem value="High" className="text-red-500">High Priority</SelectItem>
                  <SelectItem value="Medium" className="text-yellow-600 dark:text-yellow-400">Medium Priority</SelectItem>
                  <SelectItem value="Low" className="text-blue-600 dark:text-blue-400">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              {user?.role === 'Admin' && (
                <>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-initial h-11 px-6 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap text-sm"
                  >
                    <Plus className="mr-2 h-4 w-4 stroke-[3]" /> New Project
                  </Button>
                  <CreateProjectModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onSuccess={fetchProjects}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {!loading && projects.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-sm flex items-center gap-2 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{projects.length} Total Projects</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm flex items-center gap-2 shadow-inner">
              <BarChart2 className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{totalActiveTasks} Active Tasks</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-foreground/5 animate-pulse border border-foreground/10" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl bg-foreground/5 backdrop-blur-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <FolderKanban className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No projects yet 🚀</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Create your first project to organize tasks, collaborate with your team, and track progress.</p>
            {user?.role === 'Admin' && (
              <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Plus className="mr-2 h-5 w-5" /> Create First Project
              </Button>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground text-lg">No projects match your search criteria.</p>
            <Button variant="link" onClick={() => { setSearchQuery(""); setFilterPriority("All"); }}>Clear Filters</Button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const totalTasks = project.totalTasks || 0;
            const completedTasks = project.completedTasks || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <Card
                key={project._id}
                onClick={() => router.push(`/projects/${project._id}`)}
                className={cn(
                  "group flex flex-col cursor-pointer transition-all duration-500 overflow-hidden relative rounded-[2rem] hover:-translate-y-2",
                  "bg-white/70 dark:bg-card hover:bg-white dark:hover:bg-card/90 backdrop-blur-xl",
                  "border border-black/5 dark:border-border",
                  "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-xl dark:hover:shadow-2xl"
                )}
              >
                <div
                  className="absolute top-0 left-0 w-full h-1.5 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, ${project.color || '#3b82f6'}, transparent)` }}
                />

                {/* Subtle Background Glow */}
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                  style={{ background: project.color || '#3b82f6' }}
                />

                <CardHeader className="pb-2 pt-8 relative px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{ 
                          boxShadow: `0 8px 30px ${project.color}${process.env.NEXT_PUBLIC_THEME === 'dark' ? '30' : '20'}`, 
                          borderColor: `${project.color}40` 
                        }}
                      >
                        {project.icon || "📁"}
                      </div>
                      <div>
                        <CardTitle className="text-xl lg:text-2xl font-black group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {project.priority && (
                            <div className={cn(
                              "text-[10px] uppercase tracking-[0.2em] font-black py-1 px-2.5 rounded-lg border flex items-center gap-1.5",
                              project.priority === 'High' ? "text-red-400 border-red-500/20 bg-red-500/5" :
                                project.priority === 'Medium' ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
                                  "text-blue-400 border-blue-500/20 bg-blue-500/5"
                            )}>
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                project.priority === 'High' ? "bg-red-400" :
                                  project.priority === 'Medium' ? "bg-yellow-400" :
                                    "bg-blue-400"
                              )} />
                              {project.priority}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-foreground/5 border border-transparent hover:border-border transition-all">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-border dark:border-white/10 rounded-2xl p-1.5 shadow-2xl">
                          <DropdownMenuItem onClick={() => router.push(`/projects/${project._id}`)} className="rounded-xl h-10">
                            <FolderKanban className="mr-3 h-4 w-4" /> View Board
                          </DropdownMenuItem>
                          {user?.role === 'Admin' && (
                            <>
                              <DropdownMenuItem onClick={() => router.push(`/projects/${project._id}`)} className="rounded-xl h-10">
                                <Edit2 className="mr-3 h-4 w-4" /> Edit Project
                              </DropdownMenuItem>
                              <div className="h-px bg-foreground/5 dark:bg-white/5 my-1.5" />
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10 rounded-xl h-10"
                                onClick={() => setDeleteTarget({ id: project._id, name: project.name })}
                              >
                                <Trash2 className="mr-3 h-4 w-4" /> Delete Project
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardDescription className="line-clamp-2 mt-6 text-sm font-medium text-muted-foreground/60 leading-relaxed min-h-[40px]">
                    {project.description || "No description provided for this project."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-6 pt-2 space-y-6 px-6">
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold tracking-wider">
                      <span className="text-muted-foreground/60 flex items-center gap-2 uppercase">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {completedTasks} / {totalTasks} tasks
                      </span>
                      <span className={cn("text-sm", progress === 100 ? "text-green-600 dark:text-green-400" : "text-foreground")}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-foreground/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden border border-black/5 dark:border-white/10">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", getProgressColor(progress))}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-foreground/5 dark:border-white/5">
                    {/* Members Avatar Group */}
                    <div className="flex -space-x-3 hover:space-x-1 transition-all duration-500">
                      {project.members.slice(0, 4).map((member: any) => (
                        <Avatar key={member._id} title={member.name} className="h-9 w-9 border-2 border-white dark:border-[#0a0a0a] ring-1 ring-black/5 dark:ring-white/10 shadow-2xl transition-all hover:scale-110 hover:z-10 cursor-help">
                          <AvatarImage src={member.profilePicture} />
                          <AvatarFallback className="text-[10px] bg-secondary/50 backdrop-blur-md font-black">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 4 && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white dark:border-[#0a0a0a] ring-1 ring-black/5 dark:ring-white/10 bg-foreground/[0.03] dark:bg-white/5 backdrop-blur-md text-[11px] font-black z-0">
                          +{project.members.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    {project.deadline ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground/50 dark:text-white/40 bg-foreground/[0.03] dark:bg-white/[0.03] border border-foreground/5 dark:border-white/5 px-3 py-1.5 rounded-xl transition-colors hover:text-foreground/70 dark:hover:text-white/70 hover:bg-foreground/5 dark:hover:bg-white/5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-widest">No deadline</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px] bg-background/90 backdrop-blur-2xl border-white/10 shadow-2xl p-0 rounded-2xl overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-2">Delete Project</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>? This will permanently remove the project and all its tasks.
            </p>
          </div>
          <div className="flex gap-3 p-5 pt-0 border-t border-white/5 bg-white/[0.02]">
            <Button
              variant="outline"
              className="flex-1 h-11 bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => setDeleteTarget(null)}
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
                <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</span>
              ) : (
                <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete Project</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

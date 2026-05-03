"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FileIcon, Download, Trash2, Calendar, User, Clock, CheckCircle2, Circle, Loader2, Edit3, X, Paperclip, Upload, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  projectMembers: any[];
  currentUserRole: string;
}

export default function TaskModal({ task, isOpen, onClose, onUpdate, projectMembers, currentUserRole }: TaskModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Todo",
    assignedTo: "unassigned",
    dueDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskDeleting, setTaskDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "Todo",
        assignedTo: task.assignedTo?._id || "unassigned",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  if (!task) return null;

  const isAdmin = user?.role === 'Admin';
  const isAssignedToMe = task.assignedTo?._id === user?._id;
  const canEdit = isAdmin;
  const canUpdateStatus = isAdmin || isAssignedToMe;
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  const handleUpdate = async () => {
    try {
      const updateData = { ...formData };
      if (updateData.assignedTo === "unassigned") {
        updateData.assignedTo = null as any;
      }
      await api.put(`/tasks/${task._id}`, updateData);
      toast.success("Task updated");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("File uploaded");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUpdate();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await api.delete(`/tasks/${task._id}/attachments/${attachmentId}`);
      toast.success("Attachment removed");
      onUpdate();
    } catch (error) {
      toast.error("Failed to remove attachment");
    }
  };

  const handleDeleteTask = async () => {
    setTaskDeleting(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success("Task deleted");
      onClose();
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setTaskDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Done': return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Completed' };
      case 'In Progress': return { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'In Progress' };
      default: return { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'To Do' };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-0 rounded-2xl custom-scrollbar">
          
          {/* Header */}
          <div className="px-8 pt-7 pb-5">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="text-2xl font-bold bg-foreground/5 border-border focus:ring-0 focus:border-primary/50 h-12 rounded-xl"
                      disabled={!isAdmin}
                    />
                  ) : (
                    <DialogTitle className="text-2xl font-bold tracking-tight leading-tight">
                      {task.title}
                    </DialogTitle>
                  )}
                  
                  {!isAdmin && !isAssignedToMe && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md w-fit">
                      <ShieldAlert className="h-3 w-3" /> Read Only View
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                    <Badge variant="outline" className={cn("border font-semibold text-xs px-3 py-1", statusConfig.bg, statusConfig.color)}>
                      <StatusIcon className={cn("h-3.5 w-3.5 mr-1.5", task.status === 'In Progress' && "animate-spin")} />
                      {statusConfig.label}
                    </Badge>
                    
                    {isOverdue && (
                      <Badge variant="outline" className="text-red-400 bg-red-500/10 border-red-500/20 font-semibold text-xs px-3 py-1">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Overdue
                      </Badge>
                    )}

                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                

              </div>
            </DialogHeader>
          </div>

          <Separator className="bg-border/50" />

          {/* Body - Full width stacked layout */}
          <div className="px-8 py-6 space-y-7">
            
            {/* Details Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Status</Label>
                {isEditing ? (
                  <Select 
                    value={formData.status} 
                    onValueChange={v => setFormData({...formData, status: v || "Todo"})}
                    disabled={!canUpdateStatus}
                  >
                    <SelectTrigger className={cn(
                      "bg-foreground/5 border-border h-11 rounded-xl",
                      !canUpdateStatus && "opacity-50 cursor-not-allowed"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todo">
                        <span className="flex items-center gap-2"><Circle className="h-3 w-3 text-blue-400" /> To Do</span>
                      </SelectItem>
                      <SelectItem value="In Progress">
                        <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 text-yellow-400" /> In Progress</span>
                      </SelectItem>
                      <SelectItem value="Done">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-400" /> Done</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold", statusConfig.bg, statusConfig.color)}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Assignee</Label>
                {isEditing ? (
                  <Select 
                    value={formData.assignedTo} 
                    onValueChange={v => setFormData({...formData, assignedTo: v || "unassigned"})}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger className={cn(
                      "bg-foreground/5 border-border h-11 rounded-xl",
                      !isAdmin && "opacity-50 cursor-not-allowed"
                    )}>
                    <SelectValue>
                      {formData.assignedTo === "unassigned" 
                        ? "Unassigned" 
                        : projectMembers.find(m => m._id === formData.assignedTo)?.name || "Unassigned"}
                    </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {projectMembers.map(m => (
                        <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-foreground/5 border border-border/50 min-h-[48px]">
                    {task.assignedTo ? (
                      <>
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm shrink-0">
                          <AvatarImage src={task.assignedTo.profilePicture} />
                          <AvatarFallback className="text-[10px] bg-secondary font-bold">{task.assignedTo.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm truncate">{task.assignedTo.name}</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4 shrink-0" /> Unassigned
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Due Date</Label>
                {isEditing ? (
                  <Input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                    className="bg-foreground/5 border-border h-11 focus:ring-0 focus:border-primary/50 rounded-xl"
                    disabled={!isAdmin}
                  />
                ) : (
                  <div className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold whitespace-nowrap",
                    isOverdue ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400" : "bg-foreground/5 border-border/50 text-foreground/80"
                  )}>
                    <Calendar className="h-4 w-4 shrink-0" />
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Description</Label>
              {isEditing ? (
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows={4}
                  placeholder="Add a more detailed description..."
                  className="bg-foreground/5 border-border focus:ring-0 focus:border-primary/50 resize-none rounded-xl"
                  disabled={!isAdmin}
                />
              ) : (
                <div className="text-sm bg-foreground/[0.03] p-5 rounded-xl min-h-[80px] text-foreground/80 leading-relaxed border border-border/50">
                  {task.description || "No description provided."}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" /> Attachments
                {task.attachments?.length > 0 && (
                  <span className="text-[10px] bg-foreground/10 px-2 py-0.5 rounded-full font-bold">{task.attachments.length}</span>
                )}
              </Label>
              
              {task.attachments?.length > 0 && (
                <div className="grid gap-2">
                  {task.attachments.map((att: any) => (
                    <div key={att._id} className="flex items-center justify-between p-3 bg-foreground/[0.03] rounded-xl border border-border/50 text-sm group hover:bg-foreground/[0.06] transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <FileIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="truncate font-medium text-foreground/80">{att.filename}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={att.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-foreground/10 rounded-lg transition-colors" title="Download">
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </a>
                        {currentUserRole === 'Admin' && (
                          <button onClick={() => handleDeleteAttachment(att._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {canUpdateStatus && (
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-foreground/[0.03] border border-dashed border-border rounded-xl cursor-pointer hover:bg-foreground/[0.06] hover:border-primary/30 transition-all">
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {file ? file.name : "Choose a file to upload..."}
                    </span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      onChange={e => setFile(e.target.files?.[0] || null)} 
                      className="hidden" 
                    />
                  </label>
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={!file || uploading} 
                    size="sm"
                    className="h-11 px-5 bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground shrink-0 rounded-xl"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-border/50 bg-foreground/[0.02]">
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 sm:flex-1 whitespace-nowrap">
                <span>Created {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                <span>•</span>
                <span>Updated {task.updatedAt ? format(new Date(task.updatedAt), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
            
            <div className="flex items-center gap-2.5">
              {isEditing ? (
                <>
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline" 
                    className="h-10 px-5 bg-foreground/5 border-border hover:bg-foreground/10 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdate} 
                    className="h-10 px-6 font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg rounded-xl"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Button 
                      onClick={() => setShowDeleteConfirm(true)} 
                      variant="outline" 
                      className="h-10 px-4 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  )}
                  {canUpdateStatus && (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="h-10 px-5 bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground rounded-xl"
                    >
                      <Edit3 className="h-4 w-4 mr-2" /> {isAdmin ? "Edit Task" : "Update Status"}
                    </Button>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-2xl border-border shadow-2xl p-0 rounded-2xl overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-2">Delete Task</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{task.title}"</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 px-8 pb-8">
            <Button
              variant="outline"
              className="flex-1 h-11 bg-foreground/5 border-border hover:bg-foreground/10 rounded-xl"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={taskDeleting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 rounded-xl"
              onClick={handleDeleteTask}
              disabled={taskDeleting}
            >
              {taskDeleting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</span>
              ) : (
                <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete Task</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

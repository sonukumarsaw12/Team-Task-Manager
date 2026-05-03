"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity as ActivityIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activity');
        setActivities(res.data);
      } catch (error) {
        console.error("Failed to fetch activity logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ActivityIcon className="h-8 w-8 text-primary" /> Activity Log
          </h2>
          <p className="text-muted-foreground">Recent actions across your projects.</p>
        </div>

        <Card className="glass border-none shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-black/10 dark:border-white/5">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 text-center text-muted-foreground animate-pulse">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground italic">No activity logs found.</div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">User</th>
                      <th className="py-4 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Action</th>
                      <th className="py-4 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Task</th>
                      <th className="py-4 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Project</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 dark:divide-white/5">
                    {activities.map((log) => (
                      <tr key={log._id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-black/10 dark:border-white/10">
                              <AvatarImage src={log.userId?.profilePicture} />
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                {log.userId?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-foreground/90">{log.userId?.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-muted-foreground font-medium italic opacity-80">{log.action}</span>
                        </td>
                        <td className="py-4 px-4">
                          {log.taskId ? (
                            <span className="text-xs font-bold text-foreground/80 line-clamp-1 min-w-[120px]">
                              "{log.taskId?.title}"
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/30">---</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {log.projectId ? (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground whitespace-nowrap">
                              {log.projectId?.name}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/30">---</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <span className="text-[10px] text-muted-foreground/60 font-bold tabular-nums">
                            {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

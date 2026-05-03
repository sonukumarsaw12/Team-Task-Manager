"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, TrendingUp, Calendar, AlertCircle, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, activityRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/activity')
        ]);

        const tasks = tasksRes.data;
        const logs = activityRes.data.slice(0, 5); // Just top 5 for dashboard
        
        let total = tasks.length;
        let todo = 0, inProgress = 0, done = 0, overdue = 0;
        const now = new Date();

        tasks.forEach((task: any) => {
          if (task.status === 'Todo') todo++;
          else if (task.status === 'In Progress') inProgress++;
          else if (task.status === 'Done') done++;

          if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
            overdue++;
          }
        });

        setStats({ total, todo, inProgress, done, overdue });
        setChartData([
          { name: 'To Do', count: todo, color: '#64748b' },
          { name: 'In Progress', count: inProgress, color: '#2563eb' },
          { name: 'Done', count: done, color: '#16a34a' },
        ]);
        setActivities(logs);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="currentColor" className="text-2xl font-black tabular-nums fill-foreground">
          {value}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="currentColor" className="text-[10px] font-bold uppercase tracking-[0.2em] fill-muted-foreground/60">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={fill}
          strokeWidth={2}
          style={{ outline: 'none' }}
          className="filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500 outline-none"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 15}
          outerRadius={outerRadius + 17}
          fill={fill}
          opacity={0.3}
          style={{ outline: 'none' }}
          className="outline-none"
        />
      </g>
    );
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-8 pb-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -z-10" />
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Welcome back, <span className="text-primary font-bold">{user?.name}</span>. Here's your workspace overview.
            </p>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard 
            title="Total Tasks" 
            value={stats.total} 
            icon={<ListTodo className="h-5 w-5" />}
            description="Overall tasks assigned"
            gradient="from-blue-500/20 to-purple-500/20"
          />
          <StatsCard 
            title="In Progress" 
            value={stats.inProgress} 
            icon={<Clock className="h-5 w-5" />}
            description="Tasks currently being worked on"
            gradient="from-amber-500/20 to-orange-500/20"
            iconColor="text-amber-500"
          />
          <StatsCard 
            title="Completed" 
            value={stats.done} 
            icon={<CheckCircle2 className="h-5 w-5" />}
            description="Tasks successfully finished"
            gradient="from-emerald-500/20 to-teal-500/20"
            iconColor="text-emerald-500"
          />
          <StatsCard 
            title="Overdue" 
            value={stats.overdue} 
            icon={<AlertCircle className="h-5 w-5" />}
            description="Tasks past their deadline"
            gradient="from-rose-500/20 to-red-500/20"
            iconColor="text-rose-500"
            textColor="text-rose-500"
          />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-7">
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <Card className="glass overflow-hidden border-none shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <CardTitle className="text-xl">Tasks Overview</CardTitle>
                  <p className="text-sm text-muted-foreground">Visual breakdown of task statuses</p>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full outline-none border-none">
                  {!loading && stats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }} className="outline-none">
                      <BarChart 
                        data={chartData} 
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }} 
                        style={{ outline: 'none' }}
                        tabIndex={-1}
                        className="outline-none border-none"
                      >
                        <XAxis 
                          dataKey="name" 
                          stroke="currentColor" 
                          className="text-muted-foreground opacity-50"
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="currentColor" 
                          className="text-muted-foreground opacity-50"
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value}`} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                          contentStyle={{ 
                            backgroundColor: 'var(--card)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(10px)',
                            color: 'var(--foreground)'
                          }}
                          itemStyle={{ color: 'var(--foreground)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50} style={{ outline: 'none' }}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} className="outline-none" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : !loading && (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                      <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm">
                        <Activity className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-40">No activity data found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="glass border-none shadow-2xl h-full flex flex-col">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xl">Status Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">Percentage of tasks by status</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center pt-6 px-6">
                <div className="h-[350px] w-full relative outline-none border-none">
                  {!loading && stats.total > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }} className="outline-none">
                      <PieChart style={{ outline: 'none' }} tabIndex={-1} className="outline-none border-none">
                        <defs>
                          {chartData.map((entry, index) => (
                            <linearGradient key={`gradient-${index}`} id={`colorPie-${index}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="5%" stopColor={entry.color} stopOpacity={1}/>
                              <stop offset="95%" stopColor={entry.color} stopOpacity={0.7}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          {...({
                            activeIndex: activeIndex,
                            activeShape: renderActiveShape,
                            data: chartData,
                            cx: "50%",
                            cy: "50%",
                            innerRadius: 80,
                            outerRadius: 110,
                            paddingAngle: 10,
                            dataKey: "count",
                            stroke: "none",
                            onMouseEnter: onPieEnter,
                            animationBegin: 0,
                            animationDuration: 1500,
                            style: { outline: 'none' }
                          } as any)}
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#colorPie-${index})`}
                              className="outline-none transition-all duration-500"
                              style={{ outline: 'none' }}
                            />
                          ))}
                        </Pie>
                        <Legend 
                          verticalAlign="bottom" 
                          height={30} 
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 ml-2 hover:text-primary transition-colors cursor-default">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : !loading && (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                      <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm">
                        <TrendingUp className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-40">No stats found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function StatsCard({ title, value, icon, description, gradient, iconColor = "text-muted-foreground", textColor = "text-foreground" }: any) {
  return (
    <Card className="glass glass-hover border-none shadow-xl overflow-hidden group relative transition-all duration-500 hover:scale-[1.02]">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30 dark:opacity-40 group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-500`} />
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 line-clamp-1 shrink-0">{title}</CardTitle>
        <div className={`${iconColor} p-2.5 rounded-xl bg-background/50 backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-2 pb-6">
        <div className={`text-4xl font-black tracking-tighter ${textColor} group-hover:translate-x-1 transition-transform duration-500`}>{value}</div>
        <p className="text-[11px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-wide line-clamp-2 min-h-[2.2em] leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

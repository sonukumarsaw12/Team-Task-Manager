"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, ShieldCheck, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Member"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "Member" }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/signup", data);
      login(res.data.token, res.data);
      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-600/20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] dark:bg-blue-600/20" />
      </div>

      {/* Navbar with Logo and Theme Toggle */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-all duration-300">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            TaskFlow
          </span>
        </Link>
        <ThemeToggle />
      </nav>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <CardHeader className="space-y-2 text-center pb-2">
            <CardTitle className="text-3xl font-black tracking-tight">Join TaskFlow</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Create your workspace and start collaborating</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-6 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-11 h-12 bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                      {...register("name")}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] font-semibold text-red-500 ml-1 mt-1">
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      className="pl-11 h-12 bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                      {...register("email")}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] font-semibold text-red-500 ml-1 mt-1">
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-12 bg-background/40 border-border/40 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] font-semibold text-red-500 ml-1 mt-1">
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3 pt-2 mb-4 relative z-10">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Role</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setValue("role", "Member", { shouldValidate: true, shouldDirty: true })}
                    className={cn(
                      "flex items-center justify-center space-x-2 h-12 rounded-xl border transition-all duration-300 font-bold text-sm",
                      watch("role") === "Member"
                        ? "bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                        : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                    )}
                  >
                    <User className={cn("h-4 w-4", watch("role") === "Member" ? "text-blue-500" : "text-muted-foreground")} />
                    <span>Member</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("role", "Admin", { shouldValidate: true, shouldDirty: true })}
                    className={cn(
                      "flex items-center justify-center space-x-2 h-12 rounded-xl border transition-all duration-300 font-bold text-sm",
                      watch("role") === "Admin"
                        ? "bg-purple-500/10 border-purple-500/50 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                        : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                    )}
                  >
                    <ShieldCheck className={cn("h-4 w-4", watch("role") === "Admin" ? "text-purple-500" : "text-muted-foreground")} />
                    <span>Admin</span>
                  </button>
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-6 pt-10 pb-8">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm font-medium text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">
                  Log in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

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
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      login(res.data.token, res.data);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to log in");
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
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] dark:bg-blue-600/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-600/20" />
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
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <CardHeader className="space-y-2 text-center pb-2">
            <CardTitle className="text-3xl font-black tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Enter your credentials to access your workspace</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 pt-6 pb-4">
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
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] font-semibold text-red-500 ml-1 mt-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Forgot password?</Link>
                </div>
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
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] font-semibold text-red-500 ml-1 mt-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-6 pt-6 pb-8">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Log In <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm font-medium text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

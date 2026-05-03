"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, Layout, Users, Zap,
  BarChart3, Shield, Globe, Rocket, MousePointer2,
  Layers, ChevronRight, Star, Quote, MessageSquare, ExternalLink
} from "lucide-react";
import { motion, useScroll, useTransform, Variants, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FloatingPaths } from "@/components/ui/background-paths";
import Magnetic from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const FeatureCard = ({ icon: Icon, title, desc, color, iconColor }: any) => {
    const x = useSpring(0, { stiffness: 300, damping: 30 });
    const y = useSpring(0, { stiffness: 300, damping: 30 });

    function handleMouse(event: any) {
      const rect = event.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const xPct = (mouseX / width - 0.5) * 20;
      const yPct = (mouseY / height - 0.5) * -20;
      x.set(xPct);
      y.set(yPct);
    }

    function handleMouseLeave() {
      x.set(0);
      y.set(0);
    }

    return (
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: y, rotateY: x }}
        className="group relative rounded-[2rem] border border-border bg-foreground/[0.02] backdrop-blur-xl p-8 hover:bg-foreground/[0.04] transition-colors duration-500 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5 border border-border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner shadow-foreground/5`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <h3 className="text-xl font-black mb-3 tracking-tight text-foreground group-hover:text-blue-500 transition-colors duration-300">{title}</h3>
        <p className="text-muted-foreground leading-relaxed font-semibold text-base">{desc}</p>

        {/* Glow effect */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-pink-600/5 blur-[120px]" />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-2xl py-3"
          : "border-b border-transparent bg-transparent py-5"
      )}>
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Zap className="h-6 w-6 text-white fill-white" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tighter font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                TaskFlow
              </span>
            </Link>


          </div>

          <div className="flex items-center space-x-6">
            <ThemeToggle />
            {user ? (
              <Button className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 font-bold" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  Log in
                </Link>
                <Button className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] font-bold" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="sticky top-0 h-screen opacity-50">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="container mx-auto relative z-10 text-center space-y-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center px-4 py-1.5 rounded-full border border-border bg-foreground/5 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.02)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] text-muted-foreground text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Rocket className="h-3.5 w-3.5 mr-2 text-blue-400 group-hover:animate-bounce" />
              Built for high-performance teams
              <div className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8 select-none">
                {"Where teams deliver faster.".split(" ").map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-block mr-[0.2em] last:mr-0">
                    {word.split("").map((letter, letterIndex) => (
                      <motion.span
                        key={`${wordIndex}-${letterIndex}`}
                        initial={{ y: 80, opacity: 0, rotateX: -90 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        transition={{
                          delay: wordIndex * 0.1 + letterIndex * 0.02,
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                        }}
                        className="inline-block font-heading text-transparent bg-clip-text 
                        bg-gradient-to-b from-foreground to-foreground/70 dark:from-white dark:via-white/90 dark:to-white/30"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="max-w-[36rem] mx-auto text-base md:text-xl text-muted-foreground leading-relaxed font-semibold tracking-tight"
            >
              TaskFlow helps teams manage projects, assign tasks, and track progress in one powerful, unified workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
            >
              <Button
                className="rounded-2xl px-8 py-6 h-16 text-lg font-black bg-foreground text-background hover:bg-foreground/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all duration-500 group relative overflow-hidden"
                asChild
              >
                <Link href={user ? "/dashboard" : "/signup"} className="flex items-center">
                  <span className="relative z-10">{user ? "Go to Dashboard" : "Get Started Free"}</span>
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </Button>

              <Button variant="outline" className="h-16 px-10 text-lg rounded-2xl border-border hover:border-foreground/20 transition-all duration-500 text-foreground" asChild>
                <Link href="/login">
                  Live Demo
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>






        {/* FEATURES SECTION */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-4 space-y-20">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Powerful tools to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">deliver faster</span></h2>
              <p className="text-xl text-muted-foreground">Everything you need to manage your team effectively, without the complexity.</p>
            </div>

            <div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  icon: Layout,
                  title: "Drag & Deliver",
                  desc: "Intuitive Kanban boards designed for speed and clarity.",
                  iconColor: "text-blue-500"
                },
                {
                  icon: Zap,
                  title: "Real-time Sync",
                  desc: "Instant updates across your entire team. No refresh required.",
                  iconColor: "text-amber-500"
                },
                {
                  icon: Users,
                  title: "Smart Access",
                  desc: "Granular roles and permissions for secure collaboration.",
                  iconColor: "text-purple-500"
                },
                {
                  icon: BarChart3,
                  title: "Deep Insights",
                  desc: "Automated analytics to track velocity and project health.",
                  iconColor: "text-emerald-500"
                },
              ].map((feature, i) => (
                <FeatureCard key={i} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-32 bg-foreground/[0.01] border-y border-border">
          <div className="container mx-auto px-4 space-y-24">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">How it works</h2>
              <p className="text-xl text-muted-foreground">Three steps to a more organized team workflow.</p>
            </div>

            <div className="relative grid gap-12 md:grid-cols-3">
              {/* Connecting Lines */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50"></div>

              {[
                { step: "01", title: "Create your project", desc: "Set up your workspace, invite your team, and define your initial goals in seconds.", icon: Layers },
                { step: "02", title: "Assign tasks", desc: "Break down projects into manageable tasks and assign them to the right team members.", icon: Users },
                { step: "03", title: "Track in real-time", desc: "Monitor progress, resolve bottlenecks, and celebrate wins as they happen.", icon: Zap },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative z-10 text-center space-y-6"
                >
                  <div className="mx-auto w-24 h-24 rounded-full bg-background border-4 border-border flex items-center justify-center text-3xl font-black text-foreground shadow-xl dark:shadow-2xl relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg"></div>
                    <step.icon className="h-10 w-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shadow-lg">{step.step}</div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed max-w-[280px] mx-auto">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



      </main>

      <footer className="border-t border-border py-24 bg-foreground/[0.01]">
        <div className="container mx-auto px-4 grid gap-16 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight font-heading">TaskFlow</span>
            </Link>
            <p className="max-w-sm text-muted-foreground font-medium text-lg leading-relaxed">
              The all-in-one workspace for your team. Plan, track, and collaborate on projects with surgical precision.
            </p>
            <div className="flex space-x-5 text-muted-foreground">
              <ExternalLink className="h-6 w-6 hover:text-foreground cursor-pointer transition-colors" />
              <MessageSquare className="h-6 w-6 hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="#" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground/60 font-medium">
          <p>© {new Date().getFullYear()} TaskFlow Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <Link href="#" className="hover:text-foreground">Security</Link>
            <Link href="#" className="hover:text-foreground">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Camera, User as UserIcon, Mail, Shield, BadgeCheck, Pencil } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) {
        formData.append("profilePicture", file);
      }

      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      updateUser(res.data);
      toast.success("Profile updated successfully");
      setFile(null);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Profile Settings
          </h2>
          <p className="text-lg text-muted-foreground">Manage your identity and account security across the platform.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <Card className="lg:col-span-1 glass border-none shadow-2xl h-fit lg:sticky lg:top-24">
            <CardContent className="pt-8 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-black/10 dark:border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage src={file ? URL.createObjectURL(file) : user.profilePicture} />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-2 right-0 flex gap-2">
                  <label 
                    htmlFor="picture" 
                    className="w-10 h-10 bg-primary text-primary-foreground rounded-full border-4 border-background flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-xl z-10 hover:bg-primary/90"
                    title="Change photo"
                  >
                    <Camera className="h-4 w-4" />
                    <input 
                      id="picture" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                      }} 
                    />
                  </label>
                </div>
              </div>
              
              <div className="mt-6 space-y-1">
                <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
                <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-fit mx-auto">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{user.role}</span>
                </div>
              </div>

              <div className="w-full h-px bg-black/10 dark:bg-white/5 my-6" />
              
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <BadgeCheck className="h-4 w-4" /> Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Form */}
          <Card className="lg:col-span-2 glass border-none shadow-2xl">
            <CardHeader className="border-b border-black/10 dark:border-white/5">
              <CardTitle className="text-xl flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" /> Personal Details
              </CardTitle>
              <CardDescription className="text-muted-foreground/60">Update your name and review account information.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-primary" /> Full Name
                    </Label>
                    <div className="relative group">
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your full name"
                        className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 h-12 px-4 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all rounded-xl"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-bold flex items-center gap-2 opacity-60">
                      <Mail className="h-4 w-4 text-primary" /> Email Address
                    </Label>
                    <Input 
                      id="email" 
                      value={user.email} 
                      disabled 
                      className="bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 h-12 px-4 text-muted-foreground italic rounded-xl cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground/40 font-medium">Your email is used for login and cannot be changed.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="role" className="text-sm font-bold flex items-center gap-2 opacity-60">
                      <Shield className="h-4 w-4 text-primary" /> System Role
                    </Label>
                    <div className="h-12 px-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center text-muted-foreground font-medium italic">
                      {user.role}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || (name === user.name && !file)}
                    className="w-full sm:w-auto h-12 px-10 font-bold bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 transition-all active:scale-[0.98] rounded-xl"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</span>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

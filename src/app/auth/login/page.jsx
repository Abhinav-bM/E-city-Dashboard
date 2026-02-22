"use client";
import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Logged in successfully!");
        router.push("/");
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1116] p-4 font-inter transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/20 mb-6 group hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-4xl group-hover:rotate-12 transition-transform">
              devices
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            E-City Dash
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Enter your credentials to access the admin panel
          </p>
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-500 delay-200">
          <Card className="shadow-2xl border-slate-200 dark:border-surface-border backdrop-blur-sm bg-white/90 dark:bg-surface-dark/95">
            <form onSubmit={handleLogin} className="space-y-6 pt-2">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@ecity.com"
                icon="mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all"
              />
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon="lock"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-primary text-xs font-bold hover:underline transition-all"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 shadow-lg shadow-primary/30"
                size="lg"
                disabled={isLoading}
                icon={isLoading ? "sync" : "login"}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    Authenticating...
                  </span>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need help accessing your account?{" "}
            <button className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
              Contact Admin
            </button>
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-600">
            <span>© 2026 E-City Inc.</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800"></span>
            <a
              href="#"
              className="hover:text-slate-600 dark:hover:text-slate-400"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

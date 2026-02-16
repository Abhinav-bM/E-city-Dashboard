"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMe = useCallback(async () => {
    try {
      const data = await authService.getMe();
      setAdmin(data);
    } catch (error) {
      console.error("Failed to fetch admin:", error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial CSRF setup and session check
    const initAuth = async () => {
      // Don't run session check on the login page itself
      if (pathname.includes("/auth/login")) {
        setIsLoading(false);
        return;
      }

      try {
        await authService.getCsrf();
        await fetchMe();
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsLoading(false);
      }
    };
    initAuth();
  }, [fetchMe, pathname]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Step 1: Ensure we have a CSRF token
      await authService.getCsrf();
      // Step 2: Login
      const data = await authService.login(email, password);
      // Step 3: Fetch full profile
      setAdmin(data.admin || data); // Store admin data
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error?.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAdmin(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

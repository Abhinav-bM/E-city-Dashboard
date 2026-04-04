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

  const fetchMe = useCallback(async (options = {}) => {
    try {
      const data = await authService.getMe(options);
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
      try {
        // Step 0: Ensure we have a CSRF token (Interceptor handles header)
        // This is REQUIRED even on the login page for the login POST to work.
        await authService.getCsrf();

        // Step 1: Only fetch profile if NOT on the login page
        if (!pathname.includes("/auth/login")) {
          await fetchMe({ _noRedirect: true });
        } else {
          setIsLoading(false);
        }
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
      // Login (Interceptor automatically captures new CSRF token from response)
      const data = await authService.login(email, password);
      setAdmin(data.admin || data);
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

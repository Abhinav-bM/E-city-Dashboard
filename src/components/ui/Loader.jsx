import React from "react";
import { Loader2 } from "lucide-react";

// 1. Full Page Loader (Initial Route Loading)
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

// 2. Section Loader (Overlay for specific forms/sections)
export const SectionLoader = ({ message = "Processing..." }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-[1px] rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {message}
        </span>
      </div>
    </div>
  );
};

// 3. Inline Spinner (For buttons or small areas)
export const Spinner = ({ size = "sm", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={`animate-spin text-current ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    />
  );
};

// 4. Skeleton Loader (Placeholder for data)
export const Skeleton = ({ className = "", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
        />
      ))}
    </>
  );
};

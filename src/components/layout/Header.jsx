"use client";
import React from "react";

import { useTheme } from "@/context/ThemeContext";
import Tooltip from "../ui/Tooltip";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border-dark bg-background-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            search
          </span>
          <input
            className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-none text-slate-900 dark:text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-primary text-sm transition-colors"
            placeholder="Search orders, products, or customers..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Tooltip content="Notifications" position="bottom">
          <button className="relative p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </Tooltip>

        <Tooltip
          content={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
          position="bottom"
        >
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark"
          >
            <span className="material-symbols-outlined fill-current">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default Header;

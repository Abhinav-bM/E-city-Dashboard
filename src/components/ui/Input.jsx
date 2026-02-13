import React from "react";

const Input = ({ label, error, icon, className = "", ...props }) => {
  return (
    <div className={`block ${className}`}>
      {label && (
        <div className="flex items-center gap-1 mb-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-text-secondary block">
            {label}
          </label>
          {/* Optional: Add help icon here via a prop later if needed, but for now keeping it simple */}
        </div>
      )}
      <div className="relative">
        <input
          className={`w-full bg-slate-50 dark:bg-[#111a22] border ${
            error
              ? "border-red-500"
              : "border-slate-300 dark:border-surface-border"
          } rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 dark:placeholder-gray-600 outline-none transition-all ${
            icon ? "pl-10" : ""
          }`}
          {...props}
        />
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            {icon}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;

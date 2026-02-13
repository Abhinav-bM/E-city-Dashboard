import React from "react";

const buttonbaseStyle =
  "inline-flex items-center justify-center rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const customVariants = {
  primary:
    "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 focus:ring-primary",
  secondary:
    "bg-white dark:bg-surface-dark border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-400",
  outline:
    "border border-slate-300 dark:border-surface-border text-slate-700 dark:text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5",
  ghost:
    "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
  success:
    "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base font-bold",
  icon: "p-2",
};

const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  icon,
  ...props
}) => {
  return (
    <button
      className={`${buttonbaseStyle} ${customVariants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined mr-2 text-[18px]">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;

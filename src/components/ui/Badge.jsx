import React from "react";

const variants = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  danger: "bg-red-500/10 text-red-500 border-red-500/20",
  neutral: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const Badge = ({ variant = "primary", children, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

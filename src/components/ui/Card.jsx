import React from "react";

const Card = ({ title, icon, action, children, className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-border p-6 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-6">
          {title && (
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {icon && (
                <span className="material-symbols-outlined text-primary">
                  {icon}
                </span>
              )}
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

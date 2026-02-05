"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md", // sm, md, lg, xl, full
  closeOnOverlayClick = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // Match animation duration
  };

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen && !isClosing) return null;

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-[95vw]",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isOpen && !isClosing ? "opacity-100" : "opacity-0"}`}
        onClick={closeOnOverlayClick ? handleClose : undefined}
      />

      {/* Modal Card */}
      <div
        className={`bg-white dark:bg-surface-dark w-full ${sizeClasses[size] || sizeClasses.md} rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 transform ${isOpen && !isClosing ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border-dark shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {/* Footer (Optional) */}
        {footer && (
          <div className="p-4 border-t border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-white/5 shrink-0 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

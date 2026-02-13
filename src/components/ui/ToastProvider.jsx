"use client";

import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "8px",
        },
        success: {
          style: {
            background: "#10B981",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        },
        error: {
          style: {
            background: "#EF4444",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        },
      }}
    />
  );
};

export default ToastProvider;

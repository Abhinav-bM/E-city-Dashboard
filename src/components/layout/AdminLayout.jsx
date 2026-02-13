import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = ({ children }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen overflow-hidden flex selection:bg-primary selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

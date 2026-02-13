"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Tooltip from "../ui/Tooltip";

const SidebarItem = ({ icon, label, href, active, collapsed, subItems }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  const isSubItemActive =
    hasSubItems && subItems.some((item) => pathname === item.href);

  // Auto-expand if child is active
  React.useEffect(() => {
    if (isSubItemActive) setIsOpen(true);
  }, [isSubItemActive]);

  const content = (
    <div className="flex flex-col">
      <Link
        href={hasSubItems ? "#" : href}
        onClick={(e) => {
          if (hasSubItems) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
          active || (hasSubItems && isSubItemActive)
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:text-white dark:hover:bg-surface-dark"
        } ${collapsed ? "justify-center" : ""}`}
      >
        <span
          className={`material-symbols-outlined ${active || (hasSubItems && isSubItemActive) ? "filled" : ""} text-2xl shrink-0`}
        >
          {icon}
        </span>
        {!collapsed && (
          <>
            <span className="text-sm font-medium whitespace-nowrap animate-in fade-in duration-300 flex-1">
              {label}
            </span>
            {hasSubItems && (
              <span
                className={`material-symbols-outlined text-lg transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            )}
          </>
        )}
      </Link>

      {/* Sub Items */}
      {!collapsed && hasSubItems && isOpen && (
        <div className="ml-10 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-border-dark pl-2 animate-in slide-in-from-top-2 duration-200">
          {subItems.map((sub, idx) => (
            <Link
              key={idx}
              href={sub.href}
              className={`block px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                pathname === sub.href
                  ? "text-primary bg-primary/5"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return collapsed ? (
    <Tooltip content={label} position="right">
      {content}
    </Tooltip>
  ) : (
    content
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Listen to window location for active state in sub-items (simple workaround for now)
  // In a real app, usePathname is sufficient usually.

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-background-dark border-r border-slate-200 dark:border-border-dark flex-col hidden md:flex h-full shrink-0 transition-all duration-300 ease-in-out`}
    >
      <div
        className={`p-6 flex items-center ${collapsed ? "justify-center" : "gap-3"} transition-all`}
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          <span className="material-symbols-outlined text-white text-2xl">
            devices
          </span>
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden animate-in fade-in duration-300">
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-wide whitespace-nowrap">
              E-City
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
        <SidebarItem
          icon="dashboard"
          label="Dashboard"
          href="/"
          active={pathname === "/"}
          collapsed={collapsed}
        />

        <SidebarItem
          icon="inventory_2"
          label="Products"
          href="#"
          active={pathname.includes("/products")}
          collapsed={collapsed}
          subItems={[
            { label: "All Products", href: "/products" },
            { label: "Add New Product", href: "/products/add-product" },
            { label: "Categories", href: "/categories" },
          ]}
        />

        <SidebarItem
          icon="shopping_cart"
          label="Orders"
          href="/sales"
          active={pathname.includes("/sales")}
          collapsed={collapsed}
        />
        <SidebarItem
          icon="campaign"
          label="Marketing"
          href="/marketing"
          active={pathname.includes("/marketing")}
          collapsed={collapsed}
        />
        <SidebarItem
          icon="group"
          label="Customers"
          href="/users"
          active={pathname.includes("/users")}
          collapsed={collapsed}
        />

        <div className={`pt-4 pb-2 ${collapsed ? "text-center" : ""}`}>
          {collapsed ? (
            <div className="h-px w-8 bg-slate-200 dark:bg-border-dark mx-auto my-2"></div>
          ) : (
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider animate-in fade-in duration-300">
              System
            </p>
          )}
        </div>

        <SidebarItem
          icon="home" // Using a Material Symbols icon name for consistency
          label="Home Page"
          href="/home-content"
          active={pathname.includes("/home-content")}
          collapsed={collapsed}
        />
        <SidebarItem
          icon="settings"
          label="Settings"
          href="/settings"
          active={pathname.includes("/settings")}
          collapsed={collapsed}
        />
        <SidebarItem
          icon="help"
          label="Help Center"
          href="/help"
          active={pathname.includes("/help")}
          collapsed={collapsed}
        />
      </nav>

      {/* Collapse Toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">
            {collapsed ? "last_page" : "first_page"}
          </span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-border-dark">
        <div
          className={`flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-border-dark ${collapsed ? "justify-center" : ""}`}
        >
          <div
            className="h-8 w-8 rounded-full bg-center bg-cover border border-slate-300 dark:border-slate-600 shrink-0"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCAD1MzsiUFWqnFr6dM0U7Dwn3GRxgcdxrv_jgbTxpDFVEX1tSGOPnPBT5GmADRBc6ljp49EBp_5E_B9qzR_oXAhcl2hHw2nounqDBmidGf5eKS4t_n68AhX4m6rl2EzB0g33Y_xmBFNZYutUbZPp9ohNIyYOJOJreJ4AG0QJyUVKUBhn8aznRruyGv4sWOoi8dESXC2FyaDXqg1TmE7nlwecRbOqMAe2_aZo80EihkUhGIsVteuuWp3UVZFrr1MzxtxSXL3g5XkFw')",
            }}
          ></div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
              <p className="text-slate-900 dark:text-white text-sm font-medium truncate">
                Admin User
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                admin@ecity.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

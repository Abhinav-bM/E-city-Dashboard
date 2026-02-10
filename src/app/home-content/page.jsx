"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import FeaturedCategories from "@/components/home-content/FeaturedCategories";
import FeaturedProducts from "@/components/home-content/FeaturedProducts";

const HomeContentManager = () => {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <AdminLayout title="Home Page Manager">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[600px]">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === "categories"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Featured Categories
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === "products"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Featured Products
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === "banners"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Banners (Coming Soon)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "categories" && <FeaturedCategories />}
          {activeTab === "products" && <FeaturedProducts />}
          {activeTab === "banners" && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">
                construction
              </span>
              <p>Banner management module is under development.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomeContentManager;

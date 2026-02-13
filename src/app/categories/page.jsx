"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import CategoryModal from "@/components/category/CategoryModal";
import categoryService from "@/services/categoryService";
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  Edit,
  Folder,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Tv,
  Monitor,
  Speaker,
  Tablet,
  Camera,
  Gamepad,
} from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/Loader";

// Dynamic Icon Helper
const getCategoryIcon = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("phone")) return <Smartphone size={20} />;
  if (lowerName.includes("android")) return <Smartphone size={20} />;
  if (lowerName.includes("ios")) return <Smartphone size={20} />;
  if (lowerName.includes("laptop")) return <Laptop size={20} />;
  if (lowerName.includes("computer")) return <Monitor size={20} />;
  if (lowerName.includes("headphone") || lowerName.includes("audio"))
    return <Headphones size={20} />;
  if (lowerName.includes("watch") || lowerName.includes("wearable"))
    return <Watch size={20} />;
  if (lowerName.includes("tv") || lowerName.includes("vision"))
    return <Tv size={20} />;
  if (lowerName.includes("camera")) return <Camera size={20} />;
  if (lowerName.includes("game") || lowerName.includes("console"))
    return <Gamepad size={20} />;
  if (lowerName.includes("speaker")) return <Speaker size={20} />;
  if (lowerName.includes("tablet") || lowerName.includes("ipad"))
    return <Tablet size={20} />;

  return <Folder size={20} />;
};

// Recursive Category Row Component
const CategoryRow = ({ category, level = 0, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  // Calculate indentation
  const paddingLeft = `${level * 24 + 16}px`;

  return (
    <>
      <div className="group flex items-center border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        {/* Category Name Column */}
        <div
          className="flex-1 flex items-center py-3 pr-4"
          style={{ paddingLeft }}
        >
          {/* Expand Toggle */}
          <button
            className={`mr-2 h-6 w-6 flex items-center justify-center rounded text-slate-400 hover:text-primary transition-colors ${
              hasChildren ? "" : "invisible"
            }`}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight
              size={18}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>

          {/* Icon - Logic: Show image if available, else Dynamic Icon */}
          <div
            className={`mr-3 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${category.image ? "" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              getCategoryIcon(category.name)
            )}
          </div>

          <span
            className={`font-medium text-sm ${!category.isActive ? "text-slate-400 decoration-slate-400" : "text-slate-700 dark:text-slate-200"}`}
          >
            {category.name}
          </span>
        </div>

        {/* Products Count Column */}
        <div className="w-32 py-3 px-4 flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {category.productCount || 0} items
          </span>
        </div>

        {/* Status Column */}
        <div className="w-32 py-3 px-4 flex items-center">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              category.isActive
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${category.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
            ></span>
            {category.isActive ? "Active" : "Draft"}
          </span>
        </div>

        {/* Actions Column */}
        <div className="w-32 py-3 px-4 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Edit" position="top">
            <button
              className="p-1.5 text-slate-400 hover:text-white hover:bg-primary rounded-md transition-colors"
              onClick={() => onEdit(category)}
            >
              <Edit size={16} />
            </button>
          </Tooltip>

          {/* Toggle Status Switch-like Button */}
          <Tooltip
            content={category.isActive ? "Deactivate" : "Activate"}
            position="top"
          >
            <button
              className={`w-9 h-5 rounded-full relative transition-colors p-0.5 ${category.isActive ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}`}
              onClick={() => onDelete(category)}
            >
              <div
                className={`h-4 w-4 bg-white rounded-full transition-transform ${category.isActive ? "translate-x-4" : "translate-x-0"}`}
              ></div>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && expanded && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {category.children.map((child) => (
            <CategoryRow
              key={child._id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (category) => {
    const action = category.isActive ? "disable" : "enable";
    const newStatus = !category.isActive;

    // Optimistic Update
    // Note: Since tree structure is complex to update optimally, we might just fetch refresh for simplicity
    // or implement a deep update helper. For now, let's refresh.
    try {
      await categoryService.delete(category._id);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action}`);
    }
  };

  // Simple filter for search functionality (Flattens tree for search or just filters top level?
  // Searching trees is tricky. Let's filter top level for now or implementing a deep search later.
  // Or better: Filter visually. If a parent matches, show it. If a child matches, show parent + child.)
  // For MVP: We will filter visible top-level categories if they match or if they have matching children.

  const filterCategories = (cats, query) => {
    if (!query) return cats;
    return cats.reduce((acc, cat) => {
      const matchesName = cat.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = cat.children
        ? filterCategories(cat.children, query)
        : [];

      if (matchesName || filteredChildren.length > 0) {
        acc.push({ ...cat, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredCategories = filterCategories(categories, searchQuery);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
          Categories
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Manage and organize your product hierarchy tree.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export
          </button>
          <Button
            variant="primary"
            icon="add"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Table-like Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="flex-1 pl-4">Category Name</div>
          <div className="w-32 px-4">Products</div>
          <div className="w-32 px-4">Status</div>
          <div className="w-32 px-4 text-right">Actions</div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" count={5} />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                folder_off
              </span>
              <p>No categories found.</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <CategoryRow
                key={cat._id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleToggleStatus}
              />
            ))
          )}
        </div>

        {/* Footer / Pagination Placeholder */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              1
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {filteredCategories.length}
            </span>{" "}
            results
          </div>
          <div className="flex gap-2">
            <button
              disabled
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 opacity-50 cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 opacity-50 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCategories();
        }}
        category={editingCategory}
        categories={categories}
      />
    </AdminLayout>
  );
}

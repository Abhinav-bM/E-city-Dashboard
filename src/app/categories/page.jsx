"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import axios from "axios";
import CategoryModal from "@/components/category/CategoryModal";

// Recursive Category Item Component
const CategoryItem = ({ category, level = 0, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-2 hover:bg-slate-50 dark:hover:bg-surface-dark/50 rounded-lg transition-colors group ${
          level > 0
            ? "ml-6 border-l border-slate-200 dark:border-border-dark pl-3"
            : ""
        } ${!category.isActive ? "opacity-50 grayscale" : ""}`}
      >
        {/* Expand Toggle */}
        <button
          className={`h-6 w-6 flex items-center justify-center rounded text-slate-400 hover:text-primary transition-colors ${
            hasChildren ? "" : "invisible"
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            expand_more
          </span>
        </button>

        {/* Name & Icon */}
        <span
          className={`material-symbols-outlined text-[20px] ${!category.isActive ? "text-slate-300" : "text-slate-400"}`}
        >
          {hasChildren ? "folder" : "folder_open"}
        </span>
        <span
          className={`text-sm font-medium flex-1 ${!category.isActive ? "text-slate-400 italic line-through decoration-slate-300" : "text-slate-700 dark:text-slate-200"}`}
        >
          {category.name} {!category.isActive && "(Disabled)"}
        </span>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Edit Category" position="top">
            <button
              className="p-1 text-slate-400 hover:text-primary transition-colors"
              onClick={() => onEdit(category)}
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>
            </button>
          </Tooltip>

          <Tooltip
            content={category.isActive ? "Disable Category" : "Enable Category"}
            position="top"
          >
            <button
              className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
              onClick={() => onDelete(category)}
            >
              <span className="material-symbols-outlined text-[18px]">
                {category.isActive ? "block" : "check_circle"}
              </span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && expanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {category.children.map((child) => (
            <CategoryItem
              key={child._id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/category/get",
      );
      if (data.success) {
        setCategories(data.data);
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
    if (window.confirm(`Are you sure you want to ${action} this category?`)) {
      try {
        await axios.delete(
          `http://localhost:5000/api/category/delete/${category._id}`,
        );
        fetchCategories(); // Refresh
      } catch (error) {
        alert(error.response?.data?.message || `Failed to ${action}`);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
            Categories
          </h1>
          <p className="text-slate-500 dark:text-text-secondary">
            Manage your product hierarchy.
          </p>
        </div>
        <div className="flex gap-3">
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

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-4 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="w-full h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
            <span className="material-symbols-outlined text-4xl mb-2">
              folder_off
            </span>
            <p>No categories found. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <CategoryItem
                key={cat._id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCategories();
        }}
        category={editingCategory}
        categories={categories} // Pass entire tree for parent selection
      />
    </AdminLayout>
  );
}

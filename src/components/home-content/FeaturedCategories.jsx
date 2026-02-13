"use client";
import React, { useState, useEffect } from "react";
import categoryService from "@/services/categoryService";
import { toast } from "react-hot-toast";

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      if (res.success) {
        // Flatten the tree to listed items if possible or just show top level?
        // The API returns a tree.
        // For simplicity in "Featured", we might only want to feature top-level or specific sub-cats.
        // Let's flatten for the list view or handle the tree appropriately.
        // Or just display top level first.
        // Actually, the user might want to feature ANY category.
        // Let's traverse and flatten for a unified list with breadcrumbs.
        const flatList = flattenCategories(res.data);
        setCategories(flatList);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const flattenCategories = (nodes, parentName = "") => {
    let result = [];
    for (const node of nodes) {
      const currentName = parentName
        ? `${parentName} > ${node.name}`
        : node.name;
      result.push({ ...node, displayName: currentName });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenCategories(node.children, currentName));
      }
    }
    return result;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleFeatured = async (category) => {
    // Optimistic update
    const originalCategories = [...categories];
    const updatedCategories = categories.map((cat) =>
      cat._id === category._id ? { ...cat, isFeatured: !cat.isFeatured } : cat,
    );
    setCategories(updatedCategories);

    try {
      await categoryService.update(category._id, {
        isFeatured: !category.isFeatured,
      });
      toast.success(
        `${category.name} ${!category.isFeatured ? "featured" : "unfeatured"}`,
      );
    } catch (err) {
      // Revert
      setCategories(originalCategories);
      toast.error("Failed to update status");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading categories...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Featured Categories
        </h2>
        <p className="text-sm text-slate-500">
          Select categories to display in the "Shop by Category" section on the
          Home Page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className={`
              flex items-center justify-between p-4 rounded-lg border transition-all
              ${
                cat.isFeatured
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
              }
            `}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${cat.image ? "" : "bg-slate-100 dark:bg-slate-800"}`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <span className="material-symbols-outlined text-slate-400">
                    category
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3
                  className="text-sm font-medium text-slate-800 dark:text-white truncate"
                  title={cat.displayName}
                >
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {cat.displayName}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-2">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!cat.isFeatured}
                onChange={() => toggleFeatured(cat)}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategories;

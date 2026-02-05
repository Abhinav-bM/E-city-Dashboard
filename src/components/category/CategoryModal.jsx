import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SearchableSelect from "@/components/ui/SearchableSelect";
import axios from "axios";

const CategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  category,
  categories,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        parentId: category.parentId || "",
        description: category.description || "",
      });
    } else {
      setFormData({
        name: "",
        parentId: "",
        description: "",
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Frontend Validation
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }
    if (category && formData.parentId === category._id) {
      alert("A category cannot be its own parent");
      return;
    }

    try {
      const url = category
        ? `http://localhost:5000/api/category/update/${category._id}`
        : "http://localhost:5000/api/category/create";

      const method = category ? "put" : "post";

      const payload = { ...formData };
      if (!payload.parentId) delete payload.parentId;

      const { data } = await axios[method](url, payload);

      if (data.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to save category", error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getOptionsTree = (cats) => {
    let options = [];
    options.push({ value: "", label: "None (Main Category)", icon: "home" });

    const traverse = (nodes, path = "") => {
      for (const node of nodes) {
        if (category && node._id === category._id) continue;

        const currentPath = path ? `${path} > ${node.name}` : node.name;

        options.push({
          value: node._id,
          label: currentPath,
          icon: "folder",
        });

        if (node.children && node.children.length > 0) {
          traverse(node.children, currentPath);
        }
      }
    };
    traverse(cats || []);
    return options;
  };

  const options = getOptionsTree(categories);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Add New Category"}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            icon="save"
            isLoading={loading}
          >
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Category Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-border-dark rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="e.g. Smartphones"
            autoFocus
          />
        </div>

        <div>
          <SearchableSelect
            label="Parent Category"
            placeholder="Search for parent..."
            options={options}
            value={formData.parentId}
            onChange={(val) => setFormData({ ...formData, parentId: val })}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            {formData.parentId
              ? "This will be a sub-category."
              : "This will be a main (root) category."}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-border-dark rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            placeholder="Brief description..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;

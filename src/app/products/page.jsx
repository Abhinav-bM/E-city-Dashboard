"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Tooltip from "@/components/ui/Tooltip";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Package,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Ban,
  Power,
  XCircle,
  RefreshCcw,
  RefreshCw,
  AlertTriangle,
  Edit,
} from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

import Modal from "@/components/ui/Modal";
import ProductViewModal from "@/components/products/ProductViewModal";

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProductSlug, setViewProductSlug] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [inventoryType, setInventoryType] = useState(""); // '' (All Types) | 'Quantity' (New) | 'Unique' (Used)

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // In real app, fetch from API

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedStatus) {
        // Convert "active"/"draft" to boolean true/false
        params.isActive = selectedStatus === "active" ? true : false;
      }
      if (inventoryType) params.inventoryType = inventoryType;

      const response = await productService.getAll(params);

      // httpservice interceptor already returns response.data
      if (response.success) {
        setProducts(response.data.products || []);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
            pages: response.data.pagination.pages,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Filters Metadata (Categories & Brands)
  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        categoryService.getAll(),
        brandService.getAll(),
      ]);

      // httpservice interceptor already returns response.data
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
      if (brandRes.success) {
        setBrands(brandRes.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch metadata", err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    pagination.currentPage,
    debouncedSearch,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    inventoryType,
  ]);

  // Format Price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Helper to get Stock Status
  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        icon: AlertTriangle,
      };
    if (stock < 10)
      return {
        label: `${stock} left`,
        color:
          "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
        icon: AlertTriangle,
      };
    return {
      label: `${stock} in stock`,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      icon: null,
    };
  };

  // Handle Status Toggle (Activate/Deactivate)
  const handleStatusToggle = (product) => {
    setProductToDelete({
      id: product.baseProductId || product._id,
      isActive: product.isActive,
    });
    setDeleteModalOpen(true);
  };

  const confirmStatusToggle = async () => {
    if (!productToDelete) return;

    const toastId = toast.loading(
      productToDelete.isActive
        ? "Deactivating product..."
        : "Activating product...",
    );

    try {
      await productService.delete(productToDelete.id);

      toast.success(
        productToDelete.isActive
          ? "Product deactivated successfully"
          : "Product activated successfully",
        { id: toastId },
      );

      setDeleteModalOpen(false);
      setProductToDelete(null);

      // Refresh the product list to show updated status
      fetchProducts();
    } catch (error) {
      console.error("Failed to toggle product status", error);
      toast.error(
        productToDelete.isActive
          ? "Failed to deactivate product"
          : "Failed to activate product",
        { id: toastId },
      );
    }
  };

  // Handle Page Change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Handle View Details
  const handleViewDetails = (slug) => {
    console.log("View Details Clicked. Slug:", slug); // Debug log
    if (slug) {
      setViewProductSlug(slug);
      setViewModalOpen(true);
    } else {
      toast.error("Product details unavailable");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Products
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage your product catalog, inventory, and pricing.
          </p>
        </div>
        <div className="flex gap-3">
          <Tooltip content="Refresh List" position="bottom">
            <button
              onClick={() => fetchProducts()}
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mr-2"
            >
              <RefreshCw size={20} />
            </button>
          </Tooltip>

          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push("/products/add-product")}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Product Type Toggle */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              Product Type
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between new and used/refurbished products
            </p>
          </div>
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setInventoryType("Quantity")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                inventoryType === "Quantity"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Package size={16} />
              New Products
            </button>
            <button
              onClick={() => setInventoryType("Unique")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                inventoryType === "Unique"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <RefreshCcw size={16} />
              Used / Refurbished
            </button>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by product name, SKU, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary cursor-pointer flex-shrink-0"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary cursor-pointer flex-shrink-0"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary cursor-pointer flex-shrink-0"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="draft">Deactivated</option>
          </select>

          <button
            onClick={() => {
              setInventoryType("");
              setSelectedStatus("");
              setSelectedCategory("");
              setSelectedBrand("");
              setSearchQuery("");
            }}
            className="group relative p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-900/30 transition-all"
            title="Clear all filters"
          >
            <XCircle className="w-5 h-5" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Clear Filters
            </span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/25 bg-slate-50 dark:bg-slate-700"
                  />
                </th>
                <th className="p-4 min-w-[300px]">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center">
                      <Package size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">
                        Try adjusting your filters or add a new product.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockInfo = getStockStatus(product.stock);
                  // Construct subtitle from attributes (e.g. Color: Black, Storage: 128GB)
                  const variantSubtitle = product.attributes
                    ? Object.entries(product.attributes)
                        .map(([key, val]) => `${val}`)
                        .join(" / ")
                    : "";

                  // Determine product type for color coding
                  const isNewProduct = product.inventoryType === "Quantity";
                  const isUsedProduct = product.inventoryType === "Unique";

                  return (
                    <tr
                      key={product.variantId || product._id}
                      className={`group transition-colors ${
                        !product.isActive
                          ? "opacity-60 grayscale bg-slate-50 dark:bg-slate-800/20"
                          : isNewProduct
                            ? "hover:bg-blue-50/30 dark:hover:bg-blue-900/10 border-l-2 border-blue-400/40"
                            : isUsedProduct
                              ? "hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 border-l-2 border-emerald-400/40"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/25 bg-slate-50 dark:bg-slate-700"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden flex items-center justify-center">
                            {product.images && product.images[0] ? (
                              <img
                                src={
                                  product.images[0]?.url || product.images[0]
                                }
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="text-slate-400" size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {product.title || product.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {variantSubtitle && (
                                <span>{variantSubtitle}</span>
                              )}
                              {product.sku && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                  <span className="font-mono">
                                    SKU: {product.sku}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        {typeof product.category === "object"
                          ? product.category?.name
                          : categories.find((c) => c._id === product.category)
                              ?.name ||
                            product.category ||
                            "Uncategorized"}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        {product.brand || "N/A"}
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                        {formatPrice(product.sellingPrice || 0)}
                      </td>
                      <td className="p-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stockInfo.color} border-current/20 mx-auto w-fit`}
                        >
                          {stockInfo.icon && <stockInfo.icon size={12} />}
                          {stockInfo.label}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            product.isActive
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          } mx-auto w-fit`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                          ></span>
                          {product.isActive ? "Active" : "Deactivated"}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Edit" position="top">
                            <button
                              onClick={() => {
                                const baseProductId =
                                  product.baseProductId || product._id;
                                router.push(
                                  `/products/add-product?edit=true&id=${baseProductId}`,
                                );
                              }}
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip content="View Details" position="top">
                            <button
                              onClick={() => handleViewDetails(product.slug)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </Tooltip>

                          <Tooltip
                            content={
                              product.isActive ? "Deactivate" : "Activate"
                            }
                            position="left"
                          >
                            <button
                              onClick={() => handleStatusToggle(product)}
                              className={`p-1.5 rounded-md transition-colors ${
                                product.isActive
                                  ? "text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  : "text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {product.isActive ? (
                                <Ban size={16} />
                              ) : (
                                <RefreshCcw size={16} />
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.total,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {pagination.total}
            </span>{" "}
            results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.pages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Status Toggle Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          productToDelete?.isActive
            ? "Confirm Deactivation"
            : "Confirm Activation"
        }
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-slate-600 dark:text-slate-300">
            {productToDelete?.isActive
              ? "Are you sure you want to deactivate this product? It will be hidden from the store but can be reactivated later."
              : "Are you sure you want to activate this product? It will become visible in the store immediately."}
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={productToDelete?.isActive ? "danger" : "primary"}
              className={`${
                productToDelete?.isActive
                  ? "bg-red-500 hover:bg-red-600 border-red-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white"
              }`}
              onClick={confirmStatusToggle}
            >
              {productToDelete?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Product View Details Modal */}
      <ProductViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        productSlug={viewProductSlug}
      />
    </AdminLayout>
  );
}

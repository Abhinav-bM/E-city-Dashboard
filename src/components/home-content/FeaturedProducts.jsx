"use client";
import React, { useState, useEffect } from "react";
import productService from "@/services/productService";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch products sorted by creation date (newest first)
      // Assumes the API supports 'sort' parameter or defaults.
      // If not, we might need to adjust the API call.
      // Based on previous work, `getAll` takes query params.
      const res = await productService.getAll({
        page,
        limit: 20,
        search,
        sort: "-createdAt", // Typically works for backend sorting if implemented, or we rely on default
      });

      if (res.success) {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search? For now, direct effect on page change, search needs enter or debounce
    // Simple implementation:
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  const toggleFlag = async (product, flag) => {
    // Optimistic Update
    const originalProducts = [...products];
    const updatedProducts = products.map((p) => {
      const pId = p.baseProductId || p._id;
      const targetId = product.baseProductId || product._id;
      return pId === targetId ? { ...p, [flag]: !p[flag] } : p;
    });
    setProducts(updatedProducts);

    try {
      // We need to send the full payload or partial update?
      // `update` service usually expects full object or handles partial.
      // Let's assume partial works or we need to send what's changed.
      // `productService.update` calls PUT /:id. The backend implementation we did earlier handles patching?
      // Checking `product-service.js`: it updates fields if provided.
      // So sending just `{ [flag]: !value }` should work well!
      // Use ID logic consistent with ProductList
      const productId = product.baseProductId || product._id;
      if (!productId) throw new Error("Product ID missing");

      await productService.update(productId, {
        [flag]: !product[flag],
      });
      toast.success("Updated successfully");
    } catch (err) {
      setProducts(originalProducts);
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Featured Products
          </h2>
          <p className="text-sm text-slate-500">
            Manage product visibility in Home Page sections.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          Loading products...
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                  Price
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center">
                  Featured
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center">
                  New Arrival
                </th>
                {/* Spotlight is implicitly 'Unique' inventory type usually, but do we have a flag? 
                    Actually, Refurbished Spotlight fetches 'Unique' items. 
                    If we want to force something, we might need a flag. 
                    Backend has `inventoryType`. Let's stick to Featured/New Arrival for now as those are flags.
                    Wait, user asked for "products to be shown in different sections".
                    Refurbished Spotlight Logic: `inventoryType: "Unique"`.
                    So we can't toggle that easily unless we change inventory type, which is drastic.
                    Maybe we assume Spotlight is automatic based on inventory type.
                    Let's just show Featured and New Arrival for now.
                */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                          {product.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {product.category?.name || "No Category"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    ₹{product.sellingPrice?.toLocaleString()}
                  </td>

                  {/* Featured Toggle */}
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!product.isFeatured}
                        onChange={() => toggleFlag(product, "isFeatured")}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>

                  {/* New Arrival Toggle */}
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!product.isNewArrival}
                        onChange={() => toggleFlag(product, "isNewArrival")}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-500 dark:text-slate-400">
        <div>
          Showing{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {(page - 1) * 20 + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {Math.min(page * 20, pagination.total || 0)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {pagination.total || 0}
          </span>{" "}
          results
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            disabled={page >= (pagination.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;

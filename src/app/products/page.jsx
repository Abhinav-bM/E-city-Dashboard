"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Backend returns { success: true, data: { products: [...], pagination: {...} } }
      const response = await axios.get(
        "http://localhost:5000/api/product/all",
        {
          params: {
            page: pagination.currentPage,
            limit: pagination.limit,
          },
        },
      );

      const { data } = response;

      if (data.success) {
        // Correctly handle the nested structure from product-repository
        setProducts(data.data.products || []);
        if (data.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.data.pagination.total,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      // Fallback for demo/dev if API fails or returns unexpected structure
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage]); // Re-fetch on page change

  const columns = [
    {
      title: "Product Name",
      key: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">
            {row.name}
          </span>
          <span className="text-xs text-slate-500">{row.sku || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Brand",
      key: "brand",
    },
    {
      title: "Category",
      key: "category",
    },
    {
      title: "Price",
      key: "price",
      render: (row) => {
        // Find the lowest price from variants
        const price = row.variants?.[0]?.sellingPrice || "N/A";
        return <span className="font-medium">${price}</span>;
      },
      width: "120px",
    },
    {
      title: "Status",
      key: "status",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "neutral"}>
          {row.isActive ? "Active" : "Draft"}
        </Badge>
      ),
      width: "100px",
    },
  ];

  const handleEdit = (product) => {
    // Navigate to edit page (pending implementation)
    // router.push(`/products/edit/${product._id}`);
    alert(`Edit ${product.name} (Coming Soon)`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
            Products
          </h1>
          <p className="text-slate-500 dark:text-text-secondary">
            Manage your catalog and inventory.
          </p>
        </div>
        <div className="flex gap-3">
          <Tooltip content="Add a new product" position="bottom">
            <Button
              variant="primary"
              icon="add"
              onClick={() => router.push("/products/add-product")}
            >
              Add Product
            </Button>
          </Tooltip>
        </div>
      </div>

      <Table
        loading={loading}
        columns={columns}
        data={products}
        pagination={pagination}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
        actions={(row) => (
          <>
            <Tooltip content="Edit Product" position="top">
              <button
                className="p-1 text-slate-400 hover:text-primary transition-colors"
                onClick={() => handleEdit(row)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
              </button>
            </Tooltip>
            <Tooltip content="Delete Product" position="top">
              <button className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  delete
                </span>
              </button>
            </Tooltip>
          </>
        )}
      />
    </AdminLayout>
  );
}

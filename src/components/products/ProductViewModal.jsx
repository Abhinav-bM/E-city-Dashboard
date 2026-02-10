"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import productService from "@/services/productService";
import { Package, X } from "lucide-react";

export default function ProductViewModal({ isOpen, onClose, productSlug }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (isOpen && productSlug) {
      fetchProductDetails();
    } else {
      setProduct(null);
      setError(null);
    }
  }, [isOpen, productSlug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // httpservice interceptor already returns response.data
      const response = await productService.getBySlug(productSlug);
      if (response.success) {
        setProduct(response.data);
        // Reset selected image when new product loads
        setSelectedImage(0);
      } else {
        setError("Failed to load product details");
      }
    } catch (err) {
      console.error("Error fetching product details", err);
      setError(err.response?.data?.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Helper to render attributes safely
  const renderAttributes = (attributes) => {
    if (!attributes || typeof attributes !== "object") return null;
    return Object.entries(attributes).map(([key, value]) => (
      <span
        key={key}
        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      >
        <span className="opacity-50 mr-1.5 uppercase tracking-wide text-[10px]">
          {key}:
        </span>
        {value}
      </span>
    ));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="2xl">
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <span className="text-sm text-slate-500">Loading details...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 h-64 text-center">
            <div className="bg-red-50 dark:bg-red-900/10 text-red-500 p-3 rounded-full mb-3">
              <span className="material-symbols-outlined">error</span>
            </div>
            <p className="text-slate-900 dark:text-white font-medium mb-1">
              Unable to load product
            </p>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={fetchProductDetails}
              className="text-sm font-medium text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            {/* Left: Images */}
            <div className="space-y-3">
              <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 relative group">
                {product.currentVariant?.images &&
                product.currentVariant.images.length > 0 ? (
                  <img
                    src={product.currentVariant.images[selectedImage]}
                    alt={product.currentVariant.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Package
                    size={48}
                    className="text-slate-300 dark:text-slate-600"
                  />
                )}
              </div>
              {product.currentVariant?.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {product.currentVariant.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-md border-2 overflow-hidden shrink-0 transition-all ${
                        selectedImage === idx
                          ? "border-primary ring-1 ring-primary/20"
                          : "border-transparent opacity-60 hover:opacity-100 bg-slate-50 dark:bg-slate-800"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                        {product.baseProduct?.brand || "Brand N/A"}
                      </span>
                      {product.currentVariant?.isDefault && (
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Default Variant
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {product.currentVariant?.title ||
                        product.baseProduct?.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(product.currentVariant?.price || 0)}
                  </span>
                  {product.currentVariant?.compareAtPrice >
                    product.currentVariant?.price && (
                    <div className="flex flex-col leading-none">
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(product.currentVariant.compareAtPrice)}
                      </span>
                      <span className="text-xs font-medium text-green-500">
                        {Math.round(
                          ((product.currentVariant.compareAtPrice -
                            product.currentVariant.price) /
                            product.currentVariant.compareAtPrice) *
                            100,
                        )}
                        % OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      product.currentVariant?.isAvailable
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${product.currentVariant?.isAvailable ? "bg-emerald-500" : "bg-red-500"}`}
                    ></span>
                    {product.currentVariant?.isAvailable
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {product.currentVariant?.stock} units available
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm border-y border-slate-100 dark:border-slate-800 py-4">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                    SKU
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-medium select-all">
                    {product.currentVariant?.sku || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                    Category
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate block">
                    {typeof product.baseProduct?.category === "object"
                      ? product.baseProduct.category?.name
                      : product.baseProduct?.category || "N/A"}
                  </span>
                </div>
                {product.currentVariant?.weight !== undefined && (
                  <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                      Weight
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {product.currentVariant.weight} kg
                    </span>
                  </div>
                )}
              </div>

              {product.currentVariant?.attributes &&
                Object.keys(product.currentVariant.attributes).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Attributes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {renderAttributes(product.currentVariant.attributes)}
                    </div>
                  </div>
                )}

              {/* Unique Item Details */}
              {(product.currentVariant?.inventoryType === "Unique" ||
                (product.currentVariant?.condition &&
                  product.currentVariant?.condition !== "New")) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Package size={14} />
                    Item Condition & Details
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wide mb-0.5">
                        Condition
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {product.currentVariant?.condition || "N/A"}
                      </span>
                    </div>
                    {product.currentVariant?.conditionGrade && (
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wide mb-0.5">
                          Grade
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {product.currentVariant.conditionGrade}
                        </span>
                      </div>
                    )}
                    {product.currentVariant?.imei && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wide mb-0.5">
                          IMEI
                        </span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-all">
                          {product.currentVariant.imei}
                        </span>
                      </div>
                    )}
                    {product.currentVariant?.serialNumber && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wide mb-0.5">
                          Serial Number
                        </span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-all">
                          {product.currentVariant.serialNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  {product.currentVariant?.conditionDescription && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wide mb-1">
                        Condition Notes
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 text-xs italic leading-relaxed">
                        "{product.currentVariant.conditionDescription}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {product.baseProduct?.description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <div
                    className="text-sm text-slate-600 dark:text-slate-400 prose prose-sm dark:prose-invert max-w-none max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: product.baseProduct.description,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

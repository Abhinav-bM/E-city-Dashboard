"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Badge from "@/components/ui/Badge";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";
import productService from "@/services/productService";
import uploadService from "@/services/uploadService";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Layers,
  Package,
  FileText,
  Image as ImageIcon,
  Star,
  Crop,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { SectionLoader, Spinner } from "@/components/ui/Loader";

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Image crop modal state
  const [cropModal, setCropModal] = useState(null); // { src, onConfirm }

  // Upload-in-progress tracking for Step 3
  const [uploadingCommon, setUploadingCommon] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState(null); // index of variant being uploaded

  // -- Global Form State --
  const [formData, setFormData] = useState({
    // Step 1: Essentials
    title: "",
    brand: "",
    category: "",
    description: "",
    condition: "New", // New | Refurbished
    // images now stored as { url: string, isMain: boolean }[]
    images: [],
    isFeatured: false,
    isNewArrival: false,

    // Step 2: Variants & Inventory
    options: [], // e.g. [{name: 'Color', values: ['Red', 'Blue']}]
    variants: [], // Generated variant objects — each has images: [{url, isMain}][]
    specifications: [], // e.g. [{ group: 'Display', items: [{ key: 'Resolution', value: '1080p' }] }]

    // Step 2 (Alternative for Used): Unique Item Details
    imei: "",
    serialNumber: "",
    conditionGrade: "Excellent", // Like New | Excellent | Good | Fair
    conditionDescription: "",
    sellingPrice: "",
    actualPrice: "",
    sku: "",
    warranty: "", // e.g. "6 Month Store Warranty"
  });

  // Metadata
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Check for edit mode on mount
  useEffect(() => {
    const editParam = searchParams.get("edit");
    const idParam = searchParams.get("id");

    if (editParam === "true" && idParam) {
      setIsEditMode(true);
      setProductId(idParam);
    }
  }, [searchParams]);

  // Fetch metadata (categories and brands)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          categoryService.getAll(),
          brandService.getAll(),
        ]);

        if (categoriesRes.success) {
          setCategories(
            categoriesRes.data.map((cat) => ({
              value: cat._id,
              label: cat.name,
            })),
          );
        }
        if (brandsRes.success) {
          setBrands(
            brandsRes.data.map((brand) => ({
              value: brand.name,
              label: brand.name,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch and prefill product data in edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await productService.getById(productId);
        if (response.success) {
          const product = response.data;

          // Prefill basic info
          setFormData((prev) => ({
            ...prev,
            title: product.baseProduct?.title || "",
            brand: product.baseProduct?.brand || "",
            category:
              typeof product.baseProduct?.category === "object"
                ? product.baseProduct.category._id
                : product.baseProduct?.category || "",
            description: product.baseProduct?.description || "",
            condition: product.currentVariant?.condition || "New",
            // Load common images — mark as already uploaded (no re-upload needed)
            images: (product.baseProduct?.images || [])
              .map((img) =>
                typeof img === "object" && img.url
                  ? {
                      url: img.url,
                      isMain: img.isMain || false,
                      uploaded: true,
                    }
                  : { url: img, isMain: false, uploaded: true },
              )
              .filter((img) => Boolean(img.url)),
            isFeatured: product.baseProduct?.isFeatured || false,
            isNewArrival: product.baseProduct?.isNewArrival || false,
            specifications: product.baseProduct?.specifications || [],

            // Prefill options and variants for New products
            options: product.baseProduct?.variantAttributes || [],
            variants:
              product.availableVariants?.map((v) => ({
                attributes: v.attributes || {},
                sellingPrice: v.sellingPrice || 0,
                actualPrice: v.actualPrice || v.sellingPrice || 0,
                stock: v.stock || 0,
                sku: v.sku || "",
                // Load variant images — mark as already uploaded
                images: (v.images || [])
                  .map((img) =>
                    typeof img === "object" && img.url
                      ? {
                          url: img.url,
                          isMain: img.isMain || false,
                          uploaded: true,
                        }
                      : { url: img, isMain: false, uploaded: true },
                  )
                  .filter((img) => Boolean(img.url)),
              })) || [],

            // Prefill used item details if applicable
            imei: product.currentVariant?.imei || "",
            serialNumber: product.currentVariant?.serialNumber || "",
            conditionGrade:
              product.currentVariant?.conditionGrade || "Excellent",
            conditionDescription:
              product.currentVariant?.conditionDescription || "",
            sellingPrice: product.currentVariant?.sellingPrice || "",
            actualPrice:
              product.currentVariant?.actualPrice ||
              product.currentVariant?.sellingPrice ||
              "",
            sku: product.currentVariant?.sku || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch product data", err);
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode && productId && categories.length > 0) {
      fetchProductData();
    }
  }, [isEditMode, productId, categories]);

  const handleCreateBrand = async (newBrandName) => {
    const toastId = toast.loading("Creating brand...");
    try {
      const response = await brandService.create({ name: newBrandName });
      if (response.success) {
        // Add to local state and select it
        const newOption = {
          value: response.data.name,
          label: response.data.name,
        };
        setBrands((prev) => [...prev, newOption]);
        updateField("brand", response.data.name);
        toast.success("Brand created successfully!", { id: toastId });
      }
    } catch (err) {
      console.error("Failed to create brand", err);
      toast.error(err.response?.data?.message || "Failed to create brand", {
        id: toastId,
      });
    }
  };

  // Validation Helper
  const canProceedToStep2 = () => {
    // Basic check: Title, Category, and Description are required
    return (
      formData.title.trim().length > 0 &&
      formData.category &&
      formData.description.trim().length > 0
    );
  };

  // -- Handlers --
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // -- Helper: upload a blob, return { url } or null --
  const uploadBlob = async (blob, filename = "image.jpg") => {
    const fd = new FormData();
    fd.append("image", blob, filename);
    try {
      const res = await uploadService.uploadImage(fd);
      if (res && res.data && res.data.url) return { url: res.data.url };
      return null;
    } catch {
      return null;
    }
  };

  // -- Common image select: instant local preview, no upload yet --
  const handleCommonImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    files.forEach((file) => {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            url: localUrl,
            blob: file,
            isMain: prev.images.length === 0,
            uploaded: false,
          },
        ],
      }));
    });
  };

  const removeCommonImage = (index) => {
    setFormData((prev) => {
      const img = prev.images[index];
      // Revoke object URL if local to free memory
      if (img && !img.uploaded && img.url?.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
      const next = prev.images.filter((_, i) => i !== index);
      if (img?.isMain && next.length > 0)
        next[0] = { ...next[0], isMain: true };
      return { ...prev, images: next };
    });
  };

  const toggleCommonMain = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isMain: i === index })),
    }));
  };

  // -- Edit/crop an already-added common image --
  const openCommonImageCrop = (index) => {
    const img = formData.images[index];
    const src = img.url; // blob: URL (local) or remote URL
    setCropModal({
      src,
      onConfirm: (blob) => {
        const newLocalUrl = URL.createObjectURL(blob);
        // Revoke old local URL if it was a blob
        if (!img.uploaded && img.url?.startsWith("blob:"))
          URL.revokeObjectURL(img.url);
        setFormData((prev) => {
          const next = [...prev.images];
          next[index] = {
            ...next[index],
            url: newLocalUrl,
            blob,
            uploaded: false,
          };
          return { ...prev, images: next };
        });
        setCropModal(null);
      },
    });
  };

  // -- Variant image select: instant local preview, no upload yet --
  const handleVariantImageSelect = (variantIdx, e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    files.forEach((file) => {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const newVars = [...prev.variants];
        const existingImages = newVars[variantIdx].images || [];
        const isFirst = existingImages.length === 0;
        newVars[variantIdx] = {
          ...newVars[variantIdx],
          images: [
            ...existingImages,
            { url: localUrl, blob: file, isMain: isFirst, uploaded: false },
          ],
        };
        return { ...prev, variants: newVars };
      });
    });
  };

  // -- Edit/crop an already-added variant image --
  const openVariantImageCrop = (variantIdx, imgIdx) => {
    const img = formData.variants[variantIdx].images[imgIdx];
    setCropModal({
      src: img.url,
      onConfirm: (blob) => {
        const newLocalUrl = URL.createObjectURL(blob);
        if (!img.uploaded && img.url?.startsWith("blob:"))
          URL.revokeObjectURL(img.url);
        setFormData((prev) => {
          const newVars = [...prev.variants];
          const imgs = [...(newVars[variantIdx].images || [])];
          imgs[imgIdx] = {
            ...imgs[imgIdx],
            url: newLocalUrl,
            blob,
            uploaded: false,
          };
          newVars[variantIdx] = { ...newVars[variantIdx], images: imgs };
          return { ...prev, variants: newVars };
        });
        setCropModal(null);
      },
    });
  };

  const removeVariantImage = (variantIdx, imgIdx) => {
    setFormData((prev) => {
      const newVars = [...prev.variants];
      const imgs = [...(newVars[variantIdx].images || [])];
      const wasMain = imgs[imgIdx]?.isMain;
      imgs.splice(imgIdx, 1);
      if (wasMain && imgs.length > 0) imgs[0] = { ...imgs[0], isMain: true };
      newVars[variantIdx] = { ...newVars[variantIdx], images: imgs };
      return { ...prev, variants: newVars };
    });
    toast.success("Image removed", { icon: "🗑️" });
  };

  const toggleVariantMain = (variantIdx, imgIdx) => {
    setFormData((prev) => {
      const newVars = [...prev.variants];
      // Set isMain=true on the selected image, false on all others (same as common images)
      newVars[variantIdx] = {
        ...newVars[variantIdx],
        images: (newVars[variantIdx].images || []).map((img, i) => ({
          ...img,
          isMain: i === imgIdx,
        })),
      };
      return { ...prev, variants: newVars };
    });
  };

  const addSpecGroup = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { group: "", items: [] }],
    }));
  };

  const removeSpecGroup = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpecGroup = (index, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index].group = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecItem = (groupIndex) => {
    const newSpecs = [...formData.specifications];
    newSpecs[groupIndex].items.push({ key: "", value: "" });
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const removeSpecItem = (groupIndex, itemIndex) => {
    const newSpecs = [...formData.specifications];
    newSpecs[groupIndex].items = newSpecs[groupIndex].items.filter(
      (_, i) => i !== itemIndex,
    );
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const updateSpecItem = (groupIndex, itemIndex, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[groupIndex].items[itemIndex][field] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const renderSpecifications = () => (
    <Card title="Detailed Specifications">
      <div className="space-y-4">
        {formData.specifications.map((spec, groupIndex) => (
          <div
            key={groupIndex}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50"
          >
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                placeholder="Group Name (e.g. Display)"
                className="bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-primary outline-none font-bold text-slate-900 dark:text-white placeholder-slate-400 w-1/2"
                value={spec.group}
                onChange={(e) => updateSpecGroup(groupIndex, e.target.value)}
              />
              <button
                onClick={() => removeSpecGroup(groupIndex)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove Group
              </button>
            </div>
            <div className="space-y-2">
              {spec.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key (e.g. Resolution)"
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm focus:border-primary outline-none"
                    value={item.key}
                    onChange={(e) =>
                      updateSpecItem(
                        groupIndex,
                        itemIndex,
                        "key",
                        e.target.value,
                      )
                    }
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 4K)"
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm focus:border-primary outline-none"
                    value={item.value}
                    onChange={(e) =>
                      updateSpecItem(
                        groupIndex,
                        itemIndex,
                        "value",
                        e.target.value,
                      )
                    }
                  />
                  <button
                    onClick={() => removeSpecItem(groupIndex, itemIndex)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSpecItem(groupIndex)}
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1 mt-2"
              >
                + Add Item
              </button>
            </div>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={addSpecGroup}
          className="w-full border-dashed"
        >
          + Add Specification Group
        </Button>
      </div>
    </Card>
  );

  // -- Render Steps --

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { num: 1, label: "Basic Details" },
        { num: 2, label: "Variants & Stock" },
        { num: 3, label: "Images" },
        { num: 4, label: "Review" },
      ].map((step, idx) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;

        return (
          <div key={step.num} className="flex items-center">
            <div
              className={`flex flex-col items-center relative z-10 mx-4 transition-all ${
                isActive || isCompleted ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-white"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500"
                }`}
              >
                {isCompleted ? <Check size={20} /> : step.num}
              </div>
              <span
                className={`text-xs font-medium mt-2 whitespace-nowrap ${
                  isActive
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector Line */}
            {idx < 3 && (
              <div
                className={`w-16 h-0.5 rounded transition-colors ${
                  isCompleted
                    ? "bg-emerald-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Initial Data Loading State
  // You might want to track this with a separate state, but for now we can infer
  // or add a new state `initialLoading`. For this step, I'll just leave it
  // or better, wrap the whole content if critical data is missing.

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Condition / Workflow Toggle */}
      <Card title="Inventory Type">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 mb-2">
          <label
            className={`flex-1 cursor-pointer border-2 rounded-xl p-4 transition-all ${
              formData.condition === "New"
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <input
              type="radio"
              name="condition"
              value="New"
              checked={formData.condition === "New"}
              onChange={() => updateField("condition", "New")}
              className="hidden"
            />
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2 rounded-lg ${formData.condition === "New" ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}
              >
                <Package size={20} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                New Condition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For bulk inventory items. Track stock by quantity (e.g. 50 units).
            </p>
          </label>

          <label
            className={`flex-1 cursor-pointer border-2 rounded-xl p-4 transition-all ${
              formData.condition === "Refurbished"
                ? "border-amber-500 bg-amber-500/5"
                : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <input
              type="radio"
              name="condition"
              value="Refurbished"
              checked={formData.condition === "Refurbished"}
              onChange={() => updateField("condition", "Refurbished")}
              className="hidden"
            />
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2 rounded-lg ${formData.condition === "Refurbished" ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}
              >
                <Layers size={20} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                Refurbished / Used
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For unique items. Track each unit individually by IMEI or Serial
              Number.
            </p>
          </label>
        </div>
      </Card>

      {/* Product Info */}
      <Card title="Product Information" className="h-fit">
        <div className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Wireless Noise Cancelling Headphones"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="Brand"
              placeholder="Select or create brand..."
              options={brands}
              value={formData.brand}
              onChange={(val) => updateField("brand", val)}
              onCreate={handleCreateBrand}
            />
            <SearchableSelect
              label="Category"
              placeholder="Select category..."
              options={categories}
              value={formData.category}
              onChange={(val) => updateField("category", val)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-3 min-h-[150px] text-sm focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* isFeatured / isNewArrival toggles */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <label
              className={`flex items-center gap-3 flex-1 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                formData.isFeatured
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div
                onClick={() => updateField("isFeatured", !formData.isFeatured)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                  formData.isFeatured ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    formData.isFeatured ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Featured Product</p>
                <p className="text-xs text-slate-500">Show in Featured section on homepage</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 flex-1 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                formData.isNewArrival
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div
                onClick={() => updateField("isNewArrival", !formData.isNewArrival)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                  formData.isNewArrival ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    formData.isNewArrival ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">New Arrival</p>
                <p className="text-xs text-slate-500">Show in New Arrivals section</p>
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* Detailed Specifications */}
      {renderSpecifications()}
    </div>
  );

  /* -- Step 2: Variants or Item Details -- */
  const renderStep2 = () => {
    // Helper to generate cartesian product
    const generateVariants = () => {
      if (formData.options.length === 0) return;

      // Cartesian product function
      const cartesian = (...a) =>
        a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

      let variants = [];
      if (formData.options.length === 1) {
        variants = formData.options[0].values.map((val) => ({
          attributes: { [formData.options[0].name]: val },
          sellingPrice: "",
          actualPrice: "", // MRP
          stock: formData.condition === "New" ? "" : "0",
          sku: "",
          weight: "",
          dimensions: "",
          condition: formData.condition,
          isRefurbished: formData.condition === "Refurbished",
          image: null,
        }));
      } else {
        const values = formData.options.map((o) => o.values);
        const combinations = cartesian(...values);

        variants = combinations.map((combo) => {
          const attributes = {};
          combo.forEach((val, idx) => {
            attributes[formData.options[idx].name] = val;
          });
          return {
            attributes,
            sellingPrice: "",
            actualPrice: "",
            stock: formData.condition === "New" ? "" : "0",
            sku: "",
            weight: "",
            dimensions: "",
            condition: formData.condition,
            isRefurbished: formData.condition === "Refurbished",
            image: null,
          };
        });
      }
      setFormData((prev) => ({ ...prev, variants }));
    };

    const addOption = () => {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, { name: "", values: [] }],
      }));
    };

    const updateOptionName = (idx, name) => {
      const newOpts = [...formData.options];
      newOpts[idx].name = name;
      setFormData({ ...formData, options: newOpts });
    };

    const addOptionValue = (idx, val) => {
      if (!val.trim()) return;
      const newOpts = [...formData.options];
      if (!newOpts[idx].values.includes(val)) {
        newOpts[idx].values.push(val);
        setFormData({ ...formData, options: newOpts });
      }
    };

    const updateVariant = (idx, field, value) => {
      const newVars = [...formData.variants];
      newVars[idx][field] = value;
      setFormData((prev) => ({ ...prev, variants: newVars }));
    };

    // --- RENDER FOR NEW PRODUCTS (VARIANTS) ---
    if (formData.condition === "New") {
      return (
        <div className="space-y-8">
          <Card title="Product Options" className="overflow-visible">
            <div className="space-y-6">
              <p className="text-sm text-slate-500">
                Add options like Color or Size to generate variants.
              </p>

              {formData.options.map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase mb-1 block">
                        Option Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="e.g. Color"
                        value={opt.name}
                        onChange={(e) => updateOptionName(idx, e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase mb-1 block">
                        Option Values
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Type value and hit Enter (e.g. Red)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addOptionValue(idx, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {opt.values.map((v, vIdx) => (
                          <div
                            key={vIdx}
                            className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded flex items-center gap-1"
                          >
                            {v}
                            <X
                              size={12}
                              className="cursor-pointer hover:text-red-500"
                              onClick={() => {
                                const newOpts = [...formData.options];
                                newOpts[idx].values = newOpts[
                                  idx
                                ].values.filter((_, i) => i !== vIdx);
                                setFormData({ ...formData, options: newOpts });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newOpts = formData.options.filter(
                        (_, i) => i !== idx,
                      );
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  icon={<Layers size={16} />}
                  onClick={addOption}
                >
                  Add Option
                </Button>
                <Button
                  variant="primary"
                  icon={<Package size={16} />}
                  onClick={generateVariants}
                  disabled={formData.options.length === 0}
                >
                  Generate Variants
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Variants Preview">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="p-3 font-medium">Variant</th>
                    <th className="p-3 font-medium w-32">Price (₹)</th>
                    <th className="p-3 font-medium w-32">MRP (₹)</th>
                    <th className="p-3 font-medium w-24">Stock</th>
                    <th className="p-3 font-medium w-40">SKU</th>
                    <th className="p-3 font-medium w-44">Warranty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {formData.variants.map((v, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {Object.values(v.attributes).join(" / ")}
                        </div>
                        {v.images && v.images.length > 0 && (
                          <span className="text-[10px] text-primary mt-0.5 block">
                            {v.images.length} image
                            {v.images.length > 1 ? "s" : ""} ✓
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:border-primary outline-none"
                          value={v.sellingPrice}
                          onChange={(e) =>
                            updateVariant(i, "sellingPrice", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:border-primary outline-none"
                          value={v.actualPrice}
                          onChange={(e) =>
                            updateVariant(i, "actualPrice", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:border-primary outline-none"
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(i, "stock", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:border-primary outline-none font-mono text-xs"
                          value={v.sku}
                          placeholder="Auto-gen if empty"
                          onChange={(e) =>
                            updateVariant(i, "sku", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:border-primary outline-none text-xs"
                          value={v.warranty || ""}
                          placeholder="e.g. 6 Month"
                          onChange={(e) =>
                            updateVariant(i, "warranty", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      );
    }

    // --- RENDER FOR USED / UNIQUE ITEMS ---
    const conditionGrades = ["Like New", "Excellent", "Good", "Fair"];

    return (
      <div className="space-y-6">
        <Card title="Unique Item Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condition Grade */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Condition Grade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {conditionGrades.map((grade) => (
                  <div
                    key={grade}
                    onClick={() => updateField("conditionGrade", grade)}
                    className={`cursor-pointer px-3 py-2 text-xs font-medium rounded-lg border flex items-center justify-center text-center transition-all ${
                      formData.conditionGrade === grade
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-primary/50"
                    }`}
                  >
                    {grade}
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Description */}
            <div>
              <Input
                label="Condition Description"
                placeholder="e.g. Minor hairline scratch on screen, 90% Battery"
                value={formData.conditionDescription}
                onChange={(e) =>
                  updateField("conditionDescription", e.target.value)
                }
              />
            </div>

            {/* Identifiers */}
            <Input
              label="IMEI / Serial Number"
              placeholder="Unique Identifier..."
              value={formData.imei}
              onChange={(e) => updateField("imei", e.target.value)}
            />

            <Input
              label="Store Code / SKU (Optional)"
              placeholder="Internal ID for this item..."
              value={formData.sku}
              onChange={(e) => updateField("sku", e.target.value)}
            />

            {/* Pricing */}
            <Input
              label="Selling Price"
              type="number"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => updateField("sellingPrice", e.target.value)}
              icon="₹"
            />

            <Input
              label="Original MRP"
              type="number"
              placeholder="0.00"
              value={formData.actualPrice}
              onChange={(e) => updateField("actualPrice", e.target.value)}
              icon="₹"
            />

            <Input
              label="Warranty"
              placeholder="e.g. 6 Month Store Warranty"
              value={formData.warranty}
              onChange={(e) => updateField("warranty", e.target.value)}
            />
          </div>
        </Card>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg flex gap-3 text-amber-800 dark:text-amber-200">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold mb-1">Single Unit Mode</p>
            <p>
              You are adding a specific, unique item. This will create a single
              inventory unit. To add more units of the same model, you will need
              to add another product or use the 'Restock' feature later.
            </p>
          </div>
        </div>
      </div>
    );
  };

  /* -- Step 3: Images -- */
  const renderStep3 = () => {
    // Reusable upload-zone component
    const UploadZone = ({ onSelect, uploading, label }) => (
      <label
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
          uploading
            ? "opacity-60 cursor-not-allowed border-slate-300 dark:border-slate-700"
            : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/5"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onSelect}
          disabled={uploading}
        />
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          {uploading ? (
            <Spinner size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {uploading ? "Uploading..." : label || "Click or drag to upload"}
        </p>
        <p className="text-xs text-slate-400">
          PNG, JPG, WEBP — Optional crop before upload
        </p>
      </label>
    );

    // Common image thumbnail: main toggle + crop/edit + remove
    const ImageThumb = ({ img, index, onToggleMain, onCrop, onRemove }) => (
      <div
        className={`relative group rounded-xl overflow-hidden border-2 aspect-square transition-all ${
          img.isMain
            ? "border-amber-400 shadow-lg shadow-amber-100 dark:shadow-amber-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <img src={img.url} alt="" className="w-full h-full object-cover" />
        {/* Local (unuploaded) indicator */}
        {!img.uploaded && (
          <div className="absolute bottom-1 right-1 bg-slate-900/70 text-[8px] text-slate-300 px-1 py-0.5 rounded">
            local
          </div>
        )}
        {/* Main badge */}
        {img.isMain && (
          <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Star size={8} fill="white" /> MAIN
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
          {!img.isMain && (
            <button
              onClick={() => onToggleMain(index)}
              title="Set as Main"
              className="bg-amber-400 hover:bg-amber-500 text-white rounded-full p-1.5 transition-all"
            >
              <Star size={12} />
            </button>
          )}
          <button
            onClick={() => onCrop(index)}
            title="Crop / Edit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-1.5 transition-all"
          >
            <Crop size={12} />
          </button>
          <button
            onClick={() => onRemove(index)}
            title="Remove"
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );

    // Variant image thumbnail — 1ST toggle + crop/edit + remove
    const VariantImageThumb = ({
      img,
      index,
      isFirst,
      onSetFirst,
      onCrop,
      onRemove,
    }) => (
      <div
        className={`relative group rounded-xl overflow-hidden border-2 aspect-square transition-all ${
          isFirst
            ? "border-primary shadow shadow-primary/20"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <img src={img.url} alt="" className="w-full h-full object-cover" />
        {!img.uploaded && (
          <div className="absolute bottom-1 right-1 bg-slate-900/70 text-[8px] text-slate-300 px-1 py-0.5 rounded">
            local
          </div>
        )}
        {isFirst && (
          <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Star size={8} fill="white" /> 1ST
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
          {!isFirst && (
            <button
              onClick={() => onSetFirst(index)}
              title="Show this image first"
              className="bg-primary hover:bg-primary/80 text-white rounded-full p-1.5 transition-all"
            >
              <Star size={12} />
            </button>
          )}
          <button
            onClick={() => onCrop(index)}
            title="Crop / Edit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-1.5 transition-all"
          >
            <Crop size={12} />
          </button>
          <button
            onClick={() => onRemove(index)}
            title="Remove"
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );

    return (
      <div className="space-y-8">
        {/* Section 1: Common Product Images */}
        <Card title="Common Product Images" icon={<ImageIcon size={18} />}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              These images are shared across <strong>all variants</strong>.
              Upload your main product photography here (e.g. studio shots,
              lifestyle photos).
            </p>
            <UploadZone
              onSelect={handleCommonImageSelect}
              uploading={uploadingCommon}
              label="Upload Common Images"
            />
            {formData.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  {formData.images.length} Image
                  {formData.images.length > 1 ? "s" : ""} · Click ☆ to set as
                  Main
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {formData.images.map((img, idx) => (
                    <ImageThumb
                      key={idx}
                      img={img}
                      index={idx}
                      onToggleMain={toggleCommonMain}
                      onCrop={openCommonImageCrop}
                      onRemove={removeCommonImage}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Section 2: Variant-Specific Images (New products only) */}
        {formData.condition === "New" && formData.variants.length > 0 && (
          <Card title="Variant-Specific Images" icon={<Layers size={18} />}>
            <div className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Optionally upload images{" "}
                <strong>specific to each variant</strong> (e.g. different colour
                photos). If left empty, the common images above will be used.
              </p>
              {formData.variants.map((v, varIdx) => {
                const variantLabel = Object.values(v.attributes).join(" / ");
                const variantImgs = v.images || [];
                const isUploading = uploadingVariantIdx === varIdx;

                return (
                  <div
                    key={varIdx}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    {/* Variant header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        {/* Preview of first image or placeholder */}
                        <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                          {variantImgs.length > 0 ? (
                            <img
                              src={
                                variantImgs.find((i) => i.isMain)?.url ||
                                variantImgs[0].url
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : formData.images.length > 0 ? (
                            <img
                              src={
                                formData.images.find((i) => i.isMain)?.url ||
                                formData.images[0]?.url
                              }
                              alt=""
                              className="w-full h-full object-cover opacity-40"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={12} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {variantLabel}
                        </span>
                        {variantImgs.length === 0 && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Inherits common images
                          </span>
                        )}
                        {variantImgs.length > 0 && (
                          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {variantImgs.length} custom image
                            {variantImgs.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <label
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          isUploading
                            ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        <Plus size={12} /> Add Image
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleVariantImageSelect(varIdx, e)}
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    {/* Variant images grid */}
                    {variantImgs.length > 0 && (
                      <div className="p-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                          {variantImgs.map((img, imgIdx) => (
                            <VariantImageThumb
                              key={imgIdx}
                              img={img}
                              index={imgIdx}
                              isFirst={!!img.isMain}
                              onSetFirst={(i) => toggleVariantMain(varIdx, i)}
                              onCrop={(i) => openVariantImageCrop(varIdx, i)}
                              onRemove={(i) => removeVariantImage(varIdx, i)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {formData.images.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg flex gap-3 text-amber-800 dark:text-amber-200">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">
              No common images uploaded yet. You can proceed, but adding at
              least one image is recommended for better visibility.
            </p>
          </div>
        )}
      </div>
    );
  };

  /* -- Step 4: Review -- */
  const renderStep4 = () => (
    <div className="space-y-6">
      <Card title="Review & Publish" icon={<FileText size={20} />}>
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden shrink-0">
              {formData.images[0] ? (
                <img
                  src={
                    formData.images.find((i) => i.isMain)?.url ||
                    formData.images[0]?.url
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {formData.title}
              </h3>
              <p className="text-sm text-slate-500">
                {formData.brand} • {formData.category}
              </p>
              <Badge
                variant={formData.condition === "New" ? "primary" : "warning"}
                className="mt-2"
              >
                {formData.condition}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              {formData.condition === "New"
                ? "Variants Summary"
                : "Item Summary"}
            </h4>

            {formData.condition === "New" ? (
              <div className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Variant</th>
                      <th className="p-3">Image</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.variants.map((v, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 border-slate-100 dark:border-slate-800"
                      >
                        <td className="p-3 font-medium">
                          {Object.values(v.attributes).join(" / ")}
                        </td>
                        <td className="p-3">
                          {v.images && v.images.length > 0 ? (
                            <img
                              src={v.images[0].url}
                              alt="Var"
                              className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 object-cover"
                            />
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-3">₹{v.sellingPrice}</td>
                        <td className="p-3">{v.stock || 0}</td>
                        <td className="p-3 font-mono text-xs">
                          {v.sku || "Auto-gen"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold">
                      Price
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${formData.sellingPrice}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold">
                      MRP
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      ${formData.actualPrice}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold">
                      Condition
                    </span>
                    <span className="text-amber-600 font-medium">
                      {formData.conditionGrade}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-bold">
                      Identifiers
                    </span>
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formData.imei
                        ? `IMEI: ${formData.imei}`
                        : formData.serialNumber
                          ? `SN: ${formData.serialNumber}`
                          : "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-bold mb-1">
                    Description
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{formData.conditionDescription || "No specific notes"}"
                  </p>
                </div>
              </div>
            )}

            {formData.condition === "New" && formData.variants.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                No variants generated. Please go back to Step 2.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  // -- Batch-upload all pending local images before publish --
  const uploadPendingImages = async (images) => {
    return Promise.all(
      images.map(async (img) => {
        if (img.uploaded) return img; // already on Cloudinary
        const blob =
          img.blob instanceof Blob
            ? img.blob
            : await fetch(img.url).then((r) => r.blob());
        const result = await uploadBlob(blob);
        if (result) {
          // Revoke the old local blob URL
          if (img.url?.startsWith("blob:")) URL.revokeObjectURL(img.url);
          return { url: result.url, isMain: img.isMain, uploaded: true };
        }
        return img; // keep as-is if upload failed (handleSubmit will catch)
      }),
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading(
      isEditMode ? "Updating product..." : "Publishing product...",
    );
    try {
      // ── Step 1: Upload all local images to Cloudinary in parallel ──
      toast.loading("Uploading images...", { id: toastId });
      const uploadedCommon = await uploadPendingImages(formData.images);
      const uploadedVariants = await Promise.all(
        formData.variants.map(async (v) => ({
          ...v,
          images: await uploadPendingImages(v.images || []),
        })),
      );

      // Replace local state with real URLs so UI stays consistent
      setFormData((prev) => ({
        ...prev,
        images: uploadedCommon,
        variants: uploadedVariants,
      }));

      toast.loading(
        isEditMode ? "Updating product..." : "Publishing product...",
        { id: toastId },
      );

      let payload = {
        name: formData.title,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        isActive: true,
        condition: formData.condition,
        inventoryType: formData.condition === "New" ? "Quantity" : "Unique",
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        specifications: formData.specifications,
      };

      const sortMain = (imgs) =>
        [...imgs].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
      // Strip internal fields before sending
      const toApiImgs = (imgs) =>
        sortMain(imgs).map(({ url, isMain }) => ({ url, isMain }));

      if (formData.condition === "New") {
        payload.variantAttributes = formData.options;
        payload.images = toApiImgs(uploadedCommon);
        payload.variants = uploadedVariants.map((v) => ({
          title: `${formData.title} - ${Object.values(v.attributes).join(" ")}`,
          attributes: v.attributes,
          sellingPrice: Number(v.sellingPrice),
          actualPrice: Number(v.actualPrice),
          compareAtPrice: Number(v.actualPrice), // MRP for discount calculation
          stock: Number(v.stock),
          sku:
            v.sku ||
            `${formData.brand}-${Object.values(v.attributes).join("-")}-${Date.now()}`.toUpperCase(),
          inventoryType: "Quantity",
          condition: "New",
          warranty: v.warranty || "",
          images:
            v.images && v.images.length > 0
              ? toApiImgs(v.images)
              : toApiImgs(uploadedCommon),
          isDefault: false,
        }));
        if (payload.variants.length > 0) payload.variants[0].isDefault = true;
      } else {
        payload.variantAttributes = [{ name: "Type", values: ["Single Unit"] }];
        payload.images = toApiImgs(uploadedCommon);
        payload.variants = [
          {
            title: `${formData.title} - ${formData.conditionGrade}`,
            attributes: { Type: "Single Unit" },
            sellingPrice: Number(formData.sellingPrice),
            actualPrice: Number(formData.actualPrice),
            compareAtPrice: Number(formData.actualPrice), // MRP for discount calculation
            stock: 1,
            sku: formData.sku || `ITEM-${Date.now()}`,
            inventoryType: "Unique",
            condition: formData.condition,
            warranty: formData.warranty || "",
            images: toApiImgs(uploadedCommon),
            isDefault: true,
            imei: formData.imei,
            serialNumber: formData.serialNumber,
            conditionGrade: formData.conditionGrade,
            conditionDescription: formData.conditionDescription,
          },
        ];
      }

      let response;
      if (isEditMode) {
        response = await productService.update(productId, payload);
      } else {
        response = await productService.create(payload);
      }

      if (response.success) {
        toast.success(
          isEditMode
            ? "Product Updated Successfully!"
            : "Product Created Successfully!",
          { id: toastId },
        );
        // Navigate to products page and force refresh to show new product
        router.push("/products");
        router.refresh();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (isEditMode ? "Failed to update product" : "Failed to create product");
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Validation for Step 2
  const canProceedToStep3 = () => {
    if (formData.condition === "New") {
      // Variants are optional — user can proceed without them if no options were added
      // If options were added, they must have generated at least one variant
      return formData.options.length === 0 || formData.variants.length > 0;
    } else {
      // For Used/Refurbished, check required single item fields
      return (
        formData.sellingPrice &&
        formData.conditionGrade &&
        (formData.imei || formData.serialNumber) // at least one identifier
      );
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEditMode
                ? "Update product details and variants"
                : "Fill in product details to create a new listing"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/products")}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Stepper */}
        {renderStepper()}

        {/* Step Content */}
        <div className="mb-20">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Floating Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((curr) => Math.max(1, curr - 1))}
              disabled={currentStep === 1}
            >
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  /* Save Draft */
                }}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (currentStep === 4) {
                    handleSubmit();
                  } else {
                    setCurrentStep((curr) => curr + 1);
                  }
                }}
                disabled={
                  (currentStep === 1 && !canProceedToStep2()) ||
                  (currentStep === 2 && !canProceedToStep3()) ||
                  loading
                }
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" className="text-white" />
                    <span>Publishing...</span>
                  </div>
                ) : currentStep === 4 ? (
                  "Publish Product"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {cropModal && (
        <ImageCropModal
          src={cropModal.src}
          onConfirm={cropModal.onConfirm}
          onClose={() => {
            URL.revokeObjectURL(cropModal.src);
            setCropModal(null);
          }}
        />
      )}
    </AdminLayout>
  );
}

export default function AddProduct() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <AddProductContent />
    </Suspense>
  );
}

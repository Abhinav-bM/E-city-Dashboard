"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // -- Product Essentials State --
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [category, setCategory] = useState("Smartphones");
  const [description, setDescription] = useState("");
  const [codEnabled, setCodEnabled] = useState(true);

  // -- Variants State --
  // Simplified for MVP: Single Variant Flow or basic list?
  // Design shows "Color Options" and "Storage Options" checkboxes.
  // This implies we are generating combinations.
  // For the "Refurbished Flow", we usually focus on ONE Variant at a time or manage units per variant.
  // The design "Inventory Configuration" panel seems to be context-aware.
  // Let's assume for this UI we are adding a SINGLE Variant Product or a specific configuration.
  // To match the complex design: Let's support selecting ONE set of attributes for the "Smart Entry".
  const [selectedColor, setSelectedColor] = useState("Space Black");
  const [selectedStorage, setSelectedStorage] = useState("256GB");

  // -- Inventory State --
  const [inventoryMode, setInventoryMode] = useState("new"); // 'new' | 'refurbished'
  const [units, setUnits] = useState([]); // List of unique units to add

  // -- New Unit Form State --
  const [newUnit, setNewUnit] = useState({
    imei: "",
    grade: "Grade A",
    priceOverride: "",
    photos: [], // Mocking photo upload for now
  });

  const handleAddUnit = () => {
    if (!newUnit.imei) return;
    setUnits([...units, { ...newUnit, id: Date.now() }]);
    setNewUnit({ imei: "", grade: "Grade A", priceOverride: "", photos: [] });
  };

  const handleRemoveUnit = (id) => {
    setUnits(units.filter((u) => u.id !== id));
  };

  const calculateStockValue = () => {
    // Sum of overrides or base price
    return units.reduce(
      (acc, unit) => acc + (Number(unit.priceOverride) || 0),
      0,
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Create Base Product & Variant
      // Note: This is a simplified payload matching the specific "Smart Entry" flow
      // In a real app, we'd generate all combinations. Here we create ONE variant setup.
      const payload = {
        name: title,
        brand,
        category,
        description,
        variantAttributes: [
          { name: "Color", values: [selectedColor] },
          { name: "Storage", values: [selectedStorage] },
        ],
        variants: [
          {
            attributes: { Color: selectedColor, Storage: selectedStorage },
            sellingPrice: Number(newUnit.priceOverride) || 999, // Base price
            stock: inventoryMode === "new" ? 100 : 0, // Mock stock for new
            inventoryType: inventoryMode === "new" ? "Quantity" : "Unique",
            status: "Active",
            sku: `${brand}-${selectedColor}-${selectedStorage}-${Date.now()}`,
          },
        ],
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/product/create-product",
        payload,
      );
      const createdVariant = data.data.productDetails.variants[0];

      // 2. If Refurbished, Add Units
      if (inventoryMode === "refurbished" && units.length > 0) {
        // Sequentially add units
        for (const unit of units) {
          await axios.post("http://localhost:5000/api/inventory/add", {
            productVariantId: createdVariant._id,
            itemType: "Refurbished",
            imei: unit.imei,
            serialNumber: unit.imei, // Using IMEI as Serial for now
            conditionGrade: unit.grade,
            priceOverride: Number(unit.priceOverride),
            conditionGrade: unit.grade,
            priceOverride: Number(unit.priceOverride),
            uniqueImages: (unit.photos || []).map((url) => ({ url })),
          });
        }
      }

      alert("Product Published Successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-text-secondary mb-2">
          <a href="/" className="hover:text-primary transition-colors">
            Dashboard
          </a>
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          <span className="text-slate-900 dark:text-white font-medium">
            Add Product
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
              Add New Product
            </h1>
            <p className="text-slate-500 dark:text-text-secondary">
              Smart Entry Flow for new and refurbished electronics.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Tooltip
              content="Create product and update inventory"
              position="left"
            >
              <Button
                variant="primary"
                icon="publish"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Publishing..." : "Save & Publish"}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT PANE: Product Essentials */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <Card title="Product Essentials" icon="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <Input
                label="Product Name"
                placeholder="e.g. iPhone 14 Pro Max"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-text-secondary mb-1.5 block">
                  Brand
                </span>
                <select
                  className="w-full bg-slate-50 dark:bg-[#111a22] border border-slate-300 dark:border-surface-border rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option>Apple</option>
                  <option>Samsung</option>
                  <option>Google</option>
                </select>
              </label>
            </div>
            <label className="block mb-5">
              <span className="text-sm font-medium text-slate-700 dark:text-text-secondary mb-1.5 block">
                Description
              </span>
              <textarea
                className="w-full bg-slate-50 dark:bg-[#111a22] border border-slate-300 dark:border-surface-border rounded-lg p-4 min-h-[120px] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 dark:placeholder-gray-600 outline-none"
                placeholder="Enter detailed product description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </label>
          </Card>

          <Card title="Payment Rules" icon="payments">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111a22] rounded-lg border border-slate-200 dark:border-surface-border">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Cash on Delivery (COD)
                </p>
                <p className="text-xs text-slate-500 dark:text-text-secondary mt-1">
                  Enable COD for this product. High-value items usually disable
                  this.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </Card>
        </div>

        {/* RIGHT PANE: Inventory Configuration */}
        <div className="xl:col-span-5 flex flex-col h-full">
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-border shadow-sm flex flex-col h-full relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-[#131d27]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Inventory Configuration
              </h3>
              <div className="bg-slate-200 dark:bg-[#111a22] p-1 rounded-lg flex relative">
                <Tooltip
                  content="Track bulk stock (e.g., 100 units)"
                  position="top"
                >
                  <button
                    className={`flex-1 py-2 text-sm font-bold rounded-md z-10 transition-colors ${inventoryMode === "new" ? "bg-white shadow text-slate-900" : "text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white"}`}
                    onClick={() => setInventoryMode("new")}
                  >
                    New Condition
                  </button>
                </Tooltip>

                <Tooltip
                  content="Track individual items by IMEI/Serial"
                  position="top"
                >
                  <button
                    className={`flex-1 py-2 text-sm font-bold rounded-md z-10 transition-colors flex items-center justify-center gap-2 ${inventoryMode === "refurbished" ? "bg-primary text-white shadow-md" : "text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white"}`}
                    onClick={() => setInventoryMode("refurbished")}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      recycling
                    </span>
                    Refurbished
                  </button>
                </Tooltip>
              </div>
              {inventoryMode === "refurbished" && (
                <div className="mt-4 flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <span className="material-symbols-outlined text-[20px]">
                    lightbulb
                  </span>
                  <p className="text-xs font-medium">
                    Refurbished mode active. Each unit is tracked by unique IMEI
                    & Photos.
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[800px]">
              {inventoryMode === "refurbished" ? (
                <>
                  {/* Add Unit Entry Form */}
                  <div className="border-2 border-primary bg-primary/5 rounded-lg p-4 relative group">
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
                          IMEI / Serial Number
                        </label>
                        <div className="relative">
                          <input
                            className="font-mono w-full bg-white dark:bg-[#111a22] border border-primary/50 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                            type="text"
                            value={newUnit.imei}
                            onChange={(e) =>
                              setNewUnit({ ...newUnit, imei: e.target.value })
                            }
                            placeholder="Scan or Enter IMEI..."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
                            Grade
                          </label>
                          <select
                            className="w-full bg-white dark:bg-[#111a22] border border-primary/50 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                            value={newUnit.grade}
                            onChange={(e) =>
                              setNewUnit({ ...newUnit, grade: e.target.value })
                            }
                          >
                            <option>Grade A</option>
                            <option>Grade B</option>
                            <option>Grade C</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
                            Price Override
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500 dark:text-text-secondary text-sm">
                              $
                            </span>
                            <input
                              className="w-full bg-white dark:bg-[#111a22] border border-primary/50 rounded pl-6 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-medium"
                              type="number"
                              value={newUnit.priceOverride}
                              onChange={(e) =>
                                setNewUnit({
                                  ...newUnit,
                                  priceOverride: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Image Upload for Unit */}
                      <div className="mb-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
                          Unit Photos
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-slate-100 dark:bg-[#111a22] border border-dashed border-primary/50 rounded-lg p-3 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 group/upload">
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Upload immediately
                                const formData = new FormData();
                                formData.append("image", file);

                                try {
                                  const { data } = await axios.post(
                                    "http://localhost:5000/api/upload/upload",
                                    formData,
                                    {
                                      headers: {
                                        "Content-Type": "multipart/form-data",
                                      },
                                    },
                                  );
                                  if (data.success) {
                                    setNewUnit((prev) => ({
                                      ...prev,
                                      photos: [...prev.photos, data.data.url],
                                    }));
                                  }
                                } catch (err) {
                                  alert("Upload failed");
                                  console.error(err);
                                }
                              }}
                            />
                            <span className="material-symbols-outlined text-primary group-hover/upload:scale-110 transition-transform">
                              add_a_photo
                            </span>
                            <span className="text-xs font-medium text-primary">
                              Upload
                            </span>
                          </label>

                          {/* Previews */}
                          <div className="flex gap-2 overflow-x-auto">
                            {newUnit.photos.map((url, idx) => (
                              <div
                                key={idx}
                                className="h-12 w-12 rounded border border-slate-200 dark:border-surface-border bg-cover bg-center relative group/preview"
                                style={{ backgroundImage: `url(${url})` }}
                              >
                                <button
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/preview:opacity-100 transition-opacity"
                                  onClick={() =>
                                    setNewUnit((prev) => ({
                                      ...prev,
                                      photos: prev.photos.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    }))
                                  }
                                >
                                  <span className="material-symbols-outlined text-[10px] block">
                                    close
                                  </span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={handleAddUnit}
                    >
                      Add This Unit
                    </Button>
                  </div>

                  {/* List of Added Units */}
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className="border border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-[#131d27] rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="warning">{unit.grade}</Badge>
                          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                            IMEI: {unit.imei}
                          </span>
                        </div>
                        <button
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => handleRemoveUnit(unit.id)}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          ${unit.priceOverride}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2">
                    inventory_2
                  </span>
                  <p>Standard Quantity Tracking Enabled</p>
                  <Input
                    type="number"
                    label="Total Stock Quantity"
                    className="mt-4"
                    defaultValue="100"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500 dark:text-text-secondary">
                  Total Unique Units
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {inventoryMode === "refurbished" ? units.length : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-text-secondary">
                  Estimated Stock Value
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ${calculateStockValue()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

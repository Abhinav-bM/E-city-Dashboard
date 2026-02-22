"use client";
import React, { useState } from "react";
import { Steps, Button, message, theme } from "antd";
import BasicInfoStep from "./steps/BasicInfoStep";
import AttributeStep from "./steps/AttributeStep";
import ReviewStep from "./steps/ReviewStep";
import { useSearchParams, useRouter } from "next/navigation";
import {
  addProduct,
  updateProduct,
  getProductByBaseId,
} from "../../../api/product";
import uploadService from "@/services/uploadService";

const AddProductPage = () => {
  const {} = theme.useToken();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState(null);

  // Central State for Product Creation
  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    images: [], // Backend expects [{url: '...'}]
    fileList: [], // UI state for uploads
    tempImageUrl: "", // UI state for URL input
    variantAttributes: [],
    variants: [],
  });

  // Check for Edit Mode
  React.useEffect(() => {
    const edit = searchParams.get("edit");
    const id = searchParams.get("id");
    if (edit === "true" && id) {
      setIsEditMode(true);
      setProductId(id);
      fetchProductData(id);
    }
  }, [searchParams]);

  const fetchProductData = async (id) => {
    try {
      setLoading(true);
      const data = await getProductByBaseId(id);
      if (data) {
        // Map backend data to frontend state
        setProductData({
          name: data.baseProduct.title,
          brand: data.baseProduct.brand,
          category:
            typeof data.baseProduct.category === "object"
              ? data.baseProduct.category._id
              : data.baseProduct.category,
          description: data.baseProduct.description,
          images: data.baseProduct.images || [],
          fileList: [],
          tempImageUrl: "",
          variantAttributes: data.baseProduct.variantAttributes || [],
          variants:
            data.availableVariants.map((v) => ({
              ...v,
              key: v._id || Date.now() + Math.random(), // Ensure key exists
              // Ensure attributes are flat object
              attributes: v.attributes,
            })) || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      message.error("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  // Boring Steps
  const next = () => {
    // Basic Validation Check (Boring/Predictable)
    if (current === 0) {
      if (!productData && !productData.name) {
        // Safety check
        return;
      }
    }
    if (current === 1) {
      if (productData.variants.length === 0) {
        message.warning("Please generate at least one variant.");
        return;
      }
    }
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  // The Final Submit Action
  const handleSubmit = async () => {
    setLoading(true);
    const actionText = isEditMode ? "Updating" : "Creating";
    message.loading({ content: `${actionText} product...`, key: "create" });

    // PREPARE DATA FOR BACKEND
    // 1. Handle Images: If we have fileList, we mock upload by converting to base64 or just using name for now.
    // If we have tempImageUrl, we use that.
    let finalImages = [...productData.images]; // Start with existing images

    if (productData.tempImageUrl) {
      finalImages.push({ url: productData.tempImageUrl });
    }

    // Process fileList (Real Upload)
    if (productData.fileList && productData.fileList.length > 0) {
      try {
        const uploadPromises = productData.fileList.map((file) => {
          const formData = new FormData();
          formData.append("image", file.originFileObj);
          return uploadService.uploadImage(formData);
        });

        const responses = await Promise.all(uploadPromises);

        responses.forEach((res) => {
          if (res && res.url) {
            finalImages.push({ url: res.url });
          }
        });
      } catch (error) {
        console.error("Image upload failed:", error);
        message.error("Failed to upload images. Please try again.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      name: productData.name, // Service expects 'name' and maps it to 'title'
      brand: productData.brand,
      description: productData.description,
      category: productData.category,
      images: finalImages,
      variantAttributes: productData.variantAttributes.map((attr) => ({
        name: attr.name,
        values: attr.values,
      })),
      // Variants might need mapping too depending on Step 2 output
      // Our AttributeStep generates them reasonably well, but let's ensure structure.
      variants: productData.variants,
    };

    try {
      // Send the payload
      console.log("Sending Payload:", payload);
      let response;

      if (isEditMode && productId) {
        response = await updateProduct(productId, payload);
      } else {
        response = await addProduct(payload);
      }

      if (response && response.success) {
        message.success({
          content: `Product ${isEditMode ? "updated" : "created"} successfully!`,
          key: "create",
        });
        // Reset form or Redirect
        setTimeout(() => {
          router.push("/products");
        }, 1000);
      } else {
        message.error({
          content: `Failed to ${isEditMode ? "update" : "create"} product. Check console.`,
          key: "create",
        });
      }
    } catch (error) {
      console.error("Creation Error:", error);
      message.error({
        content: error.message || "Boring error message: Something broke.",
        key: "create",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "General Info",
      content: <BasicInfoStep data={productData} updateData={setProductData} />,
    },
    {
      title: "Attributes & Variants",
      content: <AttributeStep data={productData} updateData={setProductData} />,
    },
    {
      title: "Review & Publish",
      content: (
        <ReviewStep
          data={productData}
          updateData={setProductData}
          submit={handleSubmit}
        />
      ),
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle = {
    marginTop: 24,
    minHeight: 400,
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
          gap: 16,
        }}
      >
        {current > 0 && (
          <Button size="large" onClick={() => prev()}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" size="large" onClick={() => next()}>
            Next Step
          </Button>
        )}
        {/* Submit is handled inside ReviewStep for specific UX, or we can move it here for "Boring" consistency.
              Let's keep it distributed for now as ReviewStep has specific "Add Unique" actions that might distract from a global button.
           */}
      </div>
    </div>
  );
};

export default AddProductPage;

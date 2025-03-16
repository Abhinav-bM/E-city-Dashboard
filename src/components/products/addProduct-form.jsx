"use client";

import { addProduct } from "@/api/product";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Upload,
  Select,
  InputNumber,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
const { TextArea } = Input;

const AddProductForm = () => {
  const [form] = Form.useForm();
  const [prodImages, setProdImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Watch for changes in variantAttributes to dynamically generate selection fields in variants
  const variantAttributes = Form.useWatch("variantAttributes", form) || [];

  // Reusable function for uploading to cloudinary
  const uploadToCloudinary = async ({ file }) => {
    const cloudName = "drsbpinni";
    const uploadPreset = "product-images";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      setUploading(true);
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();

      if (data.secure_url) {
        console.log("Image upload successful");
        return { url: data.secure_url };
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Upload Error :", err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Custom request handler for main product images
  const handleProductImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const imageData = await uploadToCloudinary({ file });

      setProdImages((prevImages) => [...prevImages, imageData]);
      onSuccess?.(imageData, file);
    } catch (err) {
      message.error("Failed to upload image");
      onError?.(err);
    }
  };

  // Custom request handler for variant images
  const handleVariantImageUpload = async ({ file, variantIndex }) => {
    try {
      const imageData = await uploadToCloudinary({ file });

      // Get current variants
      const variants = form.getFieldValue("variants") || [];
      const variantImages = variants[variantIndex]?.images || [];

      // Ensuring images are sorted as object with url property
      const updatedImages = [
        ...variantImages.map((img) =>
          typeof img === "string" ? { url: img } : img
        ),
        imageData,
      ];

      // Update the form
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        images: updatedImages,
      };

      form.setFieldsValue({ variants: updatedVariants });
      message.success("Variant image uploaded successfully");
    } catch (err) {
      message.error("Failed to upload variant image");
    }
  };

  // Form submission
  const _handleFormFinish = async (values) => {
    console.log("Product form values:", values);

    try {
      // Transform form data to match the schema
      const transformedVariantAttributes = values.variantAttributes.map(
        (attr) => ({
          name: attr.name,
          values: attr.options, // Rename options to values to match schema
        })
      );

      // Transform variants to match schema structure
      const transformedVariants = values.variants.map((variant) => {
        const { sku, price, stock, images = [], attributes = {} } = variant;

        // Ensure images are in the correct format
        const formattedImages = Array.isArray(images)
          ? images.map((img) => (typeof img === "string" ? { url: img } : img))
          : [];
        return {
          sku,
          price,
          stock,
          images: formattedImages,
          attributes,
        };
      });

      const productData = {
        ...values,
        images: prodImages,
        variantAttributes: transformedVariantAttributes,
        variants: transformedVariants,
      };

      const response = await addProduct(productData);
      console.log("Response from backend:", response);
      if (response.status) {
        message.success("Product added successfully");
        form.resetFields();
        setProdImages([]);

        setTimeout(() => {
          router.push("/products/allProducts");
        }, 500);
      } else {
        throw new Error(response.message || "Failed to add product");
      }
    } catch (error) {
      message.error(
        "Failed to add product: " + (error.message || "Unknown error")
      );
    }
  };

  return (
    <Card title="Add New Product" className="!w-full">
      <Form
        form={form}
        layout="vertical"
        name="product-form"
        onFinish={_handleFormFinish}
        initialValues={{
          variantAttributes: [],
          variants: [],
        }}
      >
        {/* Basic Product Details */}
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true, message: "Product name is required" }]}
        >
          <Input />
        </Form.Item>

        <div className="flex w-full gap-5">
          <Form.Item
            label="Brand"
            name="brand"
            rules={[{ required: true, message: "Brand is required" }]}
            className=" w-full"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
            className="w-full"
          >
            <Select placeholder="Select category">
              {["Smartphone", "Tablet", "Laptop", "Desktop", "Accessories"].map(
                (cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Base Price"
            name="basePrice"
            rules={[{ required: true, message: "Please enter the base price" }]}
            className="w-full"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        {/* Product Images */}
        <Form.Item
          label="Product Images"
          rules={[
            {
              validator: () => {
                if (prodImages.length === 0) {
                  return Promise.reject("Product images are required");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Upload
            listType="picture-card"
            customRequest={handleProductImageUpload}
            fileList={prodImages.map((img, idx) => ({
              uid: `-${idx}`,
              name: `image-${idx}`,
              status: "done",
              url: img.url,
            }))}
            onRemove={(file) => {
              const newImages = prodImages.filter(
                (img) => img.url !== file.url
              );
              setProdImages(newImages);
            }}
            disabled={uploading}
            accept="image/*"
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <Button icon={<PlusOutlined />}>Upload</Button>
            )}
          </Upload>
        </Form.Item>

        {/* Variant Attributes */}
        <Form.List name="variantAttributes">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex gap-2 items-center">
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[
                      { required: true, message: "Attribute name required" },
                    ]}
                  >
                    <Input placeholder="Attribute (e.g., Color , Ram , Rom)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "options"]}
                    rules={[{ required: true, message: "Options required" }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="Options (e.g., Red, Blue)"
                    />
                  </Form.Item>
                  <Button
                    onClick={() => remove(name)}
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                  />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Variant Attribute
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Variants */}
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name: variantIndex, ...restField }) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 16,
                    border: "1px solid #ccc",
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <h3>Variant {variantIndex + 1}</h3>
                  <Form.Item
                    {...restField}
                    name={[variantIndex, "sku"]}
                    label="SKU"
                    rules={[{ required: true, message: "SKU is required" }]}
                  >
                    <Input placeholder="Unique SKU" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[variantIndex, "price"]}
                    label="Price"
                    rules={[{ required: true, message: "Price is required" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="Variant Price"
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[variantIndex, "stock"]}
                    label="Stock"
                    rules={[{ required: true, message: "Stock is required" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="Available Stock"
                    />
                  </Form.Item>

                  {/* Variant Images */}
                  {/* <Form.Item
                    {...restField}
                    name={[variantIndex, "images"]}
                    label="Variant Images"
                    rules={[
                      {
                        required: true,
                        message: "At least one image is required",
                      },
                    ]}
                  >
                    <Upload
                      listType="picture-card"
                      customRequest={({ file, onSuccess, onError }) => {
                        const uploadedFile = file;
                        handleVariantImageUpload(uploadedFile, variantIndex)
                          .then(() => onSuccess?.({}, uploadedFile))
                          .catch((err) => onError?.(err));
                      }}
                      fileList={(
                        form.getFieldValue([
                          "variants",
                          variantIndex,
                          "images",
                        ]) || []
                      ).map((img, idx) => {
                        const imageUrl =
                          typeof img === "string" ? img : img.url;
                        return {
                          uid: `-${idx}`,
                          name: `variant-image-${idx}`,
                          status: "done",
                          url: imageUrl,
                        };
                      })}
                      onRemove={(file) => {
                        // Get current images
                        const currentVariants =
                          form.getFieldValue("variants") || [];
                        const currentImages =
                          currentVariants[variantIndex]?.images || [];

                        // Filter out the removed image
                        const filteredImages = currentImages.filter(
                          (img, idx) => {
                            const imageUrl =
                              typeof img === "string" ? img : img.url;
                            return imageUrl !== file.url;
                          }
                        );

                        // Update form
                        const updatedVariants = [...currentVariants];
                        updatedVariants[variantIndex] = {
                          ...updatedVariants[variantIndex],
                          images: filteredImages,
                        };

                        form.setFieldsValue({ variants: updatedVariants });
                      }}
                      disabled={uploading}
                    >
                      {uploading ? (
                        "Uploading..."
                      ) : (
                        <Button icon={<PlusOutlined />}>Upload</Button>
                      )}{" "}
                    </Upload>
                  </Form.Item> */}

                  {/* Dynamically render attribute selectors */}
                  {variantAttributes.map((attr, idx) => (
                    <Form.Item
                      key={idx}
                      label={attr.name || `Attribute ${idx + 1}`}
                      name={[variantIndex, "attributes", attr.name]}
                      rules={[
                        {
                          required: true,
                          message: `Please select ${attr.name}`,
                        },
                      ]}
                    >
                      <Select placeholder={`Select ${attr.name}`}>
                        {(attr.options || []).map((opt) => (
                          <Select.Option key={opt} value={opt}>
                            {opt}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ))}

                  <Button
                    onClick={() => remove(variantIndex)}
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                  >
                    Remove Variant
                  </Button>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add Variant
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea rows={4} placeholder="Product description..." />
        </Form.Item>

        <Button
          type="primary"
          size="large"
          htmlType="submit"
          disabled={uploading}
        >
          Add Product
        </Button>
      </Form>
    </Card>
  );
};

export default AddProductForm;

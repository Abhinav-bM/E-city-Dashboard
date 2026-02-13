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
  Collapse,
  Empty,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
const { TextArea } = Input;

// Image Selector Component for Variants
const VariantImageSelector = ({ form, variantIndex, prodImages }) => {
  // Watch the variant images to reactively update the UI
  const variantImages =
    Form.useWatch(["variants", variantIndex, "images"], form) || [];

  const handleImageToggle = (img) => {
    const variants = form.getFieldValue("variants") || [];
    const currentVariantImages = variants[variantIndex]?.images || [];

    const isSelected = currentVariantImages.some(
      (selectedImg) =>
        (typeof selectedImg === "string" ? selectedImg : selectedImg?.url) ===
        img.url,
    );

    let updatedImages;
    if (isSelected) {
      // Remove image if already selected
      updatedImages = currentVariantImages.filter(
        (selectedImg) =>
          (typeof selectedImg === "string" ? selectedImg : selectedImg?.url) !==
          img.url,
      );
    } else {
      // Add image if not selected
      updatedImages = [
        ...currentVariantImages.map((selectedImg) =>
          typeof selectedImg === "string" ? { url: selectedImg } : selectedImg,
        ),
        img,
      ];
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: updatedImages,
    };

    form.setFieldsValue({
      variants: updatedVariants,
    });
  };

  if (prodImages.length === 0) {
    return (
      <Empty
        description="Please upload product images first"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
      {prodImages.map((img, imgIndex) => {
        const isSelected = variantImages.some(
          (selectedImg) =>
            (typeof selectedImg === "string"
              ? selectedImg
              : selectedImg?.url) === img.url,
        );

        return (
          <div
            key={imgIndex}
            className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
              isSelected
                ? "border-blue-500 ring-2 ring-blue-300"
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => handleImageToggle(img)}
          >
            <img
              src={img.url}
              alt={`Product image ${imgIndex + 1}`}
              className="w-full h-24 object-cover"
            />
            {isSelected && (
              <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

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
  // const handleVariantImageUpload = async ({ file, variantIndex }) => {
  //   try {
  //     const imageData = await uploadToCloudinary({ file });

  //     // Get current variants
  //     const variants = form.getFieldValue("variants") || [];
  //     const variantImages = variants[variantIndex]?.images || [];

  //     // Ensuring images are sorted as object with url property
  //     const updatedImages = [
  //       ...variantImages.map((img) =>
  //         typeof img === "string" ? { url: img } : img
  //       ),
  //       imageData,
  //     ];

  //     // Update the form
  //     const updatedVariants = [...variants];
  //     updatedVariants[variantIndex] = {
  //       ...updatedVariants[variantIndex],
  //       images: updatedImages,
  //     };

  //     form.setFieldsValue({ variants: updatedVariants });
  //     message.success("Variant image uploaded successfully");
  //   } catch (err) {
  //     message.error("Failed to upload variant image");
  //   }
  // };

  // Form submission
  const _handleFormFinish = async (values) => {
    console.log("Product form values:", values);

    try {
      // Transform form data to match the schema
      const transformedVariantAttributes = values.variantAttributes.map(
        (attr) => ({
          name: attr.name,
          values: attr.options, // Rename options to values to match schema
        }),
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

        router.push("/products/all");
      } else {
        throw new Error(response.message || "Failed to add product");
      }
    } catch (error) {
      message.error(
        "Failed to add product: " + (error.message || "Unknown error"),
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
          specifications: [],
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
                ),
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Actual Price"
            name="basePrice"
            rules={[
              { required: true, message: "Please enter the actual price" },
            ]}
            className="w-full"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Selling Price"
            name="selling_price"
            rules={[
              { required: true, message: "Please enter the selling price" },
            ]}
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
                (img) => img.url !== file.url,
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
                <div key={key} className="flex gap-2 w-full items-center">
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[
                      { required: true, message: "Attribute name required" },
                    ]}
                    className=" w-full !m-0"
                  >
                    <Input
                      width={100}
                      placeholder="Attribute (e.g., Color , Ram , Rom)"
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "options"]}
                    rules={[{ required: true, message: "Options required" }]}
                    className="w-full !m-0"
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
                    size="large"
                    icon={<MinusCircleOutlined />}
                  />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  className=" mt-2"
                >
                  Add Variant Attribute
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Specifications */}
        <div className="border p-4 rounded-lg mb-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            Detailed Specifications
          </h3>
          <Form.List name="specifications">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-4">
                {fields.map(({ key, name: groupIndex, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    title={
                      <div className="flex justify-between items-center">
                        <span>Specification Group {groupIndex + 1}</span>
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(groupIndex)}
                          icon={<MinusCircleOutlined />}
                        >
                          Remove Group
                        </Button>
                      </div>
                    }
                  >
                    <Form.Item
                      {...restField}
                      name={[groupIndex, "group"]}
                      label="Group Name"
                      rules={[
                        { required: true, message: "Group name is required" },
                      ]}
                    >
                      <Input placeholder="e.g., Display, Camera, Processor" />
                    </Form.Item>

                    {/* Nested Items List */}
                    <Form.List name={[groupIndex, "items"]}>
                      {(itemFields, { add: addItem, remove: removeItem }) => (
                        <>
                          {itemFields.map(
                            ({
                              key: itemKey,
                              name: itemIndex,
                              ...itemRest
                            }) => (
                              <div
                                key={itemKey}
                                className="flex gap-2 items-center mb-2"
                              >
                                <Form.Item
                                  {...itemRest}
                                  name={[itemIndex, "key"]}
                                  rules={[{ required: true, message: "Req" }]}
                                  className="mb-0 flex-1"
                                >
                                  <Input placeholder="Key (e.g., Resolution)" />
                                </Form.Item>
                                <Form.Item
                                  {...itemRest}
                                  name={[itemIndex, "value"]}
                                  rules={[{ required: true, message: "Req" }]}
                                  className="mb-0 flex-1"
                                >
                                  <Input placeholder="Value (e.g., 1080p)" />
                                </Form.Item>
                                <Button
                                  type="text"
                                  danger
                                  onClick={() => removeItem(itemIndex)}
                                  icon={<MinusCircleOutlined />}
                                />
                              </div>
                            ),
                          )}
                          <Button
                            type="dashed"
                            onClick={() => addItem()}
                            block
                            icon={<PlusOutlined />}
                            size="small"
                          >
                            Add Spec Item
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Specification Group
                </Button>
              </div>
            )}
          </Form.List>
        </div>

        {/* Variants */}
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              <Collapse
                items={fields.map(
                  ({ key, name: variantIndex, ...restField }) => ({
                    key: key,
                    label: `Variant ${variantIndex + 1}`,
                    children: (
                      <div className="flex flex-col w-full gap-4">
                        {/* Variant Images */}
                        <Form.Item
                          {...restField}
                          name={[variantIndex, "images"]}
                          label="Variant Images"
                          rules={[
                            {
                              required: true,
                              message: "At least one image is required",
                            },
                          ]}
                          className="w-full"
                        >
                          <VariantImageSelector
                            form={form}
                            variantIndex={variantIndex}
                            prodImages={prodImages}
                          />
                        </Form.Item>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* SKU */}
                          <Form.Item
                            {...restField}
                            name={[variantIndex, "sku"]}
                            label="SKU"
                            rules={[
                              { required: true, message: "SKU is required" },
                            ]}
                          >
                            <Input placeholder="Unique SKU" />
                          </Form.Item>

                          {/* Price */}
                          <Form.Item
                            {...restField}
                            name={[variantIndex, "price"]}
                            label="Price"
                            rules={[
                              { required: true, message: "Price is required" },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: "100%" }}
                              placeholder="Variant Price"
                            />
                          </Form.Item>

                          {/* Stock */}
                          <Form.Item
                            {...restField}
                            name={[variantIndex, "stock"]}
                            label="Stock"
                            rules={[
                              { required: true, message: "Stock is required" },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: "100%" }}
                              placeholder="Available Stock"
                            />
                          </Form.Item>

                          {/* Warranty */}
                          <Form.Item
                            {...restField}
                            name={[variantIndex, "warranty"]}
                            label="Warranty"
                          >
                            <Input placeholder="e.g. 1 Year" />
                          </Form.Item>
                        </div>

                        {/* Dynamic Attributes */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg">
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
                              className="mb-0"
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
                        </div>

                        {/* Condition & Inventory Type */}
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            {...restField}
                            name={[variantIndex, "condition"]}
                            label="Condition"
                            initialValue="New"
                          >
                            <Select>
                              <Select.Option value="New">New</Select.Option>
                              <Select.Option value="Open Box">
                                Open Box
                              </Select.Option>
                              <Select.Option value="Refurbished">
                                Refurbished
                              </Select.Option>
                              <Select.Option value="Used">Used</Select.Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[variantIndex, "inventoryType"]}
                            label="Inventory Type"
                            initialValue="Quantity"
                          >
                            <Select>
                              <Select.Option value="Quantity">
                                Quantity (Standard)
                              </Select.Option>
                              <Select.Option value="Unique">
                                Unique (Serial/IMEI)
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </div>

                        {/* Conditional Fields: Condition Name & Description */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, curr) =>
                            prev.variants?.[variantIndex]?.condition !==
                            curr.variants?.[variantIndex]?.condition
                          }
                        >
                          {({ getFieldValue }) => {
                            const condition = getFieldValue([
                              "variants",
                              variantIndex,
                              "condition",
                            ]);
                            return condition !== "New" ? (
                              <Form.Item
                                {...restField}
                                name={[variantIndex, "conditionDescription"]}
                                label="Condition Description"
                                rules={[
                                  {
                                    required: true,
                                    message: "Desc required for used items",
                                  },
                                ]}
                              >
                                <TextArea
                                  rows={2}
                                  placeholder="Describe scratches, dents, or missing accessories..."
                                />
                              </Form.Item>
                            ) : null;
                          }}
                        </Form.Item>

                        {/* Conditional Fields: Unique Items */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, curr) =>
                            prev.variants?.[variantIndex]?.inventoryType !==
                            curr.variants?.[variantIndex]?.inventoryType
                          }
                        >
                          {({ getFieldValue }) => {
                            const type = getFieldValue([
                              "variants",
                              variantIndex,
                              "inventoryType",
                            ]);
                            return type === "Unique" ? (
                              <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                  {...restField}
                                  name={[variantIndex, "serialNumber"]}
                                  label="Serial Number"
                                >
                                  <Input placeholder="S/N" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[variantIndex, "imei"]}
                                  label="IMEI"
                                >
                                  <Input placeholder="IMEI" />
                                </Form.Item>
                              </div>
                            ) : null;
                          }}
                        </Form.Item>

                        <Button
                          onClick={() => remove(variantIndex)}
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          className="self-end"
                        >
                          Remove Variant
                        </Button>
                      </div>
                    ),
                  }),
                )}
              />
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  className=" mt-2"
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

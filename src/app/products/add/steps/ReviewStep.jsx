"use client";
import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Space,
  Upload,
} from "antd";
import {
  PlusCircleOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import uploadService from "@/services/uploadService";

const { TextArea } = Input;
const { Option } = Select;

const ReviewStep = ({ data, updateData, submit }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [form] = Form.useForm();

  // Open modal to add a unique used unit based on a parent variant
  const handleAddUniqueUnit = (record) => {
    setSelectedVariant(record);
    form.resetFields();
    // Pre-fill attributes but allow adding condition details
    form.setFieldsValue({
      stock: 1, // Default to 1 for unique items
      condition: "Used",
    });
    setIsModalVisible(true);
  };

  const handleSaveUniqueUnit = () => {
    form.validateFields().then((values) => {
      // Create new variant object
      // It shares attributes with the selected parent, but has unique condition/desc
      const newUniqueVariant = {
        ...selectedVariant,
        key: Date.now(), // New unique key
        price: values.price || selectedVariant.price * 0.8, // Default 20% off if not set, or set explicit
        stock: 1, // Enforce uniqueness concept
        condition: values.condition,
        conditionDescription: values.conditionDescription,
        sku: `${selectedVariant.sku}-${values.condition.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        isUnique: true, // Internal flag for UI highlighting
      };

      const newVariants = [...data.variants, newUniqueVariant];
      updateData({ ...data, variants: newVariants });
      setIsModalVisible(false);
      message.success("Added unique unit!");
    });
  };

  const handleVariantImageUpload = async (file, record) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadService.uploadImage(formData);

      if (res && res.url) {
        const url = res.url;
        const newVariants = [...data.variants];
        const index = newVariants.findIndex((item) => item.key === record.key);
        if (index > -1) {
          const currentImages = newVariants[index].images || [];
          newVariants[index].images = [...currentImages, { url }];
          updateData({ ...data, variants: newVariants });
          message.success("Image uploaded!");
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Upload failed.");
    }
    return false; // Prevent default upload behavior
  };

  const handleDelete = (key) => {
    const newVariants = data.variants.filter((item) => item.key !== key);
    updateData({ ...data, variants: newVariants });
  };

  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text, record) => (
        <span>
          {text} {record.isUnique && <Tag color="gold">UNIQUE</Tag>}
        </span>
      ),
    },
    {
      title: "Attributes",
      dataIndex: "attributes",
      key: "attributes",
      render: (attributes) => (
        <>
          {Object.entries(attributes).map(([key, value]) => (
            <Tag key={key}>{value}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Images",
      key: "images",
      render: (_, record) => (
        <Space direction="vertical">
          <Space wrap>
            {(record.images || []).map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt="variant"
                style={{
                  width: 30,
                  height: 30,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ))}
          </Space>
          <Upload
            beforeUpload={(file) => handleVariantImageUpload(file, record)}
            showUploadList={false}
          >
            <Button size="small" icon={<UploadOutlined />}>
              Add Line
            </Button>
          </Upload>
        </Space>
      ),
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={text === "New" ? "green" : "orange"}>{text}</Tag>
          {record.conditionDescription && (
            <small style={{ color: "gray" }}>
              {record.conditionDescription}
            </small>
          )}
        </Space>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => `$${text}`,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.condition === "New" && !record.isUnique && (
            <Button
              type="dashed"
              size="small"
              icon={<PlusCircleOutlined />}
              onClick={() => handleAddUniqueUnit(record)}
            >
              Add Used Unit
            </Button>
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "left" }}>
      <h3>Review Variants</h3>
      <p>Verify prices and add specific used/refurbished units if available.</p>

      <Table
        dataSource={data.variants}
        columns={columns}
        pagination={false}
        scroll={{ y: 400 }}
      />

      <div style={{ marginTop: 20, textAlign: "right" }}>
        <Button type="primary" size="large" onClick={submit}>
          Publish Product
        </Button>
      </div>

      {/* Modal for adding Unique Used Unit */}
      <Modal
        title={`Add Used Unit for ${selectedVariant?.title}`}
        open={isModalVisible}
        onOk={handleSaveUniqueUnit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Condition" name="condition" initialValue="Used">
            <Select>
              <Option value="Open Box">Open Box</Option>
              <Option value="Refurbished">Refurbished</Option>
              <Option value="Used">Used</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Identity" style={{ marginBottom: 0 }}>
            <Space
              display="flex"
              style={{ display: "flex", marginBottom: 24 }}
              align="baseline"
            >
              <Form.Item
                name="imei"
                rules={[{ required: true, message: "IMEI Required" }]}
                style={{ width: 200 }}
              >
                <Input placeholder="IMEI" />
              </Form.Item>
              <Form.Item name="serialNumber" style={{ width: 200 }}>
                <Input placeholder="Serial (Optional)" />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item label="Unique Photos">
            <Upload
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append("image", file);
                  const res = await uploadService.uploadImage(formData);

                  if (res && res.url) {
                    onSuccess({ url: res.url }, file);
                  } else {
                    throw new Error("Upload failed");
                  }
                } catch (err) {
                  onError(err);
                }
              }}
              listType="picture-card"
              fileList={form.getFieldValue("uniqueImages") || []}
              onChange={({ fileList }) => {
                // Filter to only successful uploads
                // We need to manually manage this form field value usually
                form.setFieldsValue({ uniqueImages: fileList });
              }}
            >
              <div>
                <PlusCircleOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Condition Description"
            name="conditionDescription"
            rules={[{ required: true, message: "Describe the condition" }]}
            help="e.g. 'Minor scratch on top bezel', 'Missing original cable'"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Selling Price"
            name="price"
            rules={[{ required: true }]}
          >
            <InputNumber prefix="$" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Stock" name="stock" initialValue={1}>
            <InputNumber disabled />
            <span style={{ marginLeft: 10, color: "gray" }}>
              Unique units are always stock: 1
            </span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewStep;

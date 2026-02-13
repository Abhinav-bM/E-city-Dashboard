"use client";
import React, { useState } from "react";
import { Form, Input, Select, Upload, Row, Col, Card, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const BasicInfoStep = ({ data, updateData }) => {
  const onValuesChange = (changedValues, allValues) => {
    // If images are changed, we handle them separately via the Upload 'onChange' usually,
    // but here we merge everything available in the form.
    // Note: Upload component control is slightly different, dealt with below.
    updateData({ ...data, ...allValues });
  };

  const handleImageChange = (info) => {
    const { status } = info.file;
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }

    // For now, we are simulating "upload" by keeping the file list.
    // In a real app, 'response' from server would give the URL.
    // We update the 'images' field in our data.
    // Since we don't have a backend upload, we might need to handle this as File objects
    // or simulate URLs.

    // Let's assume we want to store the file list for now so the user sees them.
    // The parent component might need to process these before sending to API
    // (e.g. converting to Base64 or uploading to cloud).
    updateData({ ...data, fileList: info.fileList });
  };

  // Dummy request to prevent auto-upload error in UI since we have no action URL
  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "left" }}>
      <Row gutter={24}>
        {/* Left Column: Text Inputs */}
        <Col span={16}>
          <Card title="General Information" bordered={false}>
            <Form
              layout="vertical"
              initialValues={data}
              onValuesChange={onValuesChange}
              autoComplete="off"
            >
              <Form.Item
                label="Product Title"
                name="name"
                rules={[
                  { required: true, message: "Product title is required" },
                ]}
              >
                <Input placeholder="e.g. iPhone 15 Pro Max" size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Brand"
                    name="brand"
                    rules={[{ required: true, message: "Brand is required" }]}
                  >
                    <Input placeholder="e.g. Apple" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[
                      { required: true, message: "Category is required" },
                    ]}
                  >
                    <Select placeholder="Select category">
                      <Option value="Mobile">Mobile</Option>
                      <Option value="Laptop">Laptop</Option>
                      <Option value="Tablet">Tablet</Option>
                      <Option value="Accessories">Accessories</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please describe the product" },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Detailed product description..."
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column: Media & Organization */}
        <Col span={8}>
          <Card
            title="Product Media"
            bordered={false}
            style={{ marginBottom: 24 }}
          >
            <div style={{ marginBottom: 16 }}>
              <Dragger
                name="file"
                multiple
                customRequest={dummyRequest}
                onChange={handleImageChange}
                fileList={data.fileList || []}
                listType="picture"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: "#1890ff" }} />
                </p>
                <p className="ant-upload-text">Drag images here</p>
                <p className="ant-upload-hint">
                  Support for single or bulk upload.
                </p>
              </Dragger>
            </div>
            {/* Fallback for URL input if they prefer */}
            <Form
              layout="vertical"
              onValuesChange={onValuesChange}
              initialValues={data}
            >
              <Form.Item label="Or Image URL" name="tempImageUrl">
                <Input placeholder="https://..." />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BasicInfoStep;

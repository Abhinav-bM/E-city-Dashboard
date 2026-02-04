"use client";
import React from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Table,
  Tag,
  Divider,
  InputNumber,
  Select,
  Card,
  Alert,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

const AttributeStep = ({ data, updateData }) => {
  const [form] = Form.useForm();

  // Helper to generate Cartesian product
  const cartesian = (...a) =>
    a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

  const handleGenerateVariants = () => {
    const values = form.getFieldsValue();
    const attributes = values.attributes || [];

    if (attributes.length === 0) {
      // Fallback: If no attributes, maybe just 1 default variant?
      // For now, we assume variants need attributes.
      return;
    }

    // Filter out incomplete attributes
    const validAttributes = attributes.filter(
      (attr) => attr.name && attr.values && attr.values.length > 0,
    );

    updateData({ ...data, variantAttributes: validAttributes });

    // Prepare data for Cartesian product
    const attrCombinations = validAttributes.map((attr) =>
      attr.values.map((val) => ({ name: attr.name, value: val })),
    );

    let combinations = [];
    if (attrCombinations.length === 1) {
      combinations = attrCombinations[0].map((item) => [item]);
    } else if (attrCombinations.length > 0) {
      combinations = cartesian(...attrCombinations);
    }

    // Create variant objects
    const generatedVariants = combinations.map((combo, index) => {
      // combo is array of {name: 'Color', value: 'Red'}
      const attributesObj = {};
      combo.forEach((item) => {
        attributesObj[item.name] = item.value;
      });

      const attrString = combo.map((c) => c.value).join("-");
      // Boring/Predictable SKU: Brand-Category-Attr
      const sku = `${(data.brand || "EC").substring(0, 3).toUpperCase()}-${(data.category || "GEN").substring(0, 3).toUpperCase()}-${attrString.toUpperCase()}-${index + 1}`;

      return {
        key: index,
        title: `${data.name} - ${attrString}`,
        attributes: attributesObj,
        price: data.basePrice || 0, // Could add base price field later
        stock: 10, // Boring default
        sku: sku,
        condition: "New",
      };
    });

    updateData({
      ...data,
      variantAttributes: validAttributes,
      variants: generatedVariants,
    });
  };

  const handleVariantChange = (value, key, field) => {
    const newVariants = [...data.variants];
    const index = newVariants.findIndex((item) => item.key === key);
    if (index > -1) {
      newVariants[index][field] = value;
      updateData({ ...data, variants: newVariants });
    }
  };

  const columns = [
    {
      title: "Variant Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <small style={{ color: "gray" }}>SKU: {record.sku}</small>
        </div>
      ),
    },
    {
      title: "Attributes",
      dataIndex: "attributes",
      key: "attributes",
      render: (attributes) => (
        <>
          {Object.entries(attributes).map(([key, value]) => (
            <Tag key={key}>
              <span style={{ color: "#8c8c8c" }}>{key}:</span> {value}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Selling Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <InputNumber
          defaultValue={text}
          onChange={(val) => handleVariantChange(val, record.key, "price")}
          prefix="$"
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: "Initial Stock",
      dataIndex: "stock",
      key: "stock",
      render: (text, record) => (
        <InputNumber
          defaultValue={text}
          onChange={(val) => handleVariantChange(val, record.key, "stock")}
          style={{ width: 100 }}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "left" }}>
      <Card bordered={false} title="Variant Configuration">
        <Alert
          message="Define attributes (like Color, Size) to automatically generate all possible product variants."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ attributes: data.variantAttributes }}
          autoComplete="off"
        >
          <Form.List name="attributes">
            {(fields, { add, remove }) => (
              <div
                style={{
                  background: "#fafafa",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Required" }]}
                      style={{ width: 200 }}
                    >
                      <Input placeholder="Name (e.g. Color)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "values"]}
                      rules={[{ required: true, message: "Required" }]}
                      style={{ width: 400 }}
                    >
                      <Select
                        mode="tags"
                        placeholder="Type values (Red, Blue) & press Enter"
                        tokenSeparators={[","]}
                        open={false}
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Another Attribute
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                icon={<ExperimentOutlined />}
                onClick={handleGenerateVariants}
                size="large"
              >
                Generate Variants
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {data.variants && data.variants.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Divider orientation="left">
            Preview Generated Variants ({data.variants.length})
          </Divider>
          <Table
            dataSource={data.variants}
            columns={columns}
            pagination={false}
            size="middle"
            bordered
          />
        </div>
      )}
    </div>
  );
};

export default AttributeStep;

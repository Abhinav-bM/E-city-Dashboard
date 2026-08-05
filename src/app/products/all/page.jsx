"use client";

import { getAllProducts } from "@/api/product";
import { Table, Button, Space, Image, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { Title } = Typography;
import React, { useEffect, useState } from "react";

const page = () => {
  const [products, setProducts] = useState([]);

  console.log("PRODUCTS : ", products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        if (response.status) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching products : ", error);
      }
    };

    fetchProducts();
  }, []);

  const _handleEditProduct = (id) => {
    console.log("Edit product:", id);
  };

  const _handleDeleteProduct = (id) => {
    console.log("Delete product:", id);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      render: (images) =>
        images?.length > 0 ? (
          <Image
            src={`${images[0].url}`}
            alt="Product"
            width={50}
            height={50}
          />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "basePrice",
      key: "basePrice",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => _handleEditProduct(record.id)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => _handleDeleteProduct(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <section>
      <Title level={3}>Products</Title>
      <Table
        dataSource={products}
        columns={columns}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 5 }}
      />
    </section>
  );
};

export default page;

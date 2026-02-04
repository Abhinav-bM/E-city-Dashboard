"use client";
import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  DollarCircleOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
  FileDoneOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

const Dashboard = () => {
  return (
    <div className="site-card-wrapper">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#262626" }}>
          Dashboard Overview
        </h2>
        <p style={{ color: "#8c8c8c" }}>
          Welcome back, Admin. Here's what's happening with your store today.
        </p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue"
              value={112893}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarCircleOutlined />}
              suffix=""
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              <ArrowUpOutlined style={{ color: "#3f8600" }} /> 12% vs last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Orders"
              value={93}
              valueStyle={{ color: "#cf1322" }}
              prefix={<FileDoneOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              <ArrowUpOutlined style={{ color: "#cf1322" }} /> 5% vs last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Products"
              value={42}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              Inventory Status: Good
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="New Customers"
              value={15}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              <ArrowUpOutlined style={{ color: "#722ed1" }} /> +2 this week
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Card title="Quick Actions" bordered={false}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <p>Placeholders for Charts or Recent Activity Table...</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

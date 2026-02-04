"use client";
import React, { useState } from "react";
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Content, Footer, Header, Sider } = Layout;

const Mainwrapper = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Determine selected keys for menu highlighting
  const getSelectedKey = () => {
    if (pathname === "/") return ["1"];
    if (pathname.includes("/products/all")) return ["2.1"];
    if (pathname.includes("/products/add")) return ["2.2"];
    return ["1"]; // Default
  };

  // Determine open keys for submenu expansion
  const getOpenKeys = () => {
    if (pathname.includes("/products")) return ["2"];
    return [];
  };

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <ShoppingOutlined />,
      label: "Products",
      children: [
        {
          key: "2.1",
          label: <Link href="/products/all">All Products</Link>,
        },
        {
          key: "2.2",
          icon: <AppstoreAddOutlined />,
          label: <Link href="/products/add">Add Product</Link>,
        },
      ],
    },
  ];

  const userMenu = {
    items: [
      {
        key: "1",
        label: "Profile",
        icon: <UserOutlined />,
      },
      {
        key: "2",
        label: "Logout",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
  };

  // Generate breadcrumb items based on path
  const breadcrumbItems = pathname
    .split("/")
    .filter((i) => i)
    .map((item, index) => ({
      title: item.charAt(0).toUpperCase() + item.slice(1),
    }));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={240}
        style={{
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
          zIndex: 10,
        }}
      >
        <div className="logo">{collapsed ? "EC" : "E-City Admin"}</div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={getSelectedKey()}
          defaultOpenKeys={getOpenKeys()}
          selectedKeys={getSelectedKey()}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            zIndex: 1,
          }}
        >
          {/* Breadcrumbs on Left */}
          <Breadcrumb
            items={[{ title: <Link href="/">Home</Link> }, ...breadcrumbItems]}
          />

          {/* Right Side Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BellOutlined
              style={{ fontSize: 18, color: "#595959", cursor: "pointer" }}
            />
            <div
              style={{
                borderLeft: "1px solid #f0f0f0",
                height: 24,
                margin: "0 4px",
              }}
            ></div>
            <Dropdown menu={userMenu}>
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <span style={{ fontSize: 14 }}>Admin User</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <div style={{ padding: "24px 0", minHeight: 360 }}>{children}</div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            color: "#8c8c8c",
          }}
        >
          E-City Admin Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Mainwrapper;

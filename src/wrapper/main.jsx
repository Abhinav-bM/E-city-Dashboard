"use client";
import React, { useState } from "react";
import { Layout, Menu } from "antd";
const { Content, Footer, Header, Sider } = Layout;
import Link from "next/link";

const main = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className=" logo">Ecity</div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              label: <Link href="/">Dashboard</Link>,
            },
            {
              key: "2",
              label: <Link href="#">Products</Link>,
              children: [
                {
                  key: "2.1",
                  label: <Link href="/products/allProducts">All products</Link>,
                },
                {
                  key: "2.2",
                  label: <Link href="/products/newProduct">Add product</Link>,
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header />
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          {children}
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default main;

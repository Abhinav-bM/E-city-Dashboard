"use client";

import { Button } from "antd";

import { Layout, Menu, theme } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import Link from "next/link";

export default function Home() {
  return (
    <Layout className="!h-[100vh]">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        className=" h-full !bg-white !border-r-2"
      >
        <div
          className=" px-6 py-5 w-full flex justify-start
         items-center hover:scale-105 cursor-pointer"
        >
          Logo goes here
        </div>
        <Menu mode="inline" defaultSelectedKeys={["2"]}>
          <Menu.Item key="1">
            <Link href="/dashboard">Dashboard</Link>{" "}
          </Menu.Item>
          <Menu.Item key="2">
            <Link href="/products">Products</Link>{" "}
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="!bg-white" />
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          Content goes here
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
}

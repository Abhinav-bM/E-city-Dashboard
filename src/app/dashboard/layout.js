import React from "react";
import Layout from "antd/es/layout/layout";
const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return label, key, icon, children;
}

const items  = [
    getItem('Dashboard',)
]

const DashboardLayout = () => {
  return (
    // need to add protected route wrapper here
    <>
      <title>Ecity | Dashboard</title>
      <Layout className="dashboard-layout"></Layout>
    </>
  );
};

export default DashboardLayout;

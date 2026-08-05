"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Tooltip from "../components/ui/Tooltip";
import { useRouter } from "next/navigation";
import orderService from "@/services/orderService";
import productService from "@/services/productService";
import { getAllCustomers } from "@/api/customer";

const MetricCard = ({ title, value, change, icon, trend }) => (
  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 shadow-sm flex items-start justify-between transition-colors">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {value}
      </h3>
      {change && (
        <div
          className={`flex items-center text-xs font-bold ${
            trend === "up"
              ? "text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full w-fit"
              : "text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-full w-fit"
          }`}
        >
          <span className="material-symbols-outlined text-sm mr-1">
            {trend === "up" ? "trending_up" : "trending_down"}
          </span>
          {change}
        </div>
      )}
    </div>
    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [ordersRes, productsRes, customersRes] = await Promise.allSettled([
          orderService.getAll({ page: 1, limit: 10 }),
          productService.getAll({ page: 1, limit: 50 }),
          getAllCustomers(),
        ]);

        let ordersList = [];
        let totalOrdersCount = 0;
        let revenueSum = 0;

        if (ordersRes.status === "fulfilled" && ordersRes.value?.success) {
          ordersList = ordersRes.value.data?.orders || [];
          totalOrdersCount = ordersRes.value.data?.totalOrders || ordersList.length;
          revenueSum = ordersList.reduce((acc, order) => {
            if (order.orderStatus !== "Cancelled") {
              return acc + (order.totalAmount || 0);
            }
            return acc;
          }, 0);
        }

        let productsList = [];
        if (productsRes.status === "fulfilled" && productsRes.value?.success) {
          productsList = productsRes.value.data?.products || [];
        }

        let customersCount = 0;
        if (customersRes.status === "fulfilled" && customersRes.value?.success) {
          customersCount = Array.isArray(customersRes.value.data)
            ? customersRes.value.data.length
            : 0;
        }

        const lowStock = productsList.filter((p) => (p.stock || 0) <= 5);

        setRecentOrders(ordersList.slice(0, 5));
        setLowStockProducts(lowStock.slice(0, 5));
        setStats({
          totalRevenue: revenueSum,
          totalOrders: totalOrdersCount,
          totalCustomers: customersCount,
          totalProducts: productsList.length,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Overview of your store's performance.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon="calendar_today">
              {todayStr}
            </Button>
            <Tooltip content="Create a new catalog item" position="bottom">
              <Button
                variant="primary"
                icon="add"
                onClick={() => router.push("/products/add-product")}
              >
                Add Product
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
            change="Live total"
            icon="payments"
            trend="up"
          />
          <MetricCard
            title="Total Orders"
            value={stats.totalOrders}
            change="Recorded orders"
            icon="shopping_bag"
            trend="up"
          />
          <MetricCard
            title="Total Products"
            value={stats.totalProducts}
            change="Catalog items"
            icon="package"
            trend="up"
          />
          <MetricCard
            title="Registered Customers"
            value={stats.totalCustomers}
            change="Active accounts"
            icon="group"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <Card title="Recent Orders" icon="list_alt">
              {loading ? (
                <div className="p-8 space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-border-dark">
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-slate-50 dark:hover:bg-surface-dark/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-primary">
                            #{order._id?.substring(order._id.length - 8).toUpperCase()}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                            {order.user?.name || order.shippingAddress?.fullName || "Guest Customer"}
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">
                            ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                order.orderStatus === "Delivered"
                                  ? "success"
                                  : order.orderStatus === "Placed"
                                  ? "warning"
                                  : order.orderStatus === "Shipped" || order.orderStatus === "Confirmed"
                                  ? "info"
                                  : "error"
                              }
                            >
                              {order.orderStatus || "Placed"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border-dark flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="arrow_forward"
                  onClick={() => router.push("/orders")}
                >
                  View All Orders
                </Button>
              </div>
            </Card>
          </div>

          {/* Inventory Alerts */}
          <div className="flex flex-col gap-6">
            <Card title="Inventory Alerts" icon="inventory_2">
              {loading ? (
                <div className="space-y-3 p-4 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  ))}
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  All inventory levels are healthy!
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((prod) => {
                    const imgUrl =
                      typeof prod.images?.[0] === "string"
                        ? prod.images[0]
                        : prod.images?.[0]?.url;
                    return (
                      <div
                        key={prod._id || prod.variantId}
                        className="flex gap-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10"
                      >
                        <div className="h-10 w-10 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={prod.title}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {prod.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {prod.brand || "Electronic Device"}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-full">
                              Stock: {prod.stock || 0}
                            </span>
                            <button
                              onClick={() => router.push("/products")}
                              className="text-primary text-xs hover:underline font-medium"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => router.push("/products")}
              >
                View Catalog Report
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

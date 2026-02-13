"use client";
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import { useRouter } from "next/navigation";

// Mock Data for "Recent Orders"
const recentOrders = [
  {
    id: "#ORD-7721",
    customer: "Liam Johnson",
    product: "iPhone 14 Pro",
    amount: "$999.00",
    status: "Shipped",
    date: "Oct 24, 2023",
  },
  {
    id: "#ORD-7720",
    customer: "Emma Carter",
    product: "MacBook Air M2",
    amount: "$1,199.00",
    status: "Processing",
    date: "Oct 24, 2023",
  },
  {
    id: "#ORD-7719",
    customer: "Noah Williams",
    product: "AirPods Pro (2nd Gen)",
    amount: "$249.00",
    status: "Delivered",
    date: "Oct 23, 2023",
  },
  {
    id: "#ORD-7718",
    customer: "Olivia Brown",
    product: "Apple Watch Ultra",
    amount: "$799.00",
    status: "Pending",
    date: "Oct 23, 2023",
  },
  {
    id: "#ORD-7717",
    customer: "James Jones",
    product: "iPad Air 5",
    amount: "$599.00",
    status: "Cancelled",
    date: "Oct 22, 2023",
  },
];

const MetricCard = ({ title, value, change, icon, trend }) => (
  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 shadow-sm flex items-start justify-between transition-colors">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {value}
      </h3>
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
    </div>
    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();

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
              Overview of your store's performance today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon="calendar_today">
              Oct 24, 2023
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
            value="$12,426"
            change="+12.5% from last week"
            icon="payments"
            trend="up"
          />
          <MetricCard
            title="Total Orders"
            value="482"
            change="+5.2% from last week"
            icon="shopping_bag"
            trend="up"
          />
          <MetricCard
            title="Avg. Order Value"
            value="$124.50"
            change="-2.1% from last week"
            icon="receipt_long"
            trend="down"
          />
          <MetricCard
            title="Active Customers"
            value="1,205"
            change="+8.4% from last week"
            icon="group"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <Card title="Recent Orders" icon="list_alt">
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
                        Product
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
                        key={order.id}
                        className="hover:bg-slate-50 dark:hover:bg-surface-dark/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-primary">
                          {order.id}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                          {order.customer}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                          {order.product}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">
                          {order.amount}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "success"
                                : order.status === "Pending"
                                  ? "warning"
                                  : order.status === "Shipped"
                                    ? "info"
                                    : order.status === "Processing"
                                      ? "info"
                                      : "error"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border-dark flex justify-center">
                <Button variant="ghost" size="sm" icon="arrow_forward">
                  View All Orders
                </Button>
              </div>
            </Card>
          </div>

          {/* Inventory Alerts */}
          <div className="flex flex-col gap-6">
            <Card title="Inventory Alerts" icon="inventory_2">
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10"
                  >
                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-black-titanium-select?wid=470&hei=556&fmt=jpeg&qlt=95&.v=1692879038933"
                        alt=""
                        className="h-8 w-auto mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        iPhone 15 Pro Max
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Black Titanium - 256GB
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-full">
                          Low Stock: 2
                        </span>
                        <Tooltip
                          content="Reorder stock immediately"
                          position="left"
                        >
                          <button className="text-primary text-xs hover:underline font-medium">
                            Restock
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-2">
                View Inventory Report
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

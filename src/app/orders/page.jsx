"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import orderService from "@/services/orderService";
import OrderDetailModal from "@/components/orders/OrderDetailModal";

import {
  ShoppingBag,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const statusTabs = [
    { id: "all", label: "All Orders", icon: <ShoppingBag size={16} /> },
    { id: "Placed", label: "Pending", icon: <Clock size={16} /> },
    { id: "Confirmed", label: "Confirmed", icon: <CheckCircle2 size={16} /> },
    { id: "Shipped", label: "Shipped", icon: <Truck size={16} /> },
    { id: "Delivered", label: "Delivered", icon: <CheckCircle size={16} /> },
    { id: "Cancelled", label: "Cancelled", icon: <XCircle size={16} /> },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        status: status === "all" ? undefined : status,
      };
      const response = await orderService.getAll(params);
      if (response.success) {
        setOrders(response.data.orders);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, pagination.page]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Processing":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Shipped":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Orders
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and track customer orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white dark:bg-surface-dark p-1 rounded-2xl border border-slate-200 dark:border-border-dark flex items-center overflow-x-auto scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatus(tab.id);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                status === tab.id
                  ? "bg-slate-900 text-white shadow-lg shadow-black/10"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden transition-all shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-border-dark">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Total
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ShoppingBag size={48} className="text-slate-200" />
                        <p className="text-slate-500 font-medium font-outfit">
                          No orders found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-sm leading-tight">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight font-outfit">
                            {order.userId?.name || "Guest Order"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {order.userId?.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-outfit">
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(order.createdAt))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrderId(order._id)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-border-dark flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  className="px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  className="px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdate={fetchOrders}
        />
      )}
    </AdminLayout>
  );
};

export default OrdersPage;

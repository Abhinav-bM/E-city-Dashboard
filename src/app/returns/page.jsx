"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { format } from "date-fns";
import {
  RotateCcw,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Banknote,
  Eye,
  X,
  Package,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllReturns,
  updateReturnStatus,
} from "../../services/returnService";

const STATUS_COLORS = {
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Refunded:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [viewReturn, setViewReturn] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await getAllReturns();
      if (res?.success) {
        setReturns(res.data);
        setFilteredReturns(res.data);
      }
    } catch (err) {
      toast.error("Failed to load returns");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = returns;

    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r._id.toLowerCase().includes(q) ||
          r.orderId?._id?.toLowerCase().includes(q) ||
          r.userId?.name?.toLowerCase().includes(q) ||
          r.userId?.email?.toLowerCase().includes(q),
      );
    }

    setFilteredReturns(result);
  }, [searchQuery, statusFilter, returns]);

  const handleStatusUpdate = async (newStatus) => {
    if (!viewReturn) return;
    setIsProcessing(true);

    try {
      const res = await updateReturnStatus(
        viewReturn._id,
        newStatus,
        adminNotes,
      );
      if (res?.success) {
        toast.success(`Return marked as ${newStatus}`);
        fetchReturns();
        setViewReturn({ ...viewReturn, status: newStatus, adminNotes });
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-border-dark">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              Returns Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Process RMAs, approve refunds, and track restocked inventory.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              className="px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Refunded">Refunded</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-border-dark overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-border-dark">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by ID, Order, Customer, Email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-border-dark">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Return ID</th>
                  <th className="px-6 py-4 whitespace-nowrap">Order Ref</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Items / Refund</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading returns...
                    </td>
                  </tr>
                ) : filteredReturns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No return requests found.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((req) => (
                    <tr
                      key={req._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                        #{req._id.slice(-6).toUpperCase()}
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                          {format(new Date(req.createdAt), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-900 dark:text-white font-medium">
                        #{req.orderId?._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {req.userId?.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {req.userId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-slate-900 dark:text-white">
                          ₹{req.refundAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {req.items.length} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${STATUS_COLORS[req.status]}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setViewReturn(req);
                            setAdminNotes(req.adminNotes || "");
                          }}
                          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Return Details Drawer/Modal */}
      {viewReturn && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 dark:bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l border-slate-200 dark:border-border-dark">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Return Details
                </h3>
                <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
                  #{viewReturn._id}
                </p>
              </div>
              <button
                onClick={() => setViewReturn(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-border-dark">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                      {viewReturn.userId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 truncate">
                      {viewReturn.userId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Order ID</p>
                    <p className="text-sm font-medium font-mono text-slate-900 dark:text-white mt-0.5">
                      #{viewReturn.orderId?._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Refund Auth</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{viewReturn.refundAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Returned Items
                </h4>
                <div className="space-y-3">
                  {viewReturn.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-3 rounded-xl border border-slate-200 dark:border-border-dark"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-border-dark flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap ml-4">
                            ₹{item.priceAtOrder.toLocaleString()}{" "}
                            <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">
                              x{item.quantity}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 p-2.5 rounded-lg">
                          <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                            Reason: {item.reason}
                          </p>
                          {item.details && (
                            <p className="text-xs text-rose-600 dark:text-rose-500 mt-1 italic">
                              "{item.details}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="border-t border-slate-100 dark:border-border-dark pt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Admin Notes & Resolution
                </h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this return (visible to customer)..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[100px]"
                ></textarea>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-border-dark flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Current Status
                    </p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${STATUS_COLORS[viewReturn.status]}`}
                    >
                      {viewReturn.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {viewReturn.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate("Approved")}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
                        >
                          Approve (Restock)
                        </button>
                        <button
                          onClick={() => handleStatusUpdate("Rejected")}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-sm font-bold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-50 transition-colors"
                        >
                          Reject Return
                        </button>
                      </>
                    )}
                    {viewReturn.status === "Approved" && (
                      <button
                        onClick={() => handleStatusUpdate("Refunded")}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                      >
                        Mark as Refunded
                      </button>
                    )}
                    {(viewReturn.status === "Rejected" ||
                      viewReturn.status === "Refunded") && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        This return is closed.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

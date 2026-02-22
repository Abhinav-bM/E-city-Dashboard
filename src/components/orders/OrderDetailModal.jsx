"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  CheckCircle,
  XCircle,
  Settings,
  User,
  Phone,
  AlertTriangle,
  FileDown,
} from "lucide-react";
import orderService from "@/services/orderService";
import toast from "react-hot-toast";

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "Placed", label: "Placed", icon: <Clock size={16} /> },
  { key: "Confirmed", label: "Confirmed", icon: <CheckCircle2 size={16} /> },
  { key: "Processing", label: "Processing", icon: <Settings size={16} /> },
  { key: "Shipped", label: "Shipped", icon: <Truck size={16} /> },
  { key: "Delivered", label: "Delivered", icon: <CheckCircle size={16} /> },
];

const NEXT_STATUS_MAP = {
  Placed: "Confirmed",
  Confirmed: "Processing",
  Processing: "Shipped",
  Shipped: "Delivered",
};

const STATUS_COLOR = {
  Placed: "text-amber-600 bg-amber-50 border-amber-200",
  Confirmed: "text-blue-600 bg-blue-50 border-blue-200",
  Processing: "text-indigo-600 bg-indigo-50 border-indigo-200",
  Shipped: "text-purple-600 bg-purple-50 border-purple-200",
  Delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Cancelled: "text-rose-600 bg-rose-50 border-rose-200",
};

// ── Component ─────────────────────────────────────────────────────────────────
const OrderDetailModal = ({ orderId, onClose, onStatusUpdate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getById(orderId);
      if (res.success) setOrder(res.data);
    } catch {
      toast.error("Failed to load order details");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [orderId, onClose]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await orderService.updateStatus(order._id, newStatus);
      toast.success(`Order marked as ${newStatus}`, { id: toastId });
      setOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      setConfirmCancel(false);
      onStatusUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed", {
        id: toastId,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const toastId = toast.loading("Generating invoice...");
    try {
      const res = await orderService.downloadInvoice(order._id);
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `INV-${order._id.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to download invoice.", { id: toastId });
    }
  };

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order?.orderStatus,
  );
  const isCancelled = order?.orderStatus === "Cancelled";
  const isDelivered = order?.orderStatus === "Delivered";
  const nextStatus = NEXT_STATUS_MAP[order?.orderStatus];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <Backdrop onClick={onClose}>
        <ModalCard>
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"
              ></div>
            ))}
          </div>
        </ModalCard>
      </Backdrop>
    );
  }

  if (!order) return null;

  return (
    <Backdrop onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalCard>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-border-dark">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Order{" "}
              <span className="font-mono text-primary">
                #{order._id.slice(-6).toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(order.createdAt))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLOR[order.orderStatus]}`}
            >
              {order.orderStatus}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-border-dark">
          {/* Status Timeline */}
          {!isCancelled && (
            <div className="px-6 py-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Status
              </p>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const current = idx === currentStepIndex;
                  const isLast = idx === STATUS_STEPS.length - 1;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-300"
                          } ${current ? "ring-4 ring-slate-900/10" : ""}`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-[10px] font-bold whitespace-nowrap ${
                            done
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={`h-0.5 flex-1 mb-5 ${
                            idx < currentStepIndex
                              ? "bg-slate-900"
                              : "bg-slate-200 dark:bg-border-dark"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer + Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-border-dark">
            <div className="px-6 py-5 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Customer
              </p>
              <div className="flex items-center gap-2">
                <User size={15} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.userId?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {order.userId?.phone || order.shippingAddress.phone}
                </span>
              </div>
            </div>
            <div className="px-6 py-5 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Shipping To
              </p>
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.address},<br />
                  {order.shippingAddress.city}
                  {order.shippingAddress.zip
                    ? ` - ${order.shippingAddress.zip}`
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Items
            </p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex items-center justify-center shrink-0">
                    <Package size={20} className="text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title || item.baseProductId?.title || "Product"}
                    </p>
                    {item.attributes &&
                      Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-slate-500">
                          {Object.values(item.attributes).join(" · ")}
                        </p>
                      )}
                    {item.inventoryUnitId && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.inventoryUnitId.imei
                          ? `IMEI: ${item.inventoryUnitId.imei}`
                          : ""}
                        {item.inventoryUnitId.serialNumber
                          ? ` SN: ${item.inventoryUnitId.serialNumber}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹{(item.priceAtOrder * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.quantity} × ₹{item.priceAtOrder.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Payment
            </p>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={15} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {order.paymentMethod}
              </span>
              <span
                className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  order.paymentStatus === "Paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="space-y-1.5 border-t border-slate-100 dark:border-border-dark pt-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₹{order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-border-dark">
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer: Actions ─────────────────────────────────────────────── */}
        {!isDelivered && !isCancelled && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
            {/* Download Invoice */}
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all"
            >
              <FileDown size={14} /> Invoice
            </button>

            {/* Cancel confirmation */}
            {confirmCancel ? (
              <div className="flex items-center gap-2 flex-1">
                <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                  Cancel this order?
                </span>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  No
                </button>
                <button
                  onClick={() => handleStatusUpdate("Cancelled")}
                  disabled={updating}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-70"
                >
                  Yes, Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <XCircle size={14} /> Cancel Order
                </button>

                {nextStatus && (
                  <button
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70"
                  >
                    Mark as {nextStatus}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Show invoice button for completed / cancelled orders too */}
        {(isDelivered || isCancelled) && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all"
            >
              <FileDown size={14} /> Download Invoice
            </button>
          </div>
        )}
      </ModalCard>
    </Backdrop>
  );
};

// ── Helper sub-components ─────────────────────────────────────────────────────
const Backdrop = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
  >
    {children}
  </div>
);

const ModalCard = ({ children }) => (
  <div className="bg-white dark:bg-background-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-border-dark w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    {children}
  </div>
);

export default OrderDetailModal;

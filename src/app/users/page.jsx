"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllCustomers } from "@/api/customer";
import {
  Copy,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getAllCustomers();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (error) {
      toast.error("Failed to load customers data.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customers Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View registered users and their address books.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2">
              <UserIcon size={16} /> Total: {customers.length}
            </div>
          </div>
        </div>

        {/* Data Table Wrapper */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[500px]">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <UserIcon
                    size={32}
                    className="text-slate-300 dark:text-slate-600"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No customers found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  There are no registered accounts to display.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-border-dark text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Customer Info</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Joined On</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {customers.map((user) => {
                    const isExpanded = expandedId === user._id;

                    return (
                      <React.Fragment key={user._id}>
                        <tr
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isExpanded ? "bg-slate-50 dark:bg-slate-800/30" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
                                {user.name ? (
                                  user.name.charAt(0).toUpperCase()
                                ) : (
                                  <UserIcon size={16} />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {user.name || "N/A"}
                                </div>
                                <div
                                  className="text-xs font-mono text-slate-400 flex items-center gap-1 mt-0.5"
                                  onClick={() => copyToClipboard(user._id)}
                                  title="Copy ID"
                                >
                                  ID: {user._id.slice(-6).toUpperCase()}{" "}
                                  <Copy
                                    size={10}
                                    className="hover:text-slate-600 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <Mail size={14} className="text-slate-400" />
                                {user.email || "No Email"}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <Phone size={14} className="text-slate-400" />
                                {user.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase tracking-wider">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 uppercase tracking-wider">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => toggleExpand(user._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row Content (Addresses) */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-0 border-b border-slate-200 dark:border-border-dark bg-slate-50/80 dark:bg-slate-800/20"
                            >
                              <div className="px-10 py-6 border-l-4 border-indigo-500 space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <MapPin
                                    size={16}
                                    className="text-indigo-500"
                                  />
                                  Address Book ({user.addresses?.length || 0})
                                </h4>

                                {!user.addresses ||
                                user.addresses.length === 0 ? (
                                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                                    This customer hasn't saved any addresses
                                    yet.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {user.addresses.map((addr, idx) => (
                                      <div
                                        key={addr._id || idx}
                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm relative"
                                      >
                                        {addr.isDefault && (
                                          <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 uppercase tracking-wider">
                                            <CheckCircle2 size={10} /> Default
                                          </span>
                                        )}
                                        <p className="font-bold text-slate-900 dark:text-white text-sm pr-16">
                                          {addr.fullName}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                          {addr.phone}
                                        </p>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                          {addr.addressLine1}
                                          {addr.addressLine2 ? (
                                            <>
                                              , <br />
                                              {addr.addressLine2}
                                            </>
                                          ) : (
                                            <br />
                                          )}
                                          {addr.city}, {addr.state}{" "}
                                          {addr.postalCode}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomersPage;

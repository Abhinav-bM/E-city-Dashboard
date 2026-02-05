import React from "react";
import Button from "./Button";
import Badge from "./Badge";

const Table = ({
  columns,
  data,
  actions,
  pagination,
  onPageChange,
  loading,
}) => {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl">
        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
        <p>No records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-surface-dark/50 border-b border-slate-200 dark:border-border-dark">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
              {actions && (
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || row._id || rowIdx}
                className="hover:bg-slate-50 dark:hover:bg-surface-dark/50 transition-colors group"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={`${rowIdx}-${colIdx}`}
                    className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="p-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-surface-dark/30">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.total,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {pagination.total}
            </span>{" "}
            results
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={
                pagination.currentPage * pagination.limit >= pagination.total
              }
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

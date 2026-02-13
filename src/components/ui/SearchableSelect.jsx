import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled = false,
  className = "",
  onCreate, // Optional prop for creating new items
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle Enter key to select or create
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!searchTerm) return;

      const exactMatch = filteredOptions.find(
        (opt) => opt.label.toLowerCase() === searchTerm.toLowerCase(),
      );

      if (exactMatch) {
        onChange(exactMatch.value);
        setIsOpen(false);
        setSearchTerm("");
      } else if (onCreate) {
        onCreate(searchTerm);
        setIsOpen(false);
        setSearchTerm("");
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-surface-dark/50 border ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-slate-200 dark:border-border-dark"} rounded-lg text-sm text-slate-900 dark:text-white cursor-pointer flex items-center justify-between transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption && selectedOption.icon && (
            <span className="text-slate-500 dark:text-slate-400">
              {typeof selectedOption.icon === "string" ? (
                <span className="material-symbols-outlined text-[18px]">
                  {selectedOption.icon}
                </span>
              ) : (
                selectedOption.icon
              )}
            </span>
          )}
          <span
            className={`truncate ${!selectedOption ? "text-slate-400" : ""}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 dark:border-border-dark sticky top-0 bg-white dark:bg-surface-dark">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder={
                  onCreate ? "Type to search or create..." : "Search..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 ${
                    value === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {opt.icon && (
                    <span className="opacity-70 flex items-center justify-center w-5">
                      {typeof opt.icon === "string" ? (
                        <span className="material-symbols-outlined text-[18px]">
                          {opt.icon}
                        </span>
                      ) : (
                        opt.icon
                      )}
                    </span>
                  )}
                  {opt.label}
                  {value === opt.value && (
                    <Check size={14} className="ml-auto" />
                  )}
                </div>
              ))
            )}
            {/* Create New Option */}
            {onCreate &&
              searchTerm &&
              !filteredOptions.some(
                (o) => o.label.toLowerCase() === searchTerm.toLowerCase(),
              ) && (
                <div
                  onClick={() => {
                    onCreate(searchTerm);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 text-primary hover:bg-primary/5 border-t border-slate-100 dark:border-slate-700 mt-1 font-medium"
                >
                  <span>+ Create "{searchTerm}"</span>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

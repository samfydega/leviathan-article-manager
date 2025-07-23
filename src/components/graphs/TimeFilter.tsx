import React from "react";
export type TimeFilterOption = "24h" | "3d" | "7d" | "14d";
interface TimeFilterProps {
  activeFilter: TimeFilterOption;
  onFilterChange: (filter: TimeFilterOption) => void;
}
export const TimeFilter: React.FC<TimeFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: TimeFilterOption[] = ["24h", "3d", "7d", "14d"];
  return (
    <div className="flex space-x-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            activeFilter === filter
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

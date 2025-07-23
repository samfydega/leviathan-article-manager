import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TimeFilter, TimeFilterOption } from "../graphs/TimeFilter";
import { subHours, subDays, format } from "date-fns";
export interface DataPoint {
  timestamp: Date;
  value: number;
  [key: string]: any; // Allow for additional data properties
}
interface LineGraphProps {
  data: DataPoint[];
  title?: string;
  yAxisLabel?: string;
  lineColor?: string;
  isLoading?: boolean;
  height?: number | string;
}
export const LineGraph: React.FC<LineGraphProps> = ({
  data,
  title = "Time Series Data",
  yAxisLabel = "Value",
  lineColor = "#3b82f6",
  // blue-500
  isLoading = false,
  height = 400,
}) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilterOption>("24h");
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    let cutoffDate: Date;
    switch (activeFilter) {
      case "24h":
        cutoffDate = subHours(now, 24);
        break;
      case "3d":
        cutoffDate = subDays(now, 3);
        break;
      case "7d":
        cutoffDate = subDays(now, 7);
        break;
      case "14d":
        cutoffDate = subDays(now, 14);
        break;
      default:
        cutoffDate = subHours(now, 24);
    }
    return data
      .filter((point) => point.timestamp >= cutoffDate)
      .map((point) => ({
        ...point,
        formattedTime: format(
          point.timestamp,
          activeFilter === "24h" ? "HH:mm" : "MMM dd"
        ),
      }));
  }, [data, activeFilter]);
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4"
        style={{
          height,
        }}
      >
        <div className="animate-pulse text-gray-400">Loading data...</div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4"
        style={{
          height,
        }}
      >
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <TimeFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>
      <div
        style={{
          height: typeof height === "number" ? `${height}px` : height,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedTime"
              tick={{
                fontSize: 12,
              }}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={formatYAxis}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                },
              }}
              tick={{
                fontSize: 12,
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}`, yAxisLabel]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
              }}
              name={yAxisLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

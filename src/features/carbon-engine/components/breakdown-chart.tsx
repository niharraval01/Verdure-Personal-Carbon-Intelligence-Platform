"use client";

/**
 * Breakdown Chart Component
 *
 * Recharts donut chart showing transport/energy/lifestyle split.
 * Includes an accessible data table fallback for screen readers.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { EmissionBreakdown } from "@/features/carbon-engine";
import { motion, useReducedMotion } from "framer-motion";

interface BreakdownChartProps {
  breakdown: EmissionBreakdown;
  totalKg: number;
}

const CATEGORY_CONFIG = {
  transport: { label: "Transport", color: "#0ea5e9", icon: "🚗" },
  energy: { label: "Energy", color: "#f59e0b", icon: "⚡" },
  lifestyle: { label: "Lifestyle", color: "#8b5cf6", icon: "🍃" },
} as const;

export function BreakdownChart({ breakdown, totalKg }: BreakdownChartProps) {
  const shouldReduceMotion = useReducedMotion();

  const data = Object.entries(breakdown).map(([key, value]) => {
    const category = key as keyof typeof CATEGORY_CONFIG;
    return {
      name: CATEGORY_CONFIG[category].label,
      value: Math.round(value),
      color: CATEGORY_CONFIG[category].color,
      icon: CATEGORY_CONFIG[category].icon,
      percentage: totalKg > 0 ? Math.round((value / totalKg) * 100) : 0,
    };
  });

  return (
    <motion.div
      className="breakdown-chart"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      <h3 className="breakdown-chart__title">Emission Breakdown</h3>

      <div className="breakdown-chart__content">
        {/* Visual chart */}
        <div className="breakdown-chart__visual" aria-hidden="true">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} kg CO₂e`, ""]}
                contentStyle={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + accessible data */}
        <div className="breakdown-chart__legend">
          {data.map((item) => (
            <div key={item.name} className="breakdown-chart__legend-item">
              <span
                className="breakdown-chart__legend-dot"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="breakdown-chart__legend-icon" aria-hidden="true">
                {item.icon}
              </span>
              <div className="breakdown-chart__legend-info">
                <span className="breakdown-chart__legend-label">
                  {item.name}
                </span>
                <span className="breakdown-chart__legend-value">
                  {item.value.toLocaleString()} kg ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible data table (visually hidden, exposed to screen readers) */}
      <table className="sr-only" aria-label="Carbon emission breakdown by category">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Emissions (kg CO₂e/year)</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.value.toLocaleString()}</td>
              <td>{item.percentage}%</td>
            </tr>
          ))}
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{Math.round(totalKg).toLocaleString()}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}

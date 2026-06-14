"use client";

/**
 * Progress Chart Component
 *
 * Recharts line chart showing carbon score over time.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressDataPoint {
  date: string;
  score: number;
  kgCO2e: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="progress-chart__empty">
        <p>No progress data yet. Complete your first footprint calculation to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="progress-chart" aria-label="Carbon score progress over time">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            fontSize={12}
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--text-secondary)"
            fontSize={12}
            label={{ value: "Score", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value ?? 0);
              if (name === "score") return [`${num}/100`, "Score"] as [string, string];
              return [`${num.toLocaleString()} kg`, "CO₂e/yr"] as [string, string];
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--verdure-500)"
            strokeWidth={3}
            dot={{ fill: "var(--verdure-500)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Accessible data table */}
      <table className="sr-only" aria-label="Progress data table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Score</th>
            <th scope="col">Emissions (kg CO₂e/yr)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{point.date}</td>
              <td>{point.score}</td>
              <td>{point.kgCO2e.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

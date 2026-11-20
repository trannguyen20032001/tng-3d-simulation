"use client";

import { useState } from "react";

import { formatNumber } from "../model/electricity-store";

const hourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

export default function ElectricityChart({ reading }) {
  const [selectedHour, setSelectedHour] = useState(null);
  const values = reading.hourly;
  if (
    !Array.isArray(values) || values.length !== 24 ||
    values.some((value) => !Number.isFinite(value) || value < 0)
  ) return null;

  const maxValue = Math.max(...values);
  const ceiling = Math.max(10, Math.ceil(maxValue / 50) * 50);
  const describeHour = (hour) =>
    `${hourLabel(hour)}–${hourLabel(hour + 1)}: ${formatNumber(values[hour])} kWh`;

  return (
    <figure className="electricity-chart">
      <figcaption>
        Điện năng tiêu thụ trong ngày <span>{reading.simulated ? "Demo · 24 giờ" : "24 giờ"}</span>
      </figcaption>
      <svg viewBox="0 0 320 180" role="group" aria-label="Điện năng tiêu thụ từng giờ trong ngày">
        <text x="0" y="12">kWh</text>
        {[0, 1, 2, 3].map((step) => {
          const y = 146 - step * 40;
          return (
            <g key={step}>
              <line x1="32" x2="316" y1={y} y2={y} className="electricity-chart-grid" />
              <text x="27" y={y + 3} textAnchor="end">{formatNumber(ceiling * step / 3, 0)}</text>
            </g>
          );
        })}
        {values.map((value, hour) => {
          const height = value / ceiling * 120;
          return (
            <rect
              key={hour}
              x={33 + hour * 11.75}
              y={146 - height}
              width="8.75"
              height={height}
              rx="2"
              className="electricity-chart-bar"
              data-hour={hour}
              tabIndex={0}
              role="img"
              aria-label={describeHour(hour)}
              onPointerOver={() => setSelectedHour(hour)}
              onFocus={() => setSelectedHour(hour)}
            >
              <title>{describeHour(hour)}</title>
            </rect>
          );
        })}
        {[0, 6, 12, 18, 24].map((hour) => (
          <text key={hour} x={32 + hour * 11.75} y="164" textAnchor="middle">{hour}h</text>
        ))}
      </svg>
      <p className="electricity-chart-detail" aria-live="polite">
        {selectedHour === null
          ? `Cao nhất ${hourLabel(values.indexOf(maxValue))}: ${formatNumber(maxValue)} kWh`
          : describeHour(selectedHour)}
      </p>
    </figure>
  );
}

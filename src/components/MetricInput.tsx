"use client";

import { Info } from "lucide-react";
import { useState } from "react";

interface MetricInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function MetricInput({
  label,
  description,
  value,
  onChange,
  min = 1,
  max = 10
}: MetricInputProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="metric-container">
      <div className="metric-header">
        <label className="metric-label">{label}</label>
        <div
          className="info-icon"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info size={14} />
          {showTooltip && (
            <div className="tooltip">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="range-wrapper">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="metric-range"
        />
        <span className="metric-value">{value}</span>
      </div>
    </div>
  );
}

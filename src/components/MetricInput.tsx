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

      <style jsx>{`
        .metric-container {
          margin-bottom: var(--space-6);
        }
        .metric-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }
        .metric-label {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: lowercase;
        }
        .info-icon {
          position: relative;
          color: var(--accent);
          opacity: 0.8;
          cursor: help;
          display: flex;
          align-items: center;
        }
        .info-icon:hover { opacity: 1; }
        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--fg);
          color: var(--bg);
          padding: var(--space-3);
          border-radius: 4px;
          font-size: 0.75rem;
          width: 280px;
          z-index: 10;
          margin-bottom: var(--space-2);
          line-height: 1.4;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .range-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .metric-range {
          flex: 1;
          -webkit-appearance: none;
          height: 2px;
          background: var(--border);
          outline: none;
        }
        .metric-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .metric-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .metric-value {
          font-size: 0.875rem;
          font-weight: 700;
          min-width: 1.5rem;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

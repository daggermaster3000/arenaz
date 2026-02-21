"use client";

import React, { useRef, useEffect, useState } from "react";
import { AromaProfile } from "@/types";

interface AromaWheelProps {
    data: AromaProfile;
    onChange?: (data: AromaProfile) => void;
    size?: number;
    interactive?: boolean;
}

const CATEGORIES: (keyof AromaProfile)[] = [
    "menthol", "tea", "green_fruits", "citrus",
    "green", "vegetal", "cream_caramel", "woody_aromatic",
    "spicy_herbal", "red_berries", "sweet_fruits", "floral"
];

const DISPLAY_NAMES: Record<keyof AromaProfile, string> = {
    menthol: "menthol",
    tea: "tea",
    green_fruits: "green fruits",
    citrus: "citrus",
    green: "green",
    vegetal: "vegetal",
    cream_caramel: "cream caramel",
    woody_aromatic: "woody aromatic",
    spicy_herbal: "spicy/herbal",
    red_berries: "red berries",
    sweet_fruits: "sweet fruits",
    floral: "floral"
};

export default function AromaWheel({ data, onChange, size = 400, interactive = false }: AromaWheelProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const maxValue = 10;
    const padding = 100;
    const center = size / 2;
    const radius = center - padding;

    const getPoint = (value: number, index: number) => {
        const angle = (Math.PI * 2 * index) / CATEGORIES.length - Math.PI / 2;
        const x = center + radius * (value / maxValue) * Math.cos(angle);
        const y = center + radius * (value / maxValue) * Math.sin(angle);
        return { x, y };
    };

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!interactive || !onChange || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left - center;
        const y = clientY - rect.top - center;

        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x) + Math.PI / 2;

        // Normalize angle to 0 - 2PI
        let normalizedAngle = angle;
        if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;

        const segmentAngle = (Math.PI * 2) / CATEGORIES.length;
        const index = Math.round(normalizedAngle / segmentAngle) % CATEGORIES.length;

        const value = Math.max(0, Math.min(maxValue, Math.round((distance / radius) * maxValue)));

        const newData = { ...data, [CATEGORIES[index]]: value };
        onChange(newData);
    };

    const dataPoints = CATEGORIES.map((cat, i) => getPoint(data[cat], i));
    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <div className="aroma-wheel-container">
            <svg
                ref={svgRef}
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                onMouseDown={handleInteraction}
                onTouchStart={handleInteraction}
                className={interactive ? "interactive" : ""}
                style={{ overflow: 'visible' }}
            >
                {/* Background Grid - Circular for better scientific feel */}
                {[2, 4, 6, 8, 10].map(val => (
                    <circle
                        key={val}
                        cx={center}
                        cy={center}
                        r={radius * (val / maxValue)}
                        className="grid-circle"
                    />
                ))}

                {/* Axis Lines */}
                {CATEGORIES.map((_, i) => {
                    const p = getPoint(maxValue, i);
                    return (
                        <line
                            key={i}
                            x1={center} y1={center}
                            x2={p.x} y2={p.y}
                            className="axis-line"
                        />
                    );
                })}

                {/* Data Shape */}
                <polygon points={dataPolygon} className="data-shape" />

                {/* Scale Numbers */}
                {[2, 4, 6, 8, 10].map(val => {
                    const p = getPoint(val, 0); // Menthol axis
                    return (
                        <text key={val} x={p.x + 6} y={p.y} className="scale-number">
                            {val}
                        </text>
                    );
                })}

                {/* Interaction Points (transparent but larger for easier hitting) */}
                {interactive && CATEGORIES.map((cat, i) => {
                    const p = getPoint(data[cat], i);
                    return (
                        <circle
                            key={cat}
                            cx={p.x} cy={p.y}
                            r={6}
                            className="data-point-invisible"
                        />
                    );
                })}

                {/* Labels */}
                {CATEGORIES.map((cat, i) => {
                    const p = getPoint(maxValue + 4.5, i); // Adjusted from 2.5 to 4.5
                    const isLeft = p.x < center;
                    const isTop = p.y < center;

                    return (
                        <text
                            key={cat}
                            x={p.x}
                            y={p.y}
                            textAnchor={Math.abs(p.x - center) < 10 ? "middle" : (isLeft ? "end" : "start")}
                            className="graph-label"
                            dominantBaseline={Math.abs(p.y - center) < 10 ? "middle" : (isTop ? "auto" : "hanging")}
                        >
                            {DISPLAY_NAMES[cat]}
                        </text>
                    );
                })}
            </svg>

            <style jsx>{`
                .aroma-wheel-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    touch-action: none;
                }
                svg.interactive {
                    cursor: crosshair;
                }
                .grid-circle {
                    fill: none;
                    stroke: var(--fg);
                    stroke-width: 1;
                    opacity: 0.2;
                    stroke-dasharray: 2;
                }
                .axis-line {
                    stroke: var(--fg);
                    stroke-width: 1.5;
                    opacity: 0.15;
                }
                .data-shape {
                    fill: #a28ab1ff; /* Sage green */
                    fill-opacity: 0.2;
                    stroke: #936ab3ff;
                    stroke-width: 2.5;
                    transition: all 0.2s ease;
                }
                .data-point-invisible {
                    fill: transparent;
                    cursor: pointer;
                }
                .graph-label {
                    font-size: 8px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    fill: var(--fg);
                }
                .scale-number {
                    font-size: 9px;
                    font-weight: 700;
                    fill: var(--fg);
                    opacity: 0.4;
                }
            `}</style>
        </div>
    );
}

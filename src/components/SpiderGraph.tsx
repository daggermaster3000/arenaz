"use client";

import React from "react";

interface SpiderGraphProps {
    data: {
        appearance: number;
        aroma: number;
        flavor: number;
        mouthfeel: number;
        bubbles: number;
        bitterness: number;
    };
    size?: number;
}

export default function SpiderGraph({ data, size = 300 }: SpiderGraphProps) {
    const categories = ["appearance", "aroma", "flavor", "mouthfeel", "bubbles", "bitterness"];
    const maxValue = 10;
    const padding = 40;
    const center = size / 2;
    const radius = center - 100;

    // Calculate point positions
    const getPoint = (value: number, index: number) => {
        const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
        const x = center + radius * (value / maxValue) * Math.cos(angle);
        const y = center + radius * (value / maxValue) * Math.sin(angle);
        return { x, y };
    };

    // Background shapes
    const bgPolygon = Array.from({ length: 6 }, (_, i) => {
        const p = getPoint(maxValue, i);
        return `${p.x},${p.y}`;
    }).join(" ");

    const midPolygon = Array.from({ length: 6 }, (_, i) => {
        const p = getPoint(maxValue / 2, i);
        return `${p.x},${p.y}`;
    }).join(" ");

    // Data polygon
    const dataPoints = categories.map((cat, i) => getPoint((data as any)[cat], i));
    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <div className="spider-graph-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
                {/* Background Grid */}
                <polygon points={bgPolygon} className="grid-bg" />
                <polygon points={midPolygon} className="grid-mid" />

                {/* Axis Lines */}
                {Array.from({ length: 5 }).map((_, i) => {
                    const p = getPoint(maxValue, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            className="axis-line"
                        />
                    );
                })}

                {/* Data Shape */}
                <polygon points={dataPolygon} className="data-shape" />

                {/* Axis Scale Numbers */}
                {[2, 4, 6, 8, 10].map(val => {
                    const p = getPoint(val, 0);
                    return (
                        <text key={val} x={p.x + 5} y={p.y} className="scale-number">
                            {val}
                        </text>
                    );
                })}

                {/* Labels */}
                {categories.map((cat, i) => {
                    const p = getPoint(maxValue + 1.5, i);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            className="graph-label"
                        >
                            {cat}
                        </text>
                    );
                })}
            </svg>

            <style jsx>{`
                .spider-graph-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: var(--space-8) 0;
                }
                .grid-bg {
                    fill: var(--muted);
                    stroke: var(--fg);
                    stroke-width: 1.5;
                    opacity: 0.1;
                }
                .grid-mid {
                    fill: none;
                    stroke: var(--fg);
                    stroke-width: 1;
                    opacity: 0.2;
                    stroke-dasharray: 2;
                }
                .axis-line {
                    stroke: var(--fg);
                    stroke-width: 1.5;
                    opacity: 0.1;
                }
                .data-shape {
                    fill: var(--accent);
                    fill-opacity: 0.15;
                    stroke: var(--accent);
                    stroke-width: 2.5;
                }
                .graph-label {
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
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

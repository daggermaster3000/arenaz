"use client";

import React, { useState, useMemo } from "react";
import { Beer, Review, AromaProfile } from "@/types";
import SpiderGraph from "./SpiderGraph";
import AromaWheel from "./AromaWheel";
import { Download, Filter, BarChart3 } from "lucide-react";

interface MetricsDashboardProps {
    beers: Beer[];
    reviews: Review[];
}

const INITIAL_AROMA: AromaProfile = {
    earthy: 0, sour_acidic: 0, sweet: 0, bitter: 0,
    spicy: 0, light_grain: 0, dark_grain: 0, citrus: 0,
    berry: 0, tropical: 0, floral: 0, nutty: 0
};

export default function MetricsDashboard({ beers, reviews }: MetricsDashboardProps) {
    const [filterBeerId, setFilterBeerId] = useState<string>("all");
    const [filterSex, setFilterSex] = useState<string>("all");
    const [filterAge, setFilterAge] = useState<string>("all");

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesBeer = filterBeerId === "all" || r.beer_id === filterBeerId;
            const matchesSex = filterSex === "all" || r.reviewer_sex === filterSex;

            let matchesAge = true;
            if (filterAge !== "all") {
                const age = r.reviewer_age;
                if (!age) matchesAge = false;
                else if (filterAge === "18-25") matchesAge = age >= 18 && age <= 25;
                else if (filterAge === "26-40") matchesAge = age >= 26 && age <= 40;
                else if (filterAge === "41-60") matchesAge = age >= 41 && age <= 60;
                else if (filterAge === "60+") matchesAge = age > 60;
            }

            return matchesBeer && matchesSex && matchesAge;
        });
    }, [reviews, filterBeerId, filterSex, filterAge]);

    const stats = useMemo(() => {
        if (filteredReviews.length === 0) return null;

        const meanAroma = filteredReviews.reduce((acc, r) => {
            const ap = r.aroma_profile;
            Object.keys(acc).forEach(key => {
                acc[key as keyof AromaProfile] += (ap[key as keyof AromaProfile] || 0);
            });
            return acc;
        }, { ...INITIAL_AROMA });

        Object.keys(meanAroma).forEach(key => {
            meanAroma[key as keyof AromaProfile] /= filteredReviews.length;
        });

        const meanMetrics = filteredReviews.reduce((acc, r) => {
            acc.appearance += r.metrics.appearance;
            acc.aroma += r.metrics.aroma;
            acc.flavor += r.metrics.flavor;
            acc.mouthfeel += r.metrics.mouthfeel;
            acc.bubbles += r.metrics.bubbles;
            acc.bitterness += (r.metrics.bitterness || 0);
            return acc;
        }, { appearance: 0, aroma: 0, flavor: 0, mouthfeel: 0, bubbles: 0, bitterness: 0 });

        Object.keys(meanMetrics).forEach(key => {
            (meanMetrics as any)[key] /= filteredReviews.length;
        });

        const avgRating = filteredReviews.reduce((acc, r) => acc + r.rating, 0) / filteredReviews.length;

        return { meanAroma, meanMetrics, avgRating };
    }, [filteredReviews]);

    const downloadCSV = () => {
        const headers = [
            "Review ID", "Beer Name", "Rating",
            "Appearance", "Aroma", "Flavor", "Mouthfeel", "Bubbles", "Bitterness",
            ...Object.keys(INITIAL_AROMA),
            "Reviewer Name", "Reviewer Sex", "Reviewer Age", "Date"
        ].join(",");

        const rows = reviews.map(r => {
            const beer = beers.find(b => b.id === r.beer_id);
            const m = r.metrics;
            const ap = r.aroma_profile;
            const aromaValues = Object.keys(INITIAL_AROMA).map(k => ap[k as keyof AromaProfile] || 0);

            return [
                r.id,
                `"${beer?.name || "unknown"}"`,
                r.rating,
                m.appearance, m.aroma, m.flavor, m.mouthfeel, m.bubbles, m.bitterness || 0,
                ...aromaValues,
                `"${r.reviewer_name || ""}"`,
                r.reviewer_sex || "",
                r.reviewer_age || "",
                new Date(r.created_at).toISOString()
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `scientific_evaluations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="metrics-dashboard">
            <div className="dashboard-controls">
                <div className="filters-group">
                    <div className="filter-item">
                        <label>beer</label>
                        <select value={filterBeerId} onChange={e => setFilterBeerId(e.target.value)}>
                            <option value="all">all beers</option>
                            {beers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>sex</label>
                        <select value={filterSex} onChange={e => setFilterSex(e.target.value)}>
                            <option value="all">all</option>
                            <option value="male">male</option>
                            <option value="female">female</option>
                            <option value="other">other</option>
                            <option value="private">private</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>age group</label>
                        <select value={filterAge} onChange={e => setFilterAge(e.target.value)}>
                            <option value="all">all</option>
                            <option value="18-25">18-25</option>
                            <option value="26-40">26-40</option>
                            <option value="41-60">41-60</option>
                            <option value="60+">60+</option>
                        </select>
                    </div>
                </div>

                <button onClick={downloadCSV} className="btn btn-secondary">
                    <Download size={16} />
                    <span>download csv</span>
                </button>
            </div>

            {stats ? (
                <div className="dashboard-grid">
                    <div className="stat-card summary-card">
                        <div className="stat-header">
                            <BarChart3 size={20} />
                            <h3>summary</h3>
                        </div>
                        <div className="stat-main">
                            <div className="big-stat">
                                <span className="stat-label">average rating</span>
                                <span className="stat-value">{stats.avgRating.toFixed(1)} / 5.0</span>
                            </div>
                            <div className="big-stat">
                                <span className="stat-label">total evaluations</span>
                                <span className="stat-value">{filteredReviews.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card graph-card">
                        <div className="stat-header">
                            <BarChart3 size={20} />
                            <h3>scientific metrics</h3>
                        </div>
                        <SpiderGraph data={stats.meanMetrics as any} size={300} />
                    </div>

                    <div className="stat-card graph-card wider">
                        <div className="stat-header">
                            <BarChart3 size={20} />
                            <h3>aroma profile</h3>
                        </div>
                        <AromaWheel data={stats.meanAroma} size={350} interactive={false} />
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <Filter size={48} className="empty-icon" />
                    <p>no evaluations match your current filters.</p>
                </div>
            )}
        </div>
    );
}

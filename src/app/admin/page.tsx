"use client";

import { useState, useEffect } from "react";
import { Star, ListFilter, Loader2, X } from "lucide-react";
import AromaWheel from "@/components/AromaWheel";
import MetricsDashboard from "@/components/MetricsDashboard";
import BeerManagement from "@/components/BeerManagement";
import SpiderGraph from "@/components/SpiderGraph";
import { supabase } from "@/lib/supabase";
import { Beer, Review } from "@/types";

export default function AdminDashboard() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [beers, setBeers] = useState<Beer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [activeTab, setActiveTab] = useState<"evaluations" | "metrics">("evaluations");

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) {
                setError("Supabase not configured");
                setLoading(false);
                return;
            }

            try {
                const [beersRes, reviewsRes] = await Promise.all([
                    supabase.from("beers").select("*"),
                    supabase.from("reviews").select("*").order("created_at", { ascending: false })
                ]);

                if (beersRes.error) throw beersRes.error;
                if (reviewsRes.error) throw reviewsRes.error;

                setBeers(beersRes.data || []);
                setReviews(reviewsRes.data || []);
            } catch (err: any) {
                console.error("Dashboard fetch error:", err);
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container py-32 flex justify-center">
                <Loader2 className="animate-spin opacity-20" size={48} />
            </div>
        );
    }

    if (error && reviews.length === 0) {
        return (
            <div className="container py-32 text-center">
                <p className="opacity-50">unable to connect to database or tables missing.</p>
                <p className="text-sm opacity-30 mt-2">{error}</p>
                <div className="mt-8 p-4 bg-muted border border-border inline-block text-left max-w-md mx-auto">
                    <p className="text-xs font-bold uppercase mb-2">tip</p>
                    <p className="text-xs opacity-70">
                        ensure you have run the setup script in your supabase sql editor:
                        <code className="block mt-2 p-2 bg-bg border border-border">supabase_setup.sql</code>
                    </p>
                </div>
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="container py-16">
            <header className="page-header">
                <h1 className="page-title">admin dashboard</h1>
                <p className="page-description">
                    monitoring scientific feedback and brewery performance.
                </p>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <label>total reviews</label>
                    <div className="stat-value">{reviews.length}</div>
                </div>
                <div className="stat-card">
                    <label>avg. rating</label>
                    <div className="stat-value">{avgRating}</div>
                </div>
                <div className="stat-card">
                    <label>active beers</label>
                    <div className="stat-value">{beers.length}</div>
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === "evaluations" ? "active" : ""}`}
                    onClick={() => setActiveTab("evaluations")}
                >
                    recent evaluations
                </button>
                <button
                    className={`tab-btn ${activeTab === "metrics" ? "active" : ""}`}
                    onClick={() => setActiveTab("metrics")}
                >
                    scientific metrics
                </button>
            </div>

            <div className="admin-content">
                {activeTab === "evaluations" ? (
                    <div className="reviews-section">
                        <div className="section-header">
                            <h2 className="section-title">recent evaluations</h2>
                            <button className="btn btn-secondary btn-sm">
                                <ListFilter size={14} />
                                <span>filter</span>
                            </button>
                        </div>

                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>beer</th>
                                        <th>rating</th>
                                        <th>metrics (avg)</th>
                                        <th>date</th>
                                        <th>actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review) => {
                                        const beer = beers.find(b => b.id === review.beer_id);
                                        const m = review.metrics;
                                        const avgMetric = (
                                            (m.appearance + m.aroma + m.flavor + m.mouthfeel + m.bubbles) / 5
                                        ).toFixed(1);

                                        return (
                                            <tr key={review.id}>
                                                <td className="font-bold">{beer?.name || "unknown beer"}</td>
                                                <td>
                                                    <div className="rating-cell">
                                                        <Star size={12} fill="currentColor" />
                                                        <span>{review.rating}</span>
                                                    </div>
                                                </td>
                                                <td>{avgMetric} / 10</td>
                                                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="text-btn"
                                                        onClick={() => setSelectedReview(review)}
                                                    >
                                                        view details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {reviews.length === 0 && (
                                <p className="py-8 text-center opacity-60">no reviews recorded yet.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <MetricsDashboard beers={beers} reviews={reviews} />
                )}

                <BeerManagement />
            </div>

            {/* Review Details Overlay */}
            {selectedReview && (
                <div className="overlay" onClick={() => setSelectedReview(null)}>
                    <div className="overlay-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedReview(null)}>
                            <X size={20} />
                        </button>

                        <header className="overlay-header">
                            <span className="style-tag">evaluation detail</span>
                            <h2 className="overlay-title">
                                {beers.find(b => b.id === selectedReview.beer_id)?.name || "unknown beer"}
                            </h2>
                            <div className="overlay-meta">
                                <div className="rating-cell large">
                                    <Star size={16} fill="currentColor" />
                                    <span>{selectedReview.rating} / 5</span>
                                </div>
                                <span className="date">{new Date(selectedReview.created_at).toLocaleString()}</span>
                            </div>
                            {(selectedReview.reviewer_name || selectedReview.reviewer_sex || selectedReview.reviewer_age) && (
                                <div className="reviewer-info">
                                    {selectedReview.reviewer_name && <span className="reviewer-name">{selectedReview.reviewer_name}</span>}
                                    {selectedReview.reviewer_sex && <span className="reviewer-tag">{selectedReview.reviewer_sex}</span>}
                                    {selectedReview.reviewer_age && <span className="reviewer-tag">{selectedReview.reviewer_age}y</span>}
                                </div>
                            )}
                        </header>

                        <div className="overlay-grid">
                            <div className="graph-col">
                                <h3 className="section-label">scientific metrics</h3>
                                <SpiderGraph data={selectedReview.metrics} size={260} />
                                <div className="mt-8">
                                    <h3 className="section-label">aroma profile</h3>
                                    <AromaWheel data={selectedReview.aroma_profile} size={260} interactive={false} />
                                </div>
                            </div>
                            <div className="info-col">
                                <h3 className="section-label">tasting notes</h3>
                                <p className="comment-text">
                                    {selectedReview.comment || "no comment provided."}
                                </p>

                                <div className="metrics-list">
                                    {Object.entries(selectedReview.metrics).map(([key, val]) => (
                                        <div key={key} className="metric-row">
                                            <span className="metric-name">{key}</span>
                                            <div className="metric-bar-bg">
                                                <div className="metric-bar-fill" style={{ width: `${(val as number) * 10}%` }}></div>
                                            </div>
                                            <span className="metric-val">{val}/10</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .py-16 { padding: var(--space-16) 0; }
        .page-header { margin-bottom: var(--space-12); }
        .page-title { font-size: 3rem; font-weight: 800; text-transform: lowercase; }
        .page-description { opacity: 0.8; }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-12);
        }
        .stat-card {
          padding: var(--space-6);
          border: 1px solid var(--border);
          background: var(--muted);
        }
        .stat-card label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.7;
          font-weight: 700;
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          margin-top: var(--space-2);
        }

        .admin-tabs {
            display: flex;
            gap: var(--space-8);
            margin-bottom: var(--space-8);
            border-bottom: 1px solid var(--border);
        }
        .tab-btn {
            padding: var(--space-4) 0;
            font-size: 0.875rem;
            font-weight: 700;
            text-transform: lowercase;
            opacity: 0.4;
            transition: all 0.2s ease;
            position: relative;
        }
        .tab-btn.active {
            opacity: 1;
        }
        .tab-btn.active::after {
            content: "";
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--accent);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: lowercase;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .admin-table th {
          text-align: left;
          padding: var(--space-4);
          border-bottom: 2px solid var(--border);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          opacity: 0.8;
        }
        .admin-table td {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border);
        }
        .font-bold { font-weight: 700; text-transform: lowercase; }
        .rating-cell { display: flex; align-items: center; gap: var(--space-1); }
        .rating-cell.large { font-size: 1.25rem; font-weight: 800; color: var(--accent); }
        .text-btn {
          font-size: 0.75rem;
          text-decoration: underline;
          color: var(--fg);
          opacity: 0.8;
          text-transform: lowercase;
        }
        .text-btn:hover { opacity: 1; }
        .btn-sm {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
        }

        /* Overlay Styles */
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(4px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-4);
        }
        .overlay-content {
            background: var(--bg);
            width: 100%;
            max-width: 800px;
            padding: var(--space-10);
            position: relative;
            border: 1px solid var(--border);
        }
        .close-btn {
            position: absolute;
            top: var(--space-4);
            right: var(--space-4);
            opacity: 0.4;
        }
        .close-btn:hover { opacity: 1; }
        .overlay-header { margin-bottom: var(--space-8); }
        .style-tag { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; }
        .overlay-title { font-size: 2.5rem; font-weight: 800; text-transform: lowercase; margin: var(--space-1) 0; }
        .overlay-meta { display: flex; align-items: center; gap: var(--space-6); margin-bottom: var(--space-4); }
        .date { font-size: 0.875rem; opacity: 0.7; }
        .reviewer-info { display: flex; gap: var(--space-3); align-items: center; opacity: 0.7; font-size: 0.875rem; }
        .reviewer-name { font-weight: 700; text-transform: lowercase; }
        .reviewer-tag { font-size: 0.75rem; background: var(--muted); padding: 2px 8px; border-radius: 100px; text-transform: lowercase; }
        .mt-8 { margin-top: var(--space-8); }
        
        .overlay-grid {
            display: grid;
            gap: var(--space-10);
        }
        @media (min-width: 768px) {
            .overlay-grid { grid-template-columns: 1fr 1fr; }
        }
        
        .section-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0.7;
            margin-bottom: var(--space-4);
        }
        .comment-text {
            font-size: 1.125rem;
            line-height: 1.6;
            margin-bottom: var(--space-8);
        }
        
        .metrics-list { display: grid; gap: var(--space-3); }
        .metric-row { display: grid; grid-template-columns: 80px 1fr 40px; align-items: center; gap: var(--space-4); }
        .metric-name { font-size: 0.75rem; font-weight: 700; text-transform: lowercase; opacity: 0.6; }
        .metric-bar-bg { height: 4px; background: var(--muted); border-radius: 2px; }
        .metric-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; }
        .metric-val { font-size: 0.75rem; font-weight: 700; text-align: right; }
      `}</style>
        </div>
    );
}

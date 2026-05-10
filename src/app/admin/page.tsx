"use client";

import { useState, useEffect } from "react";
import { Star, ListFilter, Loader2, X, LogOut } from "lucide-react";
import AromaWheel from "@/components/AromaWheel";
import MetricsDashboard from "@/components/MetricsDashboard";
import BeerManagement from "@/components/BeerManagement";
import SpiderGraph from "@/components/SpiderGraph";
import { createClient } from "@/utils/supabase/client";
import { Beer, Review } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [beers, setBeers] = useState<Beer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [activeTab, setActiveTab] = useState<"evaluations" | "metrics">("evaluations");
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

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
                <div className="mt-8 p-4 bg-muted inline-block text-left max-w-md mx-auto" style={{ border: "1px solid var(--border)" }}>
                    <p className="text-xs font-bold uppercase mb-2">tip</p>
                    <p className="text-xs opacity-70">
                        ensure you have run the setup script in your supabase sql editor:
                        <code style={{ display: "block", marginTop: "0.5rem", padding: "0.5rem", background: "var(--surface)", border: "1px solid var(--border)" }}>supabase_setup.sql</code>
                    </p>
                </div>
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="container admin-page py-16">
            <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 className="page-title">admin dashboard</h1>
                    <p className="page-description">
                        monitoring scientific feedback and brewery performance.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-secondary admin-logout"
                >
                    <LogOut size={16} />
                    <span>logout</span>
                </button>
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
                                            (m.appearance + m.aroma + m.flavor + m.mouthfeel + m.bubbles + (m.bitterness || 0)) / 6
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

            {selectedReview && (
                <div className="admin-overlay" onClick={() => setSelectedReview(null)}>
                    <div className="admin-overlay-content" onClick={e => e.stopPropagation()}>
                        <button className="admin-close-btn" onClick={() => setSelectedReview(null)}>
                            <X size={20} />
                        </button>

                        <header className="admin-overlay-header">
                            <span className="admin-style-tag">evaluation detail</span>
                            <h2 className="admin-overlay-title">
                                {beers.find(b => b.id === selectedReview.beer_id)?.name || "unknown beer"}
                            </h2>
                            <div className="admin-overlay-meta">
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

                        <div className="admin-overlay-grid">
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
                                                <div className="metric-bar-fill" style={{ width: `${((val as number) || 0) * 10}%` }}></div>
                                            </div>
                                            <span className="metric-val">{(val as number) || 0}/10</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

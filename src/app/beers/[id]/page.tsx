"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Beaker, Eye, Droplets, Utensils, Wind, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Beer, Review, AromaProfile } from "@/types";
import AromaWheel from "@/components/AromaWheel";

const INITIAL_AROMA: AromaProfile = {
    menthol: 0, tea: 0, green_fruits: 0, citrus: 0,
    green: 0, vegetal: 0, cream_caramel: 0, woody_aromatic: 0,
    spicy_herbal: 0, red_berries: 0, sweet_fruits: 0, floral: 0
};

export default function BeerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [beer, setBeer] = useState<Beer | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            // Fetch beer
            const { data: beerData } = await supabase
                .from("beers")
                .select("*")
                .eq("id", resolvedParams.id)
                .single();

            if (beerData) {
                setBeer(beerData);

                // Fetch reviews
                const { data: reviewsData } = await supabase
                    .from("reviews")
                    .select("*")
                    .eq("beer_id", resolvedParams.id);

                if (reviewsData) {
                    setReviews(reviewsData);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="container py-32 flex justify-center">
                <Loader2 className="animate-spin opacity-20" size={48} />
            </div>
        );
    }

    if (!beer) {
        notFound();
    }

    // Calculate aggregated metrics
    const hasReviews = reviews.length > 0;
    const meanAroma = reviews.reduce((acc, r) => {
        const ap = r.aroma_profile;
        Object.keys(acc).forEach(key => {
            acc[key as keyof AromaProfile] += (ap[key as keyof AromaProfile] || 0);
        });
        return acc;
    }, { ...INITIAL_AROMA });

    if (hasReviews) {
        Object.keys(meanAroma).forEach(key => {
            meanAroma[key as keyof AromaProfile] /= reviews.length;
        });
    }

    const meanMetrics = reviews.reduce((acc, r) => {
        acc.appearance += r.metrics.appearance;
        acc.aroma += r.metrics.aroma;
        acc.flavor += r.metrics.flavor;
        acc.mouthfeel += r.metrics.mouthfeel;
        acc.bubbles += r.metrics.bubbles;
        return acc;
    }, { appearance: 0, aroma: 0, flavor: 0, mouthfeel: 0, bubbles: 0 });

    if (hasReviews) {
        meanMetrics.appearance /= reviews.length;
        meanMetrics.aroma /= reviews.length;
        meanMetrics.flavor /= reviews.length;
        meanMetrics.mouthfeel /= reviews.length;
        meanMetrics.bubbles /= reviews.length;
    }

    return (
        <div className="container py-16">
            <Link href="/beers" className="back-link">
                <ArrowLeft size={16} />
                <span>back to beers</span>
            </Link>

            <div className="beer-detail-grid">
                <div className="beer-visual">
                    <div className="image-wrapper">
                        <img src={beer.label_url} alt={beer.name} className="label-display" />
                    </div>

                    <div className="aggregation-section">
                        <h2 className="section-title">community taste profile</h2>
                        {hasReviews ? (
                            <div className="wheel-box">
                                <AromaWheel data={meanAroma} size={300} interactive={false} />
                                <p className="review-count">based on {reviews.length} scientific evaluations</p>
                            </div>
                        ) : (
                            <p className="no-data">be the first to chart this beer's profile.</p>
                        )}
                    </div>
                </div>

                <div className="beer-content">
                    <header className="detail-header">
                        <span className="style-tag">{beer.style}</span>
                        <h1 className="detail-title">{beer.name}</h1>
                        <p className="detail-abv">{beer.abv}% alcohol by volume</p>
                    </header>

                    <div className="detail-description">
                        <p>{beer.description}</p>
                    </div>

                    <div className="scientific-section">
                        <h2 className="section-title">brewer's scientific profile</h2>
                        <div className="profile-grid">
                            <div className="profile-item">
                                <div className="profile-icon"><Eye size={18} /></div>
                                <div>
                                    <h3>appearance</h3>
                                    <p>{beer.scientific_profile.appearance}</p>
                                </div>
                            </div>
                            <div className="profile-item">
                                <div className="profile-icon"><Beaker size={18} /></div>
                                <div>
                                    <h3>aroma</h3>
                                    <p>{beer.scientific_profile.aroma}</p>
                                </div>
                            </div>
                            <div className="profile-item">
                                <div className="profile-icon"><Utensils size={18} /></div>
                                <div>
                                    <h3>flavor</h3>
                                    <p>{beer.scientific_profile.flavor}</p>
                                </div>
                            </div>
                            <div className="profile-item">
                                <div className="profile-icon"><Droplets size={18} /></div>
                                <div>
                                    <h3>mouthfeel</h3>
                                    <p>{beer.scientific_profile.mouthfeel}</p>
                                </div>
                            </div>
                            <div className="profile-item">
                                <div className="profile-icon"><Wind size={18} /></div>
                                <div>
                                    <h3>bubbles</h3>
                                    <p>{beer.scientific_profile.bubbles}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-actions">
                        <Link href={`/feedback/${beer.id}`} className="btn btn-primary">
                            submit feedback
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .py-16 { padding: var(--space-16) 0; }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          opacity: 0.6;
          margin-bottom: var(--space-12);
          transition: opacity 0.2s ease;
          text-transform: lowercase;
        }
        .back-link:hover { opacity: 1; }
        .beer-detail-grid {
          display: grid;
          gap: var(--space-16);
        }
        @media (min-width: 768px) {
          .beer-detail-grid { grid-template-columns: 1fr 1.5fr; }
        }
        .image-wrapper {
          aspect-ratio: 1;
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
        .label-display { max-width: 80%; max-height: 80%; object-fit: contain; }
        .style-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.5;
        }
        .detail-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1;
          margin: var(--space-2) 0;
          text-transform: lowercase;
          letter-spacing: -0.04em;
        }
        .detail-abv { font-size: 1.25rem; opacity: 0.6; }
        .detail-description { font-size: 1.125rem; margin: var(--space-8) 0; line-height: 1.6; }
        
        .aggregation-section {
          margin-top: var(--space-12);
        }
        .wheel-box {
          background: var(--muted);
          padding: var(--space-8) var(--space-4);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .review-count {
          font-size: 0.75rem;
          opacity: 0.5;
          margin-top: var(--space-4);
          font-weight: 600;
          text-transform: lowercase;
        }
        .no-data {
          font-size: 0.875rem;
          opacity: 0.5;
          font-style: italic;
        }

        .scientific-section {
          background: var(--muted);
          padding: var(--space-8);
          border-radius: 4px;
        }
        .section-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: var(--space-6);
          opacity: 0.4;
        }
        .profile-grid { display: grid; gap: var(--space-6); }
        .profile-item { display: flex; gap: var(--space-4); }
        .profile-icon { opacity: 0.4; padding-top: 2px; }
        .profile-item h3 { font-size: 0.875rem; font-weight: 700; margin-bottom: 2px; text-transform: lowercase; }
        .profile-item p { font-size: 0.875rem; opacity: 0.8; }
        .detail-actions { margin-top: var(--space-12); }
      `}</style>
        </div>
    );
}

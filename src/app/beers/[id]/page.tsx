"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Beaker, Eye, Droplets, Utensils, Wind, Loader2, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Beer, Review, AromaProfile } from "@/types";
import AromaWheel from "@/components/AromaWheel";

const INITIAL_AROMA: AromaProfile = {
    earthy: 0, sour_acidic: 0, sweet: 0, bitter: 0,
    spicy: 0, light_grain: 0, dark_grain: 0, citrus: 0,
    berry: 0, tropical: 0, floral: 0, nutty: 0
};

export default function BeerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [beer, setBeer] = useState<Beer | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

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
        acc.bitterness += (r.metrics.bitterness || 0);
        return acc;
    }, { appearance: 0, aroma: 0, flavor: 0, mouthfeel: 0, bubbles: 0, bitterness: 0 });

    if (hasReviews) {
        meanMetrics.appearance /= reviews.length;
        meanMetrics.aroma /= reviews.length;
        meanMetrics.flavor /= reviews.length;
        meanMetrics.mouthfeel /= reviews.length;
        meanMetrics.bubbles /= reviews.length;
        meanMetrics.bitterness /= reviews.length;
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
                        <Image
                            src={beer.label_url}
                            alt={beer.name}
                            className="label-display"
                            fill
                            sizes="(max-width: 768px) 100vw, 40vw"
                            unoptimized
                        />
                    </div>

                    <div className="aggregation-section">
                        <h2 className="section-title">community taste profile</h2>
                        {hasReviews ? (
                            <div className="wheel-box">
                                <AromaWheel data={meanAroma} size={300} interactive={false} />
                                <p className="review-count">based on {reviews.length} evaluations</p>
                            </div>
                        ) : (
                            <p className="no-data">be the first to chart this beer's profile.</p>
                        )}
                    </div>
                </div>

                <div className="beer-content">
                    <header className="detail-header">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="style-tag">{beer.style}</span>
                                <h1 className="detail-title">{beer.name}</h1>
                            </div>
                            {hasReviews && (
                                <div className="beer-rating flex items-center gap-2 text-xl font-bold mt-4">
                                    <Star size={20} fill="currentColor" />
                                    <span>{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        <p className="detail-abv">{beer.abv}% alcohol by volume</p>
                    </header>

                    <div className="detail-description">
                        <p>{beer.description}</p>
                    </div>

                    <div className="scientific-section">
                        <h2 className="section-title">brewer's profile</h2>
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
        </div>
    );
}

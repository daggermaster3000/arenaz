"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Beaker, Eye, Droplets, Utensils, Wind, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Beer, Review, AromaProfile } from "@/types";
import AromaWheel from "@/components/AromaWheel";

const INITIAL_AROMA: AromaProfile = {
    earthy: 0, sour_acidic: 0, sweet: 0, bitter: 0,
    spicy: 0, light_grain: 0, dark_grain: 0, citrus: 0,
    berry: 0, tropical: 0, floral: 0, nutty: 0
};

const PROFILE_FIELDS: Array<{
    key: keyof Beer["scientific_profile"];
    label: string;
    icon: React.ComponentType<{ size?: number }>;
}> = [
    { key: "appearance", label: "appearance", icon: Eye },
    { key: "aroma", label: "aroma", icon: Beaker },
    { key: "flavor", label: "flavor", icon: Utensils },
    { key: "mouthfeel", label: "mouthfeel", icon: Droplets },
    { key: "bubbles", label: "carbonation", icon: Wind },
];

export default function BeerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [beer, setBeer] = useState<Beer | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const { data: beerData } = await supabase
                .from("beers")
                .select("*")
                .eq("id", resolvedParams.id)
                .single();

            if (beerData) {
                setBeer(beerData);

                const { data: reviewsData } = await supabase
                    .from("reviews")
                    .select("*")
                    .eq("beer_id", resolvedParams.id);

                if (reviewsData) setReviews(reviewsData);
            }
            setLoading(false);
        };
        fetchData();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="loading-screen">
                <Loader2 className="animate-spin" size={28} />
                <span>loading sample…</span>
            </div>
        );
    }

    if (!beer) notFound();

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

    const avgRating = hasReviews
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="container page-shell">
            <Link href="/beers" className="back-link">
                <ArrowLeft size={14} />
                <span>index / beers</span>
            </Link>

            {/* ── HERO ─────────────────────────────────────── */}
            <header className="detail-hero">
                <div>
                    <div className="detail-eyebrow">
                        <span className="style">{beer.style}</span>
                        <span className="rule" aria-hidden />
                        <span className="mono">sample / {beer.id.slice(0, 6).toUpperCase()}</span>
                    </div>
                    <h1 className="detail-title">{beer.name}</h1>
                </div>

                {avgRating && (
                    <div className="detail-rating-block">
                        <span className="num">{avgRating}</span>
                        <div className="meta">
                            <span>average</span>
                            <span>rating /5</span>
                        </div>
                    </div>
                )}
            </header>

            {/* ── DATA STRIP ───────────────────────────────── */}
            <div className="detail-data-strip">
                <div className="detail-data-cell accent">
                    <span className="detail-data-label">abv</span>
                    <span className="detail-data-value">{beer.abv}%</span>
                </div>
                <div className="detail-data-cell">
                    <span className="detail-data-label">style</span>
                    <span className="detail-data-value" style={{ fontSize: "1rem", fontWeight: 600, textTransform: "lowercase" }}>{beer.style}</span>
                </div>
                <div className="detail-data-cell">
                    <span className="detail-data-label">evaluations</span>
                    <span className="detail-data-value">{String(reviews.length).padStart(2, "0")}</span>
                </div>
                <div className="detail-data-cell">
                    <span className="detail-data-label">avg. rating</span>
                    <span className="detail-data-value">{avgRating ?? "—"}</span>
                </div>
            </div>

            {/* ── MAIN GRID ────────────────────────────────── */}
            <div className="detail-grid">
                <div className="detail-visual">
                    <div className="image-wrapper">
                        <Image
                            src={beer.label_url}
                            alt={beer.name}
                            className="label-display"
                            fill
                            sizes="(max-width: 900px) 100vw, 38vw"
                            quality={82}
                            priority
                        />
                    </div>

                    <div className="aggregation-section">
                        <div className="aggregation-header">
                            <span><span className="num">03</span> · community profile</span>
                            <span>{reviews.length} eval.</span>
                        </div>
                        {hasReviews ? (
                            <div className="wheel-box">
                                <AromaWheel data={meanAroma} size={300} interactive={false} />
                                <p className="review-count">aggregate of {reviews.length} taster{reviews.length !== 1 ? "s" : ""}</p>
                            </div>
                        ) : (
                            <p className="no-data">— awaiting first evaluation —</p>
                        )}
                    </div>
                </div>

                <div className="detail-content">
                    <p className="detail-description">{beer.description}</p>

                    <div>
                        <div className="section-marker">
                            <span className="num">04</span>
                            <span>brewer&rsquo;s profile</span>
                            <span className="rule" aria-hidden />
                        </div>

                        <div className="profile-cards">
                            {PROFILE_FIELDS.map(({ key, label, icon: Icon }, i) => (
                                <div key={key} className="profile-card">
                                    <div className="profile-card-head">
                                        <span className="profile-card-num">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="profile-card-icon"><Icon size={14} /></span>
                                    </div>
                                    <h3>{label}</h3>
                                    <p>{beer.scientific_profile[key]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-cta">
                        <span className="detail-cta-text">contribute · evaluate this beer</span>
                        <Link href={`/feedback/${beer.id}`} className="btn btn-accent btn-arrow">
                            submit feedback
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

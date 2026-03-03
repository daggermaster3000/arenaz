"use client";

import React, { useState } from "react";
import { Beer, AromaProfile } from "@/types";
import MetricInput from "./MetricInput";
import StarRating from "./StarRating";
import AromaWheel from "./AromaWheel";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, User, UserCircle } from "lucide-react";

interface FeedbackFormProps {
    beer: Beer;
}

const INITIAL_AROMA: AromaProfile = {
    earthy: 0, sour_acidic: 0, sweet: 0, bitter: 0,
    spicy: 0, light_grain: 0, dark_grain: 0, citrus: 0,
    berry: 0, tropical: 0, floral: 0, nutty: 0
};

export default function FeedbackForm({ beer }: FeedbackFormProps) {
    const [rating, setRating] = useState(0);
    const [metrics, setMetrics] = useState({
        appearance: 5,
        aroma: 5,
        flavor: 5,
        mouthfeel: 5,
        bubbles: 5,
        bitterness: 5
    });
    const [aromaProfile, setAromaProfile] = useState<AromaProfile>(INITIAL_AROMA);
    const [comment, setComment] = useState("");
    const [reviewer, setReviewer] = useState({
        name: "",
        sex: "",
        age: ""
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        if (!supabase) {
            console.warn("Supabase not configured, simulating success.");
            setTimeout(() => setStatus("success"), 1000);
            return;
        }

        const { error } = await supabase.from("reviews").insert([
            {
                beer_id: beer.id,
                rating,
                metrics,
                aroma_profile: aromaProfile,
                comment,
                reviewer_name: reviewer.name || null,
                reviewer_sex: reviewer.sex || null,
                reviewer_age: reviewer.age ? parseInt(reviewer.age) : null
            },
        ]);

        if (error) {
            console.error("Feedback submission error:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        } else {
            setStatus("success");
        }
    };

    if (status === "success") {
        return (
            <div className="success-state">
                <CheckCircle2 size={48} />
                <h2>merci!</h2>
                <p>your scientific evaluation of {beer.name} has been recorded.</p>
                <button onClick={() => window.location.href = "/beers"} className="btn btn-primary">
                    back to beers
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-section">
                <label className="section-label">who are you? <span className="optional">(optional)</span></label>
                <div className="demographics-grid">
                    <div className="field">
                        <input
                            type="text"
                            placeholder="your name"
                            value={reviewer.name}
                            onChange={e => setReviewer({ ...reviewer, name: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <select
                            value={reviewer.sex}
                            onChange={e => setReviewer({ ...reviewer, sex: e.target.value })}
                        >
                            <option value="">sex</option>
                            <option value="male">male</option>
                            <option value="female">female</option>
                            <option value="other">other</option>
                            <option value="private">prefer not to say</option>
                        </select>
                    </div>
                    <div className="field">
                        <input
                            type="number"
                            placeholder="age"
                            value={reviewer.age}
                            onChange={e => setReviewer({ ...reviewer, age: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <label className="section-label">overall experience</label>
                <StarRating rating={rating} onRatingChange={setRating} size={32} />
            </div>

            <div className="form-section">
                <label className="section-label">aroma profiling</label>
                <p className="section-desc">precisely tune the flavor intensity across 12 scientific categories.</p>

                <div className="aroma-interactive-container">
                    <div className="aroma-wheel-box">
                        <AromaWheel
                            data={aromaProfile}
                            size={320}
                            interactive={false}
                        />
                    </div>

                    <div className="aroma-sliders-grid">
                        {Object.entries(aromaProfile).map(([key, value]) => (
                            <div key={key} className="aroma-slider-item">
                                <label className="aroma-slider-label">
                                    <span>{key.replace('_', ' ')}</span>
                                    <span className="aroma-val">{value}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={value}
                                    onChange={(e) => setAromaProfile({
                                        ...aromaProfile,
                                        [key]: parseInt(e.target.value)
                                    })}
                                    className="aroma-range-input"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="form-section">
                <label className="section-label">metrics</label>
                <p className="section-desc">assess on a scale of 1-10 the following metrics</p>

                <MetricInput
                    label="bubbles & carbonation"
                    description="Assess the size, intensity, and persistence of the carbon dioxide bubbles. Is it lively, prickly, or creamy?"
                    value={metrics.bubbles}
                    onChange={(v) => setMetrics({ ...metrics, bubbles: v })}
                />

                <MetricInput
                    label="appearance"
                    description="Color, clarity, does it look nice?"
                    value={metrics.appearance}
                    onChange={(v) => setMetrics({ ...metrics, appearance: v })}
                />

                <MetricInput
                    label="aroma profile"
                    description="Intensity and complexity of the scents. Does it smell nice?"
                    value={metrics.aroma}
                    onChange={(v) => setMetrics({ ...metrics, aroma: v })}
                />

                <MetricInput
                    label="flavor balance"
                    description="Interaction between malt sweetness and hop bitterness. Note any off-flavors or specific flavor compounds. Does it taste nice?"
                    value={metrics.flavor}
                    onChange={(v) => setMetrics({ ...metrics, flavor: v })}
                />

                <MetricInput
                    label="mouthfeel & body"
                    description="The tactile sensation of the beer. Consider viscosity, astringency, and warmth from alcohol."
                    value={metrics.mouthfeel}
                    onChange={(v) => setMetrics({ ...metrics, mouthfeel: v })}
                />

                <MetricInput
                    label="bitterness"
                    description="Intensity and quality of the hop bitterness. Is it smooth, sharp, or lingering?"
                    value={metrics.bitterness}
                    onChange={(v) => setMetrics({ ...metrics, bitterness: v })}
                />
            </div>

            <div className="form-section">
                <label className="section-label">observations</label>
                <textarea
                    placeholder="any additional scientific notes or tasting observations..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="comment-area"
                    rows={4}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={status === "submitting" || rating === 0}
            >
                {status === "submitting" ? "submitting..." : "submit evaluation"}
            </button>

            <style jsx>{`
                .feedback-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-8);
                }
                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }
                .section-header {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }
                .section-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    opacity: 0.8;
                    font-weight: 700;
                }
                .section-desc {
                    font-size: 0.75rem;
                    opacity: 0.5;
                }
                .optional {
                    font-size: 0.625rem;
                    opacity: 0.5;
                    font-weight: 400;
                }
                .demographics-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: var(--space-4);
                }
                .field input, .field select {
                    width: 100%;
                    padding: var(--space-3);
                    background: var(--muted);
                    border: 1px solid var(--border);
                    color: var(--fg);
                    font-family: inherit;
                    font-size: 0.875rem;
                }
                .aroma-wheel-box {
                    padding: var(--space-4);
                    background: var(--muted);
                    border: 1px solid var(--border);
                    display: flex;
                    justify-content: center;
                    flex: 1;
                }
                .aroma-interactive-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }
                @media (min-width: 768px) {
                    .aroma-interactive-container {
                        flex-direction: row;
                        align-items: flex-start;
                    }
                }
                .aroma-sliders-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-3) var(--space-6);
                    flex: 1.2;
                }
                .aroma-slider-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .aroma-slider-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    opacity: 0.6;
                }
                .aroma-val {
                    opacity: 1;
                    color: var(--accent);
                }
                .aroma-range-input {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 2px;
                    background: var(--border);
                    outline: none;
                    margin: 8px 0;
                }
                .aroma-range-input::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 10px;
                    height: 10px;
                    background: var(--fg);
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.1s ease;
                }
                .aroma-range-input::-webkit-slider-thumb:hover {
                    transform: scale(1.3);
                }
                .comment-area {
                    width: 100%;
                    padding: var(--space-4);
                    background: var(--muted);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    color: var(--fg);
                    font-family: inherit;
                    resize: vertical;
                }
                .comment-area:focus {
                    outline: none;
                    border-color: var(--accent);
                }
                .btn-block {
                    width: 100%;
                    justify-content: center;
                    padding: var(--space-4);
                }
                .success-state {
                    text-align: center;
                    padding: var(--space-12) 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-4);
                }
                .success-state h2 {
                    font-size: 2.5rem;
                    font-weight: 800;
                }
            `}</style>
        </form>
    );
}

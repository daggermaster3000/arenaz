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
    menthol: 0, tea: 0, green_fruits: 0, citrus: 0,
    green: 0, vegetal: 0, cream_caramel: 0, woody_aromatic: 0,
    spicy_herbal: 0, red_berries: 0, sweet_fruits: 0, floral: 0
};

export default function FeedbackForm({ beer }: FeedbackFormProps) {
    const [rating, setRating] = useState(0);
    const [metrics, setMetrics] = useState({
        appearance: 5,
        aroma: 5,
        flavor: 5,
        mouthfeel: 5,
        bubbles: 5
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
                <label className="section-label">aroma profiling (interactive wheel)</label>
                <p className="section-desc">click or tap on the wheel to chart the flavor intensity across 12 scientific categories.</p>
                <div className="aroma-wheel-box">
                    <AromaWheel
                        data={aromaProfile}
                        onChange={setAromaProfile}
                        size={320}
                        interactive={true}
                    />
                </div>
            </div>

            <div className="form-section">
                <label className="section-label">scientific metrics</label>

                <MetricInput
                    label="bubbles & carbonation"
                    description="Assess the size, intensity, and persistence of the carbon dioxide bubbles. Is it lively, prickly, or creamy?"
                    value={metrics.bubbles}
                    onChange={(v) => setMetrics({ ...metrics, bubbles: v })}
                />

                <MetricInput
                    label="appearance"
                    description="Color, clarity, and head retention. Look for the SRM (Standard Reference Method) color and head stability."
                    value={metrics.appearance}
                    onChange={(v) => setMetrics({ ...metrics, appearance: v })}
                />

                <MetricInput
                    label="aroma profile"
                    description="Intensity and complexity of the scents. Identify malt sweetness, hop character, and fermentation byproducts."
                    value={metrics.aroma}
                    onChange={(v) => setMetrics({ ...metrics, aroma: v })}
                />

                <MetricInput
                    label="flavor balance"
                    description="Interaction between malt sweetness and hop bitterness. Note any off-flavors or specific flavor compounds."
                    value={metrics.flavor}
                    onChange={(v) => setMetrics({ ...metrics, flavor: v })}
                />

                <MetricInput
                    label="mouthfeel & body"
                    description="The tactile sensation of the beer. Consider viscosity, astringency, and warmth from alcohol."
                    value={metrics.mouthfeel}
                    onChange={(v) => setMetrics({ ...metrics, mouthfeel: v })}
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

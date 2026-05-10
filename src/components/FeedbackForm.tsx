"use client";

import React, { useEffect, useState } from "react";
import { Beer, AromaProfile } from "@/types";
import MetricInput from "./MetricInput";
import StarRating from "./StarRating";
import AromaWheel from "./AromaWheel";
import { supabase } from "@/lib/supabase";
import { CheckCircle2 } from "lucide-react";

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
    const [wheelSize, setWheelSize] = useState(320);
    const [comment, setComment] = useState("");
    const [reviewer, setReviewer] = useState({
        name: "",
        sex: "",
        age: ""
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    useEffect(() => {
        const updateWheelSize = () => {
            const availableWidth = Math.min(window.innerWidth - 32, 320);
            setWheelSize(Math.max(240, availableWidth));
        };

        updateWheelSize();
        window.addEventListener("resize", updateWheelSize);
        return () => window.removeEventListener("resize", updateWheelSize);
    }, []);

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

            {/* ── Who are you? ─────────────────────────────── */}
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

            {/* ── Overall experience ───────────────────────── */}
            <div className="form-section">
                <label className="section-label">overall experience</label>
                <StarRating rating={rating} onRatingChange={setRating} size={32} />
            </div>

            {/* ── Aroma profiling ──────────────────────────── */}
            <div className="form-section">
                <label className="section-label">aroma profiling</label>
                <p className="section-desc">precisely tune the flavor intensity across 12 scientific categories.</p>

                <div className="aroma-interactive-container">
                    <div className="aroma-wheel-box">
                        <AromaWheel
                            data={aromaProfile}
                            size={wheelSize}
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

            {/* ── Tasting metrics ──────────────────────────── */}
            <div className="form-section">
                <label className="section-label">tasting metrics</label>
                <p className="section-desc">rate each attribute from 1 (poor) to 10 (excellent).</p>

                <div className="metrics-group">
                    <span className="metrics-group-label">perception</span>
                    <MetricInput
                        label="appearance"
                        description="Color, clarity, and visual appeal. Does it look inviting?"
                        value={metrics.appearance}
                        onChange={(v) => setMetrics({ ...metrics, appearance: v })}
                    />
                    <MetricInput
                        label="aroma"
                        description="Intensity and complexity of the scents. Does it smell inviting?"
                        value={metrics.aroma}
                        onChange={(v) => setMetrics({ ...metrics, aroma: v })}
                    />
                </div>

                <div className="metrics-group">
                    <span className="metrics-group-label">palate</span>
                    <MetricInput
                        label="flavor balance"
                        description="Interaction between malt sweetness and hop bitterness. Note any off-flavors. Does it taste good?"
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

                <div className="metrics-group">
                    <span className="metrics-group-label">character</span>
                    <MetricInput
                        label="bubbles & carbonation"
                        description="Assess the size, intensity, and persistence of the CO₂ bubbles. Is it lively, prickly, or creamy?"
                        value={metrics.bubbles}
                        onChange={(v) => setMetrics({ ...metrics, bubbles: v })}
                    />
                </div>
            </div>

            {/* ── Observations ─────────────────────────────── */}
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
                title={rating === 0 ? "please add an overall star rating first" : undefined}
            >
                {status === "submitting" ? "submitting..." : "submit evaluation"}
            </button>

            {rating === 0 && (
                <p className="text-center text-xs opacity-50" style={{ marginTop: "-0.5rem" }}>
                    add a star rating above to enable submission
                </p>
            )}

        </form>
    );
}

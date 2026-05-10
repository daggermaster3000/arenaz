"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import FeedbackForm from "@/components/FeedbackForm";
import { supabase } from "@/lib/supabase";
import { Beer } from "@/types";
import { Loader2 } from "lucide-react";

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [beer, setBeer] = useState<Beer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeer = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("beers")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (!error && data) setBeer(data);
      setLoading(false);
    };
    fetchBeer();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="animate-spin" size={28} />
        <span>preparing form…</span>
      </div>
    );
  }

  if (!beer) notFound();

  return (
    <div className="container feedback-page page-shell">
      <div className="feedback-layout">
        <header className="page-head" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <div className="page-eyebrow">
              <span className="num">N° 03</span>
              <span className="rule" aria-hidden />
              <span>tasting / {beer.name.toLowerCase()}</span>
            </div>
            <h1 className="page-title">scorecard</h1>
            <p className="page-description" style={{ marginTop: "0.75rem" }}>
              objective evaluation across appearance, aroma, palate &amp;
              character. your contribution becomes part of the public profile.
            </p>
          </div>
        </header>

        <FeedbackForm beer={beer} />
      </div>
    </div>
  );
}

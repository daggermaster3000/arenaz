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

      if (!error && data) {
        setBeer(data);
      }
      setLoading(false);
    };
    fetchBeer();
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

  return (
    <div className="container feedback-page py-16">
      <div className="feedback-layout">
        <header className="page-header">
          <span className="style-tag">feedback / {beer.name}</span>
          <h1 className="page-title">tasting scorecard</h1>
          <p className="page-description">
            please provide your objective evaluation according to the following metrics.
          </p>
        </header>

        <FeedbackForm beer={beer} />
      </div>
    </div>
  );
}

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
    <div className="container py-16">
      <div className="feedback-layout">
        <header className="page-header">
          <span className="style-tag">feedback / {beer.name}</span>
          <h1 className="page-title">tasting scorecard</h1>
          <p className="page-description">
            please provide your objective evaluation according to the following scientific metrics.
          </p>
        </header>

        <FeedbackForm beer={beer} />
      </div>

      <style jsx>{`
        .py-16 { padding: var(--space-16) 0; }
        .feedback-layout {
          max-width: 600px;
          margin: 0 auto;
        }
        .page-header {
          margin-bottom: var(--space-12);
        }
        .style-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.5;
        }
        .page-title {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: var(--space-2) 0;
          text-transform: lowercase;
        }
        .page-description {
          font-size: 1rem;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

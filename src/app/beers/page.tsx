"use client";

import { useState, useEffect } from "react";
import BeerCard from "@/components/BeerCard";
import { createClient } from "@/utils/supabase/client";
import { Beer, Review } from "@/types";
import { Loader2 } from "lucide-react";

export default function BeersPage() {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [beersRes, reviewsRes] = await Promise.all([
          supabase.from("beers").select("*").order("name"),
          supabase.from("reviews").select("beer_id, rating")
        ]);

        if (beersRes.error) throw beersRes.error;
        if (reviewsRes.error) throw reviewsRes.error;

        setBeers(beersRes.data || []);
        setReviews(reviewsRes.data as any || []);
      } catch (err: any) {
        console.error("BeersPage fetch error:", err);
        setError(err.message);
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

  return (
    <div className="container py-16">
      <header className="page-header">
        <h1 className="page-title">our beers</h1>
        <p className="page-description">
          a collection of brewing experiments.
        </p>
      </header>

      <div className="beer-grid">
        {error && (
          <div className="error-message col-span-full">
            <p className="opacity-50">unable to load our beers.</p>
            <p className="text-sm opacity-30 mt-2">{error}</p>
          </div>
        )}
        {beers.map((beer) => {
          const beerReviews = reviews.filter(r => r.beer_id === beer.id);
          const avgRating = beerReviews.length > 0
            ? beerReviews.reduce((acc, r) => acc + r.rating, 0) / beerReviews.length
            : 0;

          return <BeerCard key={beer.id} beer={beer} averageRating={avgRating} />;
        })}
        {!error && beers.length === 0 && (
          <p className="empty-message col-span-full">no beers available in the database.</p>
        )}
      </div>

      <style jsx>{`
        .py-16 {
          padding-top: var(--space-16);
          padding-bottom: var(--space-16);
        }
        .page-header {
          margin-bottom: var(--space-12);
          max-width: 600px;
        }
        .page-title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: var(--space-2);
          text-transform: lowercase;
        }
        .page-description {
          font-size: 1.25rem;
          opacity: 0.6;
          line-height: 1.4;
        }
        
        .beer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        .error-message, .empty-message {
          padding: var(--space-8);
          border: 1px solid var(--border);
          background: var(--muted);
          text-align: center;
        }

        @media (min-width: 768px) {
          .beer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .beer-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-12);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import BeerCard from "@/components/BeerCard";
import { supabase } from "@/lib/supabase";
import { Beer } from "@/types";
import { Loader2 } from "lucide-react";

export default function BeersPage() {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeers = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("beers").select("*").order("name");
      if (error) {
        console.error("BeersPage fetch error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        setError(error.message);
      } else if (data) {
        setBeers(data);
      }
      setLoading(false);
    };
    fetchBeers();
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
          a collection of scientific brewing experiments and established classics.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {error && (
          <div className="col-span-full p-8 border border-border bg-muted text-center">
            <p className="opacity-50">unable to load our beers.</p>
            <p className="text-sm opacity-30 mt-2">{error}</p>
          </div>
        )}
        {beers.map((beer) => (
          <BeerCard key={beer.id} beer={beer} />
        ))}
        {!error && beers.length === 0 && (
          <p className="py-8 text-center opacity-30 col-span-full">no beers available in the database.</p>
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
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: var(--space-2);
          text-transform: lowercase;
        }
        .page-description {
          font-size: 1.125rem;
          opacity: 0.6;
        }
        @media (min-width: 1024px) {
          .lg:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}

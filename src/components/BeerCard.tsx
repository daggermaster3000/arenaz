"use client";

import Link from "next/link";
import { Beer } from "@/types";
import { Star } from "lucide-react";

interface BeerCardProps {
  beer: Beer;
  averageRating?: number;
}

export default function BeerCard({ beer, averageRating = 0 }: BeerCardProps) {
  return (
    <div className="beer-card">
      <div className="beer-image-container">
        {/* Placeholder for mockup, will use label if no mockup */}
        <img
          src={beer.mockup_url || beer.label_url}
          alt={beer.name}
          className="beer-image"
        />
      </div>
      <div className="beer-info">
        <div className="beer-header">
          <h3 className="beer-name">{beer.name}</h3>
          <div className="beer-rating">
            <Star size={14} fill="currentColor" />
            <span>{averageRating.toFixed(1)}</span>
          </div>
        </div>
        <p className="beer-style">{beer.style} • {beer.abv}% ABV</p>
        <div className="beer-actions">
          <Link href={`/beers/${beer.id}`} className="btn btn-secondary btn-sm">
            details
          </Link>
          <Link href={`/feedback/${beer.id}`} className="btn btn-primary btn-sm">
            rate
          </Link>
        </div>
      </div>

      <style jsx>{`
        .beer-card {
          border: 1px solid var(--border);
          padding: var(--space-4);
          background: var(--bg);
          transition: border-color 0.2s ease;
        }
        .beer-card:hover {
          border-color: var(--accent);
        }
        .beer-image-container {
          aspect-ratio: 1;
          background: var(--muted);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .beer-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .beer-card:hover .beer-image {
          transform: scale(1.05);
        }
        .beer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-1);
        }
        .beer-name {
          font-size: 1rem;
          font-weight: 700;
          text-transform: lowercase;
        }
        .beer-rating {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .beer-style {
          font-size: 0.75rem;
          opacity: 0.6;
          margin-bottom: var(--space-4);
          text-transform: lowercase;
        }
        .beer-actions {
          display: flex;
          gap: var(--space-2);
        }
        .btn-sm {
          padding: var(--space-2) var(--space-4);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}

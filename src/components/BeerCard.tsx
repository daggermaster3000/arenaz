"use client";

import Link from "next/link";
import Image from "next/image";
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
        <Image
          src={beer.mockup_url || beer.label_url}
          alt={beer.name}
          className="beer-image"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          unoptimized
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

    </div>
  );
}

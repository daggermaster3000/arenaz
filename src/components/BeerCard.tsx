"use client";

import Link from "next/link";
import Image from "next/image";
import { Beer } from "@/types";
import { Star } from "lucide-react";

interface BeerCardProps {
  beer: Beer;
  averageRating?: number;
  index?: number;
}

export default function BeerCard({ beer, averageRating = 0, index = 0 }: BeerCardProps) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link href={`/beers/${beer.id}`} className="beer-card" aria-label={`View ${beer.name}`}>
      <div className="beer-card-head">
        <span className="beer-card-num">N° {num}</span>
        <span className="beer-card-rating">
          <Star size={11} fill="currentColor" strokeWidth={0} />
          <span>{averageRating > 0 ? averageRating.toFixed(1) : "—"}</span>
        </span>
      </div>

      <div className="beer-image-container">
        <Image
          src={beer.mockup_url || beer.label_url}
          alt={beer.name}
          className="beer-image"
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          quality={80}
        />
      </div>

      <div className="beer-rule" aria-hidden />

      <div className="beer-card-info">
        <h3 className="beer-name">{beer.name}</h3>
        <p className="beer-style">{beer.style}</p>
      </div>

      <div className="beer-card-meta">
        <div className="beer-card-stat">
          <span className="beer-card-stat-value">{beer.abv}%</span>
          <span className="beer-card-meta-label">abv</span>
        </div>
        <div />
        <span className="beer-card-cta">
          view <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

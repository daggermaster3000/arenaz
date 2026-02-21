"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onRatingChange, size = 24 }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="star-button"
        >
          <Star
            size={size}
            fill={(hover || rating) >= star ? "var(--accent)" : "none"}
            stroke={(hover || rating) >= star ? "var(--accent)" : "var(--border)"}
            strokeWidth={2}
          />
        </button>
      ))}
      <style jsx>{`
        .star-rating {
          display: flex;
          gap: var(--space-2);
        }
        .star-button {
          transition: transform 0.1s ease;
        }
        .star-button:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

import BeerCard from "@/components/BeerCard";
import { createClient } from "@/utils/supabase/server";
import { Beer, Review } from "@/types";

export const revalidate = 30;

async function getData(): Promise<{
  beers: Beer[];
  ratings: Map<string, number>;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const [beersRes, reviewsRes] = await Promise.all([
      supabase.from("beers").select("*").order("name"),
      supabase.from("reviews").select("beer_id, rating"),
    ]);

    if (beersRes.error) throw beersRes.error;
    if (reviewsRes.error) throw reviewsRes.error;

    const beers = (beersRes.data ?? []) as Beer[];
    const reviews = (reviewsRes.data ?? []) as Pick<Review, "beer_id" | "rating">[];

    const ratings = new Map<string, number>();
    for (const beer of beers) {
      const beerReviews = reviews.filter((r) => r.beer_id === beer.id);
      if (beerReviews.length === 0) {
        ratings.set(beer.id, 0);
      } else {
        const sum = beerReviews.reduce((acc, r) => acc + r.rating, 0);
        ratings.set(beer.id, sum / beerReviews.length);
      }
    }

    return { beers, ratings, error: null };
  } catch (e: any) {
    return { beers: [], ratings: new Map(), error: e?.message ?? "Failed to load beers" };
  }
}

export default async function BeersPage() {
  const { beers, ratings, error } = await getData();
  const total = beers.length;

  return (
    <div className="container beers-page page-shell">
      <header className="page-head">
        <div>
          <div className="page-eyebrow">
            <span className="num">N° 02</span>
            <span className="rule" aria-hidden />
            <span>catalogue</span>
          </div>
          <h1 className="page-title">our beers</h1>
        </div>
        <p className="page-description">
          a working collection of brewing experiments — each entry available for
          inspection &amp; tasting feedback.
        </p>
      </header>

      <div className="beer-grid">
        {error && (
          <div className="error-message">
            <p>unable to load our beers.</p>
            <p className="text-xs opacity-50 mt-2">{error}</p>
          </div>
        )}

        {!error && total === 0 && (
          <p className="empty-message">no beers in the catalogue yet.</p>
        )}

        {beers.map((beer, i) => (
          <BeerCard
            key={beer.id}
            beer={beer}
            averageRating={ratings.get(beer.id) ?? 0}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

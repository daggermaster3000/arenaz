import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60;

async function getStats() {
  try {
    const supabase = await createClient();
    const [beersRes, reviewsRes] = await Promise.all([
      supabase.from("beers").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("rating"),
    ]);

    const beerCount = beersRes.count ?? 0;
    const reviews = reviewsRes.data ?? [];
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
        : null;

    return { beerCount, reviewCount, avgRating };
  } catch {
    return { beerCount: 0, reviewCount: 0, avgRating: null };
  }
}

export default async function Home() {
  const { beerCount, reviewCount, avgRating } = await getStats();
  const year = new Date().getFullYear();

  return (
    <>
      {/* ── HERO ───────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-text">
              <div className="hero-eyebrow">
                <span className="num">N° 01</span>
                <span className="rule" aria-hidden />
                <span>est. {year - 1} · valais, ch</span>
              </div>

              <h1 className="hero-title">
                brasserie<br />
                <span className="accent">arénaz</span>
              </h1>

              <div className="hero-meta">
                <p className="hero-tagline">
                  craft brewing, <em>scientifically</em> measured.<br />
                  small batches, precise data.
                </p>
                <div className="hero-actions">
                  <Link href="/beers" className="btn btn-primary btn-arrow">
                    explore beers
                  </Link>
                  <Link href="/beers" className="btn btn-secondary btn-arrow">
                    give feedback
                  </Link>
                </div>
              </div>
            </div>

            <div className="hero-image-frame">
              <span className="hero-image-tag mono">sample 001</span>
              <span className="hero-image-meta mono">{year}</span>
              <Image
                src="/hero.jpg"
                alt="brasserie arénaz bottle"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 40vw"
                quality={82}
              />
            </div>
          </div>
        </div>

        {/* data strip */}
        <div className="container">
          <div className="stat-strip">
            <div className="stat-cell">
              <span className="label">established</span>
              <span className="value">{year - 1}</span>
            </div>
            <div className="stat-cell">
              <span className="label">beers in production</span>
              <span className="value">{String(beerCount).padStart(2, "0")}</span>
            </div>
            <div className="stat-cell">
              <span className="label">evaluations</span>
              <span className="value">{String(reviewCount).padStart(3, "0")}</span>
            </div>
            <div className="stat-cell accent">
              <span className="label">avg. rating</span>
              <span className="value">{avgRating ? `${avgRating}/5` : "—"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ──────────────────────────────────── */}
      <section className="manifesto">
        <div className="container">
          <div className="manifesto-grid">
            <div className="manifesto-label">
              <span className="num">02 / philosophy</span>
              <span>method &amp; matter</span>
            </div>
            <p className="manifesto-body">
              every batch is a controlled experiment — measured for clarity,
              recorded for history, refined for the next pour. <em>science</em>{" "}
              is the recipe, taste is the verdict.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

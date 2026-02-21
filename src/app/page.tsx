import Link from "next/link";

export default function Home() {
  return (
    <div className="hero">
      <div className="container hero-content">
        <h1 className="hero-title">brasserie arénaz</h1>
        <p className="hero-subtitle">
          craft brewing experiments
        </p>
        <div className="hero-actions">
          <Link href="/beers" className="btn btn-primary">
            explore our beers
          </Link>
          <Link href="/beers" className="btn btn-secondary">
            give feedback
          </Link>
        </div>
      </div>
    </div>
  );
}

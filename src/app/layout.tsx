import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "brasserie arénaz",
  description: "polished, scientific brewing from arénaz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container nav-content">
            <Link href="/" className="logo">
              brasserie arénaz
            </Link>
            <div className="nav-links">
              <Link href="/beers">beers</Link>
              <Link href="/admin">admin</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} brasserie arénaz</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

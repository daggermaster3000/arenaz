import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

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
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <nav className="navbar">
          <div className="container nav-content">
            <Link href="/" className="logo">
              <span className="logo-mark">A/Z</span>
              <span className="logo-name">brasserie arénaz</span>
            </Link>
            <div className="nav-links">
              <Link href="/beers">
                <span className="nav-num">01</span>
                <span>beers</span>
              </Link>
              <Link href="/admin">
                <span className="nav-num">02</span>
                <span>admin</span>
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="container footer-grid">
            <div className="footer-col">
              <span className="footer-label">brasserie</span>
              <span className="footer-value">arénaz</span>
            </div>
            <div className="footer-col">
              <span className="footer-label">edition</span>
              <span className="footer-value mono">{new Date().getFullYear()}</span>
            </div>
            <div className="footer-col">
              <span className="footer-label">location</span>
              <span className="footer-value">CH / VS</span>
            </div>
            <div className="footer-col footer-meta">
              <span className="footer-label">©</span>
              <span className="footer-value">all rights reserved</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

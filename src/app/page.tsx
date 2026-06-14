import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Personal Carbon Intelligence Platform",
  description:
    "Discover your carbon footprint, get personalized reduction actions, simulate impact, and track your progress. Built for weekly use.",
};

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing__nav" aria-label="Marketing navigation">
        <div className="landing__nav-brand">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="24" cy="24" r="24" fill="var(--verdure-500)" />
            <path d="M24 12C18 18 14 24 14 30C14 35.5228 18.4772 40 24 40C29.5228 40 34 35.5228 34 30C34 24 30 18 24 12Z" fill="white" fillOpacity="0.9" />
          </svg>
          <span className="landing__nav-title">Verdure</span>
        </div>
        <div className="landing__nav-actions">
          <Link href="/login" className="btn btn--ghost">Sign In</Link>
          <Link href="/signup" className="btn btn--primary">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="landing__hero">
        <div className="landing__hero-badge">🌍 Free forever · No credit card required</div>
        <h1 className="landing__hero-title">
          Understand your <span className="landing__hero-gradient">carbon footprint</span>
        </h1>
        <p className="landing__hero-subtitle">
          Verdure is your personal carbon intelligence platform. Discover emission sources,
          get prioritized reduction actions, simulate impact, and track progress — all backed
          by published DEFRA &amp; IPCC emission factors.
        </p>
        <div className="landing__hero-actions">
          <Link href="/signup" className="btn btn--primary btn--lg">
            Calculate Your Footprint →
          </Link>
          <Link href="/login" className="btn btn--secondary btn--lg">
            Sign In
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="landing__features" aria-label="Features">
        <h2 className="landing__section-title">Everything you need to go green</h2>
        <div className="landing__features-grid">
          {[
            { icon: "📊", title: "Carbon Score", description: "Get a 0-100 score based on your real data, benchmarked against global and Indian averages." },
            { icon: "🔬", title: "What-If Simulator", description: "Drag sliders to see how lifestyle changes affect your footprint in real-time. No API calls — instant results." },
            { icon: "🎯", title: "Smart Actions", description: "Personalized recommendations sorted by impact. Each action shows exact CO₂e savings." },
            { icon: "🤖", title: "AI Carbon Coach", description: "Chat with an AI advisor that knows your data. Get specific, actionable sustainability tips." },
            { icon: "📈", title: "Progress Tracking", description: "Weekly recalculations show your score improving over time as you take action." },
            { icon: "🏆", title: "Challenges", description: "Join community challenges to build green habits and track your collective impact." },
          ].map((feature) => (
            <div key={feature.title} className="landing__feature-card">
              <span className="landing__feature-icon" aria-hidden="true">{feature.icon}</span>
              <h3 className="landing__feature-title">{feature.title}</h3>
              <p className="landing__feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="landing__methodology" aria-label="Methodology">
        <h2 className="landing__section-title">Backed by science, not guesswork</h2>
        <p className="landing__methodology-text">
          Our emission factors are sourced from published, peer-reviewed datasets:
        </p>
        <div className="landing__sources">
          {[
            { name: "DEFRA 2024", desc: "UK Government Greenhouse Gas Conversion Factors" },
            { name: "IPCC AR6", desc: "Intergovernmental Panel on Climate Change" },
            { name: "CEA India", desc: "Central Electricity Authority grid emission data" },
            { name: "Poore & Nemecek", desc: "Science (2018) — Food system emissions" },
          ].map((source) => (
            <div key={source.name} className="landing__source">
              <strong>{source.name}</strong>
              <span>{source.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta" aria-label="Call to action">
        <h2 className="landing__cta-title">
          Ready to reduce your footprint?
        </h2>
        <p className="landing__cta-subtitle">
          Takes 2 minutes. Free forever. No credit card.
        </p>
        <Link href="/signup" className="btn btn--primary btn--lg">
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <p>© 2025 Verdure. Built for a greener tomorrow.</p>
      </footer>
    </div>
  );
}

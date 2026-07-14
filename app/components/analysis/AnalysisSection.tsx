import { BarChart3, FileSearch, Target, Trophy, Zap } from "lucide-react";

export function AnalysisSection() {
  const cards = [
    { title: "Rating analytics", text: "Trend lines, volatility, and rating delta breakdowns.", icon: BarChart3, tone: "accent" },
    { title: "Weak topic detection", text: "Topic clusters based on failed and slow solves.", icon: Target, tone: "red" },
    { title: "Contest insights", text: "Rank movement, solved count, and speed analysis.", icon: Trophy, tone: "accent" },
    { title: "Consistency tracking", text: "Weekly practice rhythm and streak quality.", icon: Zap, tone: "green" },
    { title: "Codeforces parser", text: "Auto-import problem statements, constraints, and samples straight from a contest URL.", icon: FileSearch, tone: "cf" },
  ] as const;

  return (
    <div className="section-stack">
      <section className="soon-hero" data-reveal>
        <div className="soon-icon"><BarChart3 size={28} /></div>
        <p className="eyebrow" style={{ color: "var(--accent-ink)", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 11 }}>Analysis</p>
        <h1>Insights, coming soon</h1>
        <p>Focused analytics are being shaped into compact, readable cards for daily review.</p>
      </section>
      <div className="analysis-cards">
        {cards.map(({ title, text, icon: Icon, tone }, i) => (
          <article key={title} className={`analysis-card tone-${tone}`} data-reveal style={{ ["--i" as string]: i } as React.CSSProperties}>
            <span className="stat-ic"><Icon size={18} /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

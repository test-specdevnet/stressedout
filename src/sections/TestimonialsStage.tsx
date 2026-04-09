const testimonials = [
  {
    quote: "Placeholder proof block for future client feedback and performance-led praise.",
    author: "Founder / DTC Brand",
  },
  {
    quote: "Structured to support short testimonials without breaking the cinematic pacing of the wheel.",
    author: "Creative Lead / Startup Team",
  },
  {
    quote: "A composed testimonial stage gives the storyscroll one calmer beat before pricing.",
    author: "Growth Operator / Ecommerce",
  },
];

export function TestimonialsStage() {
  return (
    <div className="stage-layout stage-layout--testimonials">
      <div className="stage-copy">
        <p className="stage-kicker">Testimonials / social proof stage</p>
        <h2 className="stage-title">A dedicated proof block that bridges the gallery and pricing.</h2>
        <p className="stage-description">
          This stage stays intentionally lightweight for now, but it gives the storyscroll a real
          placeholder surface for praise, outcomes, and trust signals before the offer panel.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((item) => (
          <article key={item.author} className="glass-panel testimonial-card">
            <p className="testimonial-card__quote">"{item.quote}"</p>
            <span className="testimonial-card__author">{item.author}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

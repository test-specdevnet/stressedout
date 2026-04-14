const testimonials = [
  {
    quote: "Stress-tested concepts helped us see what to change before scaling spend.",
    author: "Founder / DTC Brand",
  },
  {
    quote: "The feedback was sharp, practical, and immediately useful for the next round of creative.",
    author: "Creative Lead / Startup Team",
  },
  {
    quote: "A much faster path than trying to brief, design, and test everything internally.",
    author: "Growth Operator / Ecommerce",
  },
];

export function TestimonialsStage() {
  return (
    <div className="stage-layout stage-layout--testimonials">
      <div className="testimonials-grid testimonials-grid--compact">
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

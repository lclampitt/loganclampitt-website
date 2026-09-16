export default function HeroPortrait() {
  return (
    <div className="hero-portrait absolute top-0 right-0 w-[230px] md:w-[260px] pointer-events-none">
      <figure className="project-card hero-portrait-frame">
        <div className="hero-portrait-media">
          <img
            src="/images/portrait.jpg"
            alt="Logan Clampitt"
            decoding="async"
            className="hero-portrait-img"
          />
          <span className="hero-portrait-corner hero-portrait-corner--tl" aria-hidden="true" />
          <span className="hero-portrait-corner hero-portrait-corner--br" aria-hidden="true" />
        </div>
        <figcaption className="hero-portrait-caption" aria-hidden="true">
          <span>LC_2026.JPG</span>
          <span>CSUF</span>
        </figcaption>
      </figure>
    </div>
  )
}

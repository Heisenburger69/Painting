import Link from 'next/link';
import { getAll, getFeatured } from '@/lib/paintings';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [paintings, featuredPaintings] = await Promise.all([getAll(), getFeatured()]);
  const featured = featuredPaintings.length > 0 ? featuredPaintings[0] : paintings[0];

  return (
    <>
      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Atelier</h1>
          <p>Original paintings — where light meets pigment, and every canvas tells a story</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <a href="#gallery" className="btn btn-primary">Browse Gallery</a>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Available Works</h2>
          </div>
          <div className="paintings-grid">
            {paintings.map((painting) => (
              <Link
                key={painting.id}
                href={`/painting/${painting.id}`}
                className={`painting-card${painting.featured ? ' featured' : ''}`}
              >
                <div className="card-image">
                  <img src={painting.image} alt={painting.title} />
                </div>
                <div className="card-title">{painting.title}</div>
                <div className="card-medium">{painting.medium} — {painting.year}</div>
                <p className="card-excerpt">
                  {painting.description.slice(0, 120)}{painting.description.length > 120 ? '...' : ''}
                </p>
                <div className={`card-price${painting.sold ? ' sold' : ''}`}>
                  {painting.sold ? 'SOLD' : `${painting.currency} ${painting.price.toLocaleString()}`}
                  {painting.sold && <span className="sold-badge">Sold</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ARTIST STATEMENT */}
      <section id="statement" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>Artist Statement</h2></div>
          <div className="info-card-dark" style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
              I paint because I must. Each brushstroke is an attempt to capture what words cannot hold — the slant of light across a forgotten courtyard, the weight of silence between two people, the texture of memory as it fades and reforms.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
              My work sits at the intersection of observation and emotion. The landscapes are not places I have seen so much as places I have felt. The portraits are not people I know, but people I have been. I am drawn to the in-between moments — dusk, departure, the pause before a word is spoken.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.9 }}>
              Colour is my primary language. I build layers of pigment, scraping back and adding again, until the surface carries the history of its own making. Every mark, every accident, every deliberate stroke remains visible — a diary of decisions.
            </p>
            <div style={{ textAlign: 'right', marginTop: 30, fontStyle: 'italic', color: 'var(--tan)' }}>— The Artist</div>
          </div>
        </div>
      </section>

      {/* BIOGRAPHY */}
      <section id="biography" className="section">
        <div className="container">
          <div className="section-header"><h2>Biography</h2></div>
          <div className="grid grid-2" style={{ gap: 40, alignItems: 'start' }}>
            <div className="info-card">
              <h3 style={{ marginBottom: 16, fontSize: 14, color: 'var(--slate-gray)' }}>Education & Training</h3>
              <ul className="info-list">
                <li><strong>MFA in Fine Arts</strong> — Royal Academy of Arts, London (2018–2020)</li>
                <li><strong>BFA in Painting</strong> — Faculty of Fine Arts, Cairo University (2014–2018)</li>
                <li><strong>Atelier Grégoire</strong> — Classical painting techniques, Paris (2017)</li>
                <li><strong>Certificate in Art Theory</strong> — The Courtauld Institute of Art (2019)</li>
              </ul>
            </div>
            <div className="info-card">
              <h3 style={{ marginBottom: 16, fontSize: 14, color: 'var(--slate-gray)' }}>Professional Experience</h3>
              <ul className="info-list">
                <li><strong>Independent Artist</strong> — Full-time studio practice, Cairo (2021–Present)</li>
                <li><strong>Visiting Lecturer</strong> — Faculty of Fine Arts, Cairo University (2022–2024)</li>
                <li><strong>Resident Artist</strong> — Zamalek Art Residency, Cairo (2021)</li>
                <li><strong>Studio Assistant</strong> — Atelier Khairy, Alexandria (2018–2019)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* EXHIBITIONS */}
      <section id="exhibitions" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>Exhibitions</h2></div>
          <div className="grid grid-2" style={{ gap: 30, maxWidth: 1000, margin: '0 auto' }}>
            {[
              { title: '"Between Light & Shadow"', year: '2025', venue: 'Solo Exhibition — Cairo Opera House, Egypt', desc: 'A collection of 24 works exploring the interplay of natural light and human emotion across urban and rural landscapes.' },
              { title: 'Contemporary Visions', year: '2024', venue: 'Group Exhibition — Sharjah Art Foundation, UAE', desc: 'Featured 3 large-scale abstract works alongside 15 international contemporary artists.' },
              { title: 'Roots & Horizons', year: '2023', venue: 'Solo Exhibition — Darb 1718, Cairo, Egypt', desc: 'A deeply personal exhibition reflecting on heritage, displacement, and belonging through mixed-media works on canvas and paper.' },
              { title: 'Young Collectors\' Fair', year: '2022', venue: 'Art Fair — The Nile Ritz-Carlton, Cairo', desc: 'Selected as one of 12 emerging artists to showcase work to collectors and gallery owners.' },
            ].map((ex) => (
              <div className="info-card-dark" key={ex.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{ex.title}</h3>
                  <span style={{ color: 'var(--tan)', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{ex.year}</span>
                </div>
                <p style={{ fontSize: 13, marginBottom: 8 }}>{ex.venue}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH & ACADEMIC */}
      <section id="research" className="section">
        <div className="container">
          <div className="section-header"><h2>Research & Academic Work</h2></div>
          <div className="info-card" style={{ maxWidth: 900, margin: '0 auto' }}>
            <h3 style={{ fontSize: 15, color: 'var(--coffee)', marginBottom: 12 }}>Master's Thesis</h3>
            <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
              <strong>&ldquo;The Luminous in the Everyday: Translating Transient Light into Permanent Pigment&rdquo;</strong>
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              A practice-led research project examining how contemporary painters can capture the fleeting quality of natural light through layering techniques borrowed from the Old Masters and reinterpreted through a modern lens.
            </p>
            <p style={{ fontSize: 13, color: 'var(--slate-gray)' }}>
              Royal Academy of Arts, London — 2020 | Supervisor: Prof. Helena Marchetti
            </p>
          </div>
          <div className="grid grid-2" style={{ gap: 24, marginTop: 30, maxWidth: 900, marginInline: 'auto' }}>
            <div className="info-card">
              <h3 style={{ fontSize: 13, color: 'var(--coffee)', marginBottom: 8 }}>Published Articles</h3>
              <ul className="info-list" style={{ fontSize: 13 }}>
                <li>&ldquo;Painting as Meditation&rdquo; — Art Monthly, Issue 482 (2023)</li>
                <li>&ldquo;The Return of Figuration&rdquo; — Cairo Art Review, Vol. 4 (2022)</li>
                <li>&ldquo;Materiality in Contemporary Egyptian Art&rdquo; — Nafas Magazine (2021)</li>
              </ul>
            </div>
            <div className="info-card">
              <h3 style={{ fontSize: 13, color: 'var(--coffee)', marginBottom: 8 }}>Lectures & Workshops</h3>
              <ul className="info-list" style={{ fontSize: 13 }}>
                <li>&ldquo;Colour Theory for Painters&rdquo; — Cairo University (2024)</li>
                <li>&ldquo;Building a Studio Practice&rdquo; — Alexandria Atelier (2023)</li>
                <li>&ldquo;Layering Techniques in Oil Painting&rdquo; — Zamalek Art Residency (2022)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS & EVENTS */}
      <section id="news" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>News & Events</h2></div>
          <div className="grid grid-2" style={{ gap: 30, maxWidth: 1000, margin: '0 auto' }}>
            <div className="info-card-dark">
              <span style={{ display: 'inline-block', background: 'var(--tan)', color: 'var(--space-cadet)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 12 }}>Upcoming</span>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>&ldquo;New Works&rdquo; — Summer Exhibition</h3>
              <p style={{ fontSize: 13, marginBottom: 8 }}>Solo exhibition opening August 2026 at Zamalek Art Gallery, Cairo</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>A new body of work exploring the coastline of the Mediterranean — from Alexandria to Marsa Matruh. 18 new paintings, all available for preview.</p>
            </div>
            <div className="info-card-dark">
              <span style={{ display: 'inline-block', background: 'var(--coffee)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 12 }}>Open Studio</span>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Open Studio Weekend</h3>
              <p style={{ fontSize: 13, marginBottom: 8 }}>September 12–13, 2026 — Studio 4, Downtown Cairo</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Visit the studio, see works in progress, and discuss commissions directly. Coffee and conversation included.</p>
            </div>
            <div className="info-card-dark">
              <span style={{ display: 'inline-block', background: 'var(--space-cadet)', color: 'var(--tan)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 12 }}>Past</span>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Art Cairo 2026</h3>
              <p style={{ fontSize: 13, marginBottom: 8 }}>March 2026 — Grand Egyptian Museum</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Participated in the inaugural Art Cairo fair. &ldquo;Urban Solitude&rdquo; and &ldquo;Whispers of Autumn&rdquo; were acquired by private collectors.</p>
            </div>
            <div className="info-card-dark">
              <span style={{ display: 'inline-block', background: 'var(--space-cadet)', color: 'var(--tan)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 12 }}>Past</span>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Commission Project: Nabil Foundation</h3>
              <p style={{ fontSize: 13, marginBottom: 8 }}>Completed January 2026</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>A series of 5 large-scale paintings commissioned for the lobby of the Nabil Foundation headquarters in New Cairo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARTWORK */}
      <section id="featured" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Artwork</h2>
            <p style={{ fontSize: 14, color: 'var(--slate-gray)' }}>A changing selection — the current highlight of the collection</p>
          </div>
          {featured && (
            <div className="grid grid-2" style={{ gap: 40, alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <img src={featured.image} alt={featured.title} style={{ width: '100%', display: 'block' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, color: 'var(--slate-gray)', letterSpacing: 2, marginBottom: 8 }}>Featured Work</h3>
                <h2 style={{ fontSize: 28, marginBottom: 8 }}>{featured.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--coffee)', fontStyle: 'italic', marginBottom: 16 }}>{featured.medium} — {featured.size} — {featured.year}</p>
                <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>{featured.description}</p>
                <div style={{ fontSize: 24, fontWeight: 900, color: featured.sold ? 'var(--caput-mortuum)' : 'var(--coffee)', marginBottom: 16 }}>
                  {featured.sold ? 'SOLD' : `${featured.currency} ${featured.price.toLocaleString()}`}
                </div>
                {!featured.sold && <a href="#gallery" className="btn btn-primary" style={{ pointerEvents: 'auto' }}>View Gallery</a>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>Contacts</h2></div>
          <div className="contact-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="contact-item">
              <span className="contact-icon">&#9993;</span>
              <div className="contact-label">Email</div>
              <div className="contact-value">hello@atelier.art</div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">&#9743;</span>
              <div className="contact-label">Phone</div>
              <div className="contact-value">+20 100 123 4567</div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">&#9670;</span>
              <div className="contact-label">Instagram</div>
              <div className="contact-value">@atelier.art</div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">&#9835;</span>
              <div className="contact-label">TikTok</div>
              <div className="contact-value">@atelier.art</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

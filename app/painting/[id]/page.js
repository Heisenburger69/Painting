import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getById } from '@/lib/paintings';

export const dynamic = 'force-dynamic';

export default async function PaintingDetailPage({ params }) {
  const { id } = await params;
  const painting = await getById(id);

  if (!painting) notFound();

  const allImages = painting.images && painting.images.length > 0 ? painting.images : [painting.image];
  const extraImages = allImages.filter((img) => img !== painting.image);

  return (
    <article>
      <div className="painting-header">
        <h1>{painting.title}</h1>
        <p className="painting-meta">{painting.medium} | {painting.size} | {painting.year} | {painting.category}</p>
      </div>

      <div className="painting-content">
        <div className="painting-detail-grid">
          <div>
            <div className="painting-main-image">
              <img src={painting.image} alt={painting.title} style={{ width: '100%', display: 'block' }} />
            </div>
            {extraImages.length > 0 && (
              <div className="painting-images-grid">
                {extraImages.map((img, i) => (
                  <img key={i} src={img} alt={`${painting.title} view ${i + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="painting-info">
            <h2>{painting.title}</h2>
            <p className="painting-medium">{painting.medium}</p>
            <p className="painting-specs">{painting.size} — {painting.year} — {painting.category}</p>
            <p className="painting-description">{painting.description}</p>

            <div className="painting-price-box">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--slate-gray)', marginBottom: 4 }}>
                {painting.sold ? 'Status: Sold' : 'Price'}
              </div>
              <div className={`painting-price${painting.sold ? ' sold' : ''}`}>
                {painting.sold ? 'SOLD' : `${painting.currency} ${painting.price.toLocaleString()}`}
              </div>
              {painting.sold
                ? <p style={{ fontSize: 13, color: 'var(--caput-mortuum)', marginTop: 8 }}>This piece has been acquired.</p>
                : <p style={{ fontSize: 13, color: 'var(--slate-gray)', marginTop: 8 }}>Contact for inquiries and acquisition</p>
              }
            </div>

            <Link href="/#gallery" className="btn btn-primary">Back to Gallery</Link>
            <Link href="/#contacts" className="btn btn-secondary" style={{ marginLeft: 8 }}>Inquire</Link>
          </div>
        </div>
      </div>

      <style>{`
        .painting-header { text-align: center; padding: 70px 20px; background: linear-gradient(135deg, var(--space-cadet) 0%, #1a1c2e 100%); }
        .painting-header h1 { color: var(--coffee); }
        .painting-meta { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 16px; }
        .painting-content { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
        .painting-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; }
        .painting-main-image { width: 100%; border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-lg); }
        .painting-main-image img { width: 100%; display: block; }
        .painting-info h2 { font-size: 32px; margin-bottom: 12px; }
        .painting-info .painting-medium { font-size: 16px; color: var(--tan); font-style: italic; margin-bottom: 8px; }
        .painting-info .painting-specs { font-size: 14px; color: var(--slate-gray); margin-bottom: 20px; }
        .painting-info .painting-description { font-size: 16px; line-height: 1.9; margin-bottom: 24px; color: var(--space-cadet); }
        .painting-info .painting-price-box { background: linear-gradient(135deg, rgba(212,167,106,0.15) 0%, rgba(212,167,106,0.05) 100%); border: 1px solid rgba(212,167,106,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .painting-info .painting-price { font-size: 32px; font-weight: 900; color: var(--caput-mortuum); }
        .painting-info .painting-price.sold { color: var(--slate-gray); text-decoration: line-through; }
        .painting-images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 30px; }
        .painting-images-grid img { width: 100%; border-radius: 8px; cursor: pointer; transition: var(--transition); aspect-ratio: 1; object-fit: cover; }
        .painting-images-grid img:hover { transform: scale(1.03); box-shadow: var(--shadow-md); }
        @media (max-width: 768px) {
          .painting-detail-grid { grid-template-columns: 1fr; gap: 30px; }
          .painting-info h2 { font-size: 24px; }
          .painting-info .painting-price { font-size: 24px; }
          .painting-images-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </article>
  );
}

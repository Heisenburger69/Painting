'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function CollectionShowcase({ collections }) {
  const [expanded, setExpanded] = useState(null)

  if (!collections || collections.length === 0) return null

  const toggle = (id) => setExpanded(expanded === id ? null : id)

  return (
    <div className="coll-flex">
      {collections.map((coll) => (
        <CollectionCard
          key={coll.id}
          collection={coll}
          isOpen={expanded === coll.id}
          onToggle={() => toggle(coll.id)}
        />
      ))}
    </div>
  )
}

function CollectionCard({ collection, isOpen, onToggle }) {
  const panelRef = useRef(null)
  const [pw, setPw] = useState(0)

  useEffect(() => {
    if (panelRef.current) {
      setPw(isOpen ? panelRef.current.scrollWidth : 0)
    }
  }, [isOpen, collection.artworks])

  const coll = collection
  const coverImg = coll.cover_image || (coll.artworks[0]?.image)

  return (
    <div className={`coll-fit${isOpen ? ' is-open' : ''}`}>
      <div className="coll-fit-inner">
        <div className="coll-fit-side" onClick={onToggle}>
          <div className="coll-fit-cover">
            {coverImg ? <img src={coverImg} alt={coll.title} /> : <div className="coll-fit-nocover">No Cover</div>}
          </div>
          <div className="coll-fit-title">{coll.title}</div>
          {coll.description && <div className="coll-fit-desc">{coll.description}</div>}
          <span className="coll-fit-count">{coll.artworks.length}</span>
          <span className={`coll-fit-arrow${isOpen ? ' open' : ''}`}>&#9654;</span>
        </div>

        <div style={{ maxWidth: pw, overflow: 'hidden', transition: 'max-width 0.45s ease', display: 'flex', alignItems: 'stretch' }}>
          <div ref={panelRef} className="coll-fit-panel">
            {coll.artworks.map((a) => (
              <Link key={a.id} href={`/painting/${a.id}`} className="painting-card" onClick={(e) => e.stopPropagation()}>
                <div className="card-frame">
                  <div className="card-frame-inner">
                    <div className="card-image">
                      {a.image ? <img src={a.image} alt={a.title} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 11 }}>No Image</div>}
                    </div>
                    <div className={`card-price-tag${a.sold ? ' sold' : ''}`}>
                      {a.sold ? 'SOLD' : a.stock === 0 ? 'OUT' : a.stock ? `${a.stock}` : `${a.currency} ${(a.price || 0).toLocaleString()}`}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className={`card-title${a.sold ? ' sold' : ''}`}>{a.title}</div>
                  <div className="card-medium">{a.medium}</div>
                  <div className="card-details">
                    {a.year && <span className="card-detail">{a.year}</span>}
                    {a.size && <span className="card-detail">{a.size}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

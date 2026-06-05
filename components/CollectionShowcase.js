'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function CollectionShowcase({ collections }) {
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [leavingIds, setLeavingIds] = useState(new Set())
  const leaveTimers = useRef({})

  if (!collections || collections.length === 0) return null

  const toggle = (id) => {
    if (leavingIds.has(id)) {
      clearTimeout(leaveTimers.current[id])
      delete leaveTimers.current[id]
      setLeavingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } else if (expandedIds.has(id)) {
      setLeavingIds(prev => new Set([...prev, id]))
      leaveTimers.current[id] = setTimeout(() => {
        setExpandedIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setLeavingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        delete leaveTimers.current[id]
      }, 350)
    } else {
      setExpandedIds(prev => new Set([...prev, id]))
    }
  }

  const gridItems = []
  collections.forEach((coll) => {
    gridItems.push({ type: 'collection', data: coll, groupId: coll.id })
    if ((expandedIds.has(coll.id) || leavingIds.has(coll.id)) && coll.artworks) {
      coll.artworks.forEach((a) => {
        gridItems.push({ type: 'artwork', data: a, groupId: coll.id })
      })
    }
  })

  return (
    <div className="coll-grid-slot">
      {gridItems.map((item) => {
        const isExpandedGroup = expandedIds.has(item.groupId)
        const isLeaving = leavingIds.has(item.groupId)

        if (item.type === 'collection') {
          return (
            <CollectionSlot
              key={`col-${item.data.id}`}
              collection={item.data}
              isExpanded={isExpandedGroup}
              onToggle={() => toggle(item.data.id)}
            />
          )
        }

        return (
          <ArtworkSlot
            key={`art-${item.data.id}`}
            artwork={item.data}
            isExpandedGroup={isExpandedGroup}
            isLeaving={isLeaving}
            accentColor={collections.find((c) => c.id === item.groupId)?.accent_color || '#3B82F6'}
          />
        )
      })}
    </div>
  )
}

function CollectionSlot({ collection, isExpanded, onToggle }) {
  const coverImg = collection.cover_image || (collection.artworks[0]?.image)
  const accent = collection.accent_color || '#3B82F6'

  return (
    <div
      className={`coll-grid-item coll-collection-slot${isExpanded ? ' is-active' : ''}`}
      onClick={onToggle}
      style={{ '--accent-color': accent }}
    >
      <div className="coll-grid-item-inner">
        <div className="coll-gi-cover">
          {coverImg ? (
            <img src={coverImg} alt={collection.title} />
          ) : (
            <div className="coll-gi-nocover">No Cover</div>
          )}
        </div>
        <div className="coll-gi-info">
          <div className="coll-gi-title">{collection.title}</div>
          {collection.description && (
            <div className="coll-gi-desc">{collection.description}</div>
          )}
          <span className="coll-gi-count">
            {collection.artworks.length}{' '}
            {collection.artworks.length === 1 ? 'work' : 'works'}
          </span>
        </div>
        <span className={`coll-gi-arrow-indicator${isExpanded ? ' open' : ''}`}>
          &#9654;
        </span>
      </div>
    </div>
  )
}

function ArtworkSlot({ artwork, isExpandedGroup, isLeaving, accentColor }) {
  const priceLabel = artwork.sold
    ? 'SOLD'
    : artwork.stock === 0
      ? 'OUT'
      : artwork.stock
        ? `${artwork.stock}`
        : `EGP ${(artwork.price || 0).toLocaleString()}`

  return (
    <Link
      href={`/painting/${artwork.id}`}
      className={`coll-grid-item coll-art-grid-item${isExpandedGroup ? ' is-active' : ''}${isLeaving ? ' leaving' : ''}`}
      style={{ '--accent-color': accentColor }}
    >
      <div className="coll-grid-item-inner coll-art-inner">
        <div className="coll-agi-frame">
          <div className="coll-agi-frame-inner">
            <div className="coll-agi-image">
              {artwork.image ? (
                <img src={artwork.image} alt={artwork.title} />
              ) : (
                <div className="coll-agi-noimg">No Image</div>
              )}
            </div>
          </div>
        </div>
        <div className="coll-agi-body">
          <div className={`coll-agi-title${artwork.sold ? ' sold' : ''}`}>
            {artwork.title}
          </div>
          <div className="coll-agi-medium">{artwork.medium}</div>
          <div className="coll-agi-meta">
            {artwork.year && <span>{artwork.year}</span>}
            {artwork.size && <span>{artwork.size}</span>}
          </div>
          <div className={`coll-agi-price${artwork.sold ? ' sold' : ''}`}>
            {priceLabel}
          </div>
        </div>
      </div>
    </Link>
  )
}

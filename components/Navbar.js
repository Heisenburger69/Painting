'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Statement', href: '/#statement' },
  { label: 'Biography', href: '/#biography' },
  { label: 'Exhibitions', href: '/#exhibitions' },
  { label: 'Research', href: '/#research' },
  { label: 'News', href: '/#news' },
  { label: 'Featured', href: '/#featured' },
  { label: 'Contacts', href: '/#contacts' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('gallery');
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveSection(hash);
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
      }
    }
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo">
          Atelier
        </Link>

        <ul className={`nav-links${menuOpen ? ' active' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={activeSection === item.href.slice(2) ? 'active' : ''}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/admin" className="admin-link">Admin</Link>
          </li>
        </ul>

        <button
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

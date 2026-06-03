# Atelier — Artist Portfolio & Painting Sales Site

A static artist portfolio website where an admin can manage paintings (add, edit, reorder, mark as sold), and visitors can browse, view details, and inquire about purchases.

## Structure

```
├── index.html          — Main gallery + 7 info sections
├── painting.html       — Individual painting detail page (?id=)
├── admin.html          — Admin panel for managing paintings
├── css/style.css       — All styles (Inter font, CSS variables)
├── js/data.js          — DataStore: loads/manages paintings
├── data/paintings.json — Painting data file
├── assets/images/      — Image assets
└── package.json        — Project metadata
```

## Data Flow

1. `index.html` calls `DataStore.load()` which fetches `data/paintings.json`
2. `DataStore.getPaintings()` returns the array → rendered into `.paintings-grid`
3. Clicking a painting → `painting.html?id=xxx` → `DataStore.getPainting(id)` → renders detail
4. Admin logs in → edits/adds paintings → copies JSON → pastes into `data/paintings.json`

## Color Palette

| Name            | Hex       | Usage                               |
|-----------------|-----------|-------------------------------------|
| Caput Mortuum   | `#592720` | Navbar, footer, admin header, prices|
| Space Cadet     | `#2D3142` | Dark section backgrounds, hero      |
| Slate Gray      | `#6C7A89` | Muted text, sold status, secondary  |
| Tan             | `#D4A76A` | Accent, highlights, button text     |
| Coffee          | `#6F4E37` | Primary accent, buttons, headings   |

## 7 Sections (below gallery)

1. **Artist Statement** — Philosophy and intent behind the work
2. **Biography** — Education, work experience, certificates
3. **Exhibitions** — Past exhibitions participated in
4. **Research & Academic Work** — Master's thesis, publications
5. **News & Events** — Upcoming exhibitions, open studios
6. **Contacts** — Email, phone, Instagram, TikTok
7. **Featured Artwork** — Frequently changeable hero piece

## Usage

1. Replace placeholder images in `assets/images/` with actual painting photos
2. Edit `data/paintings.json` or use `admin.html` (password: `admin123`) to manage paintings
3. Copy the JSON from Admin → JSON tab → paste into `data/paintings.json` to persist
4. Deploy the entire folder to any static host (GitHub Pages, Netlify, Vercel)

## Notes

- Pure vanilla HTML/CSS/JS — no dependencies, no build step
- Admin password is `admin123` — change in `admin.html` before deployment
- All painting data is loaded from `data/paintings.json` at runtime

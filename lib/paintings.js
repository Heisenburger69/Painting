// ================================================================
// Paintings Data Access Layer
// Swap the store implementation to add a real database.
// ================================================================

const paintings = new Map();

// --- SEED DATA ---
function seed() {
  const data = [
    {
      id: "whispers-of-autumn", title: "Whispers of Autumn",
      medium: "Oil on Canvas", size: "80 × 100 cm", year: 2025,
      price: 2400, currency: "USD", sold: false, featured: true,
      image: "/assets/images/painting-1.jpg",
      images: ["/assets/images/painting-1.jpg", "/assets/images/painting-1a.jpg", "/assets/images/painting-1b.jpg"],
      description: "A meditative walk through golden-brown foliage at dusk. The interplay of warm ochres and cool shadows captures the bittersweet beauty of transition — the moment summer breathes its last and autumn takes hold.",
      category: "Landscape", inStock: true
    },
    {
      id: "silent-tides", title: "Silent Tides",
      medium: "Acrylic on Canvas", size: "60 × 90 cm", year: 2025,
      price: 1800, currency: "USD", sold: false, featured: true,
      image: "/assets/images/painting-2.jpg",
      images: ["/assets/images/painting-2.jpg", "/assets/images/painting-2a.jpg"],
      description: "The sea at dawn — before the world wakes. Layered blues and greys build an atmosphere of solitude and vastness.",
      category: "Seascape", inStock: true
    },
    {
      id: "the-thoughtful-one", title: "The Thoughtful One",
      medium: "Charcoal and Ink on Paper", size: "50 × 65 cm", year: 2024,
      price: 1200, currency: "USD", sold: true, featured: false,
      image: "/assets/images/painting-3.jpg",
      images: ["/assets/images/painting-3.jpg"],
      description: "A portrait study in introspection. The subject turns slightly away, caught mid-thought. Charcoal smudging creates soft transitions, while sharp ink lines define the contours of a mind at work.",
      category: "Portrait", inStock: false
    },
    {
      id: "urban-solitude", title: "Urban Solitude",
      medium: "Oil on Canvas", size: "100 × 120 cm", year: 2024,
      price: 3200, currency: "USD", sold: false, featured: true,
      image: "/assets/images/painting-4.jpg",
      images: ["/assets/images/painting-4.jpg", "/assets/images/painting-4a.jpg", "/assets/images/painting-4b.jpg"],
      description: "A rain-slicked city street at midnight — reflections of neon signs ripple across wet asphalt.",
      category: "Cityscape", inStock: true
    },
    {
      id: "roots-and-wings", title: "Roots & Wings",
      medium: "Mixed Media on Canvas", size: "90 × 90 cm", year: 2024,
      price: 2000, currency: "USD", sold: false, featured: false,
      image: "/assets/images/painting-5.jpg",
      images: ["/assets/images/painting-5.jpg"],
      description: "An abstract exploration of heritage and freedom. Tree roots morph into bird wings at the top — grounded yet reaching.",
      category: "Abstract", inStock: true
    },
    {
      id: "golden-hour-fields", title: "Golden Hour Fields",
      medium: "Oil on Canvas", size: "70 × 100 cm", year: 2023,
      price: 1600, currency: "USD", sold: true, featured: false,
      image: "/assets/images/painting-6.jpg",
      images: ["/assets/images/painting-6.jpg", "/assets/images/painting-6a.jpg"],
      description: "Wheat fields stretching to the horizon under a late afternoon sun.",
      category: "Landscape", inStock: false
    },
    {
      id: "fractured-light", title: "Fractured Light",
      medium: "Acrylic on Canvas", size: "80 × 80 cm", year: 2023,
      price: 1500, currency: "USD", sold: false, featured: false,
      image: "/assets/images/painting-7.jpg",
      images: ["/assets/images/painting-7.jpg"],
      description: "Light breaks through a prism — or perhaps through a stained glass window shattered and reassembled.",
      category: "Abstract", inStock: true
    },
    {
      id: "the-dancers", title: "The Dancers",
      medium: "Oil on Canvas", size: "120 × 80 cm", year: 2023,
      price: 2800, currency: "USD", sold: false, featured: true,
      image: "/assets/images/painting-8.jpg",
      images: ["/assets/images/painting-8.jpg", "/assets/images/painting-8a.jpg", "/assets/images/painting-8b.jpg"],
      description: "Two figures in motion — bodies intertwined in a dance that speaks of connection, trust, and the joy of moving as one.",
      category: "Figurative", inStock: true
    },
    {
      id: "meditation-in-blue", title: "Meditation in Blue",
      medium: "Watercolour on Paper", size: "40 × 50 cm", year: 2022,
      price: 800, currency: "USD", sold: false, featured: false,
      image: "/assets/images/painting-9.jpg",
      images: ["/assets/images/painting-9.jpg"],
      description: "A minimalist study in shades of blue — from cerulean to indigo.",
      category: "Abstract", inStock: true
    }
  ];
  data.forEach(p => paintings.set(p.id, { ...p }));
}

seed();

function toArray() {
  return Array.from(paintings.values());
}

function nextId(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function getAll() {
  return toArray();
}

export async function getById(id) {
  return paintings.get(id) || null;
}

export async function getFeatured() {
  return toArray().filter(p => p.featured);
}

export async function getByCategory(category) {
  return toArray().filter(p => p.category === category);
}

export async function create(data) {
  const id = data.id || nextId(data.title);
  const painting = {
    id,
    title: data.title || 'Untitled',
    medium: data.medium || '',
    size: data.size || '',
    year: data.year || new Date().getFullYear(),
    price: data.price || 0,
    currency: data.currency || 'USD',
    sold: data.sold || false,
    featured: data.featured || false,
    image: data.image || '',
    images: data.images || [],
    description: data.description || '',
    category: data.category || '',
    inStock: data.inStock !== undefined ? data.inStock : !data.sold
  };
  paintings.set(id, painting);
  return painting;
}

export async function update(id, data) {
  const existing = paintings.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data, id };
  paintings.set(id, updated);
  return updated;
}

export async function remove(id) {
  return paintings.delete(id);
}

export async function reorder(fromIndex, toIndex) {
  const arr = toArray();
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  paintings.clear();
  arr.forEach((p, i) => paintings.set(p.id, { ...p, order: i }));
}

export async function getAllJSON() {
  return JSON.stringify({ paintings: toArray() }, null, 2);
}

export async function importJSON(json) {
  const parsed = JSON.parse(json);
  if (!parsed.paintings || !Array.isArray(parsed.paintings)) {
    throw new Error('Invalid JSON — must have "paintings" array');
  }
  paintings.clear();
  parsed.paintings.forEach(p => paintings.set(p.id, { ...p }));
}

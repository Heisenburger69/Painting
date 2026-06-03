const DataStore = {
    paintings: { paintings: [] },
    _loaded: false,

    async load() {
        if (this._loaded) return;
        try {
            const p = await fetch('data/paintings.json?_=' + Date.now());
            if (p.ok) {
                this.paintings = await p.json();
                if (!this._offlineMode) localStorage.setItem('atelier_paintings', JSON.stringify(this.paintings));
            }
        } catch (err) {
            this._offlineMode = true;
            const stored = localStorage.getItem('atelier_paintings');
            if (stored) this.paintings = JSON.parse(stored);
        }
        this._loaded = true;
    },

    getPaintings() {
        return this.paintings.paintings || [];
    },

    getPainting(id) {
        return this.getPaintings().find(p => p.id === id);
    },

    getFeatured() {
        return this.getPaintings().filter(p => p.featured);
    },

    getAvailable() {
        return this.getPaintings().filter(p => p.inStock);
    },

    getByCategory(category) {
        return this.getPaintings().filter(p => p.category === category);
    },

    reorderPainting(fromIndex, toIndex) {
        const items = this.paintings.paintings;
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        localStorage.setItem('atelier_paintings', JSON.stringify(this.paintings));
    },

    addPainting(painting) {
        this.paintings.paintings.unshift(painting);
    },

    updatePainting(id, updated) {
        const idx = this.paintings.paintings.findIndex(p => p.id === id);
        if (idx !== -1) this.paintings.paintings[idx] = updated;
    },

    deletePainting(id) {
        this.paintings.paintings = this.paintings.paintings.filter(p => p.id !== id);
    },

    getPaintingsJSON() {
        return JSON.stringify(this.paintings, null, 2);
    },

    importPaintings(json) {
        const parsed = JSON.parse(json);
        if (parsed.paintings && Array.isArray(parsed.paintings)) {
            this.paintings = parsed;
            localStorage.setItem('atelier_paintings', JSON.stringify(this.paintings));
            return true;
        }
        throw new Error('Invalid JSON — must have "paintings" array');
    },

    reload() {
        this._loaded = false;
        localStorage.removeItem('atelier_paintings');
        return this.load();
    },

    generateId(title) {
        return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
};

# TruthLens AI - Premium Frontend

A high-end, visually rich React application for hallucination verification.

## ✨ Key Features
- **3D Rocket Intro**: Custom procedural 3D launch sequence built with `@react-three/fiber`.
- **Reactive UI**: Mouse-driven 3D parallax on cards and hero elements.
- **Glassmorphism Design**: Modern, translucent Charcoal/Navy design system.
- **Verification Portal**: Live scraping dashboard integrated with the TruthLens backend.

## 🚀 Installation & Run

### Development
1. Navigate to frontend directory:
   ```bash
   cd truthlens-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

### Environment Config
Create a `.env` file in `truthlens-ui/` root:
```env
VITE_API_URL=http://localhost:3000
```

## 🎨 Font Replacement (Smooch Sans)
The project currently uses **Poppins** with tracked spacing to mimic the Smooch Sans vibe. To switch to the real file:
1. Place `SmoochSans-Regular.woff2` in `src/assets/fonts/`.
2. Define `@font-face` in `src/index.css`.
3. Update `tailwind.config.js` to use `Smooch Sans` as primary.

## ⚖️ Legal Note
This frontend is a research demonstration. Please ensure the backend scraping behavior aligns with the legal requirements of your target domains (respect `robots.txt`).

## ✅ Acceptance Checklist (UI)
- [ ] Preloader plays for 4.5 seconds and transitions beautifully.
- [ ] Rocket model is procedural (no 404 assets).
- [ ] Hovering over the Login card tilts it in 3D.
- [ ] Dashboard displays scraped titles and raw snippets correctly.
- [ ] Responsive down to 320px width.

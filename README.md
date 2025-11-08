# Ustaadh — Verified Tutors MVP (Static)
A no-build static MVP site for a verified tutors platform with search, filters, profiles, and trial bookings (localStorage).
link https://nouraalgahtani.github.io/BUS.github.io/
## Features
- Beautiful Tailwind UI via CDN (no build step).
- Search & filters by subject, city, and rate range.
- Sorting by rating or price.
- Tutor cards with verified badge, rating stars, and modalities.
- Profile drawer and trial booking modal.
- Commission math preview (12% platform fee).
- Plans section for tutors (subscriptions + premium placement).
- Trust & Safety section (ID checks, secure bookings, vetted reviews).

## How to Run
Just open `index.html` in a browser. (If your browser blocks `fetch` for local files, use a local server:)
```bash
# Python 3
cd verified_tutors_mvp
python -m http.server 5500
# then visit http://localhost:5500
```

## Customize
- Update subjects, cities, rates, and bios in `data/tutors.json`.
- Branding: edit colors in Tailwind config block in `index.html`, and `assets/logo.svg`.
- Commission percentage in `scripts/app.js` → `const feePct = 0.12`.

© 2025 Ustaadh.

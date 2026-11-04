# Motissimo

Collection of 80 French arrow-word puzzles ("mots fléchés") in 8 themed categories.
Live at https://motissimo.pxly.fr

Built with React, TypeScript, Vite and Tailwind CSS. Progress is stored in the browser (localStorage).

## Development

Requires Node.js 22+.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs to dist/
```

## Deployment

Pushing to `main` builds the app and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). The custom domain is set by `public/CNAME`.

Puzzles live in `public/assets/grilles/` and are listed in `components/HomePage.tsx`.

# Motissimo

Collection de 80 grilles de mots fléchés réparties en 8 catégories thématiques.
En ligne sur https://motissimo.pxly.fr

Réalisé avec React, TypeScript, Vite et Tailwind CSS. La progression est enregistrée dans le navigateur (localStorage).

## Développement

Nécessite Node.js 22 ou plus.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # génère dist/
```

## Déploiement

Chaque push sur `main` compile l'application et la déploie sur GitHub Pages
(`.github/workflows/deploy.yml`). Le domaine personnalisé est défini dans `public/CNAME`.

Les grilles se trouvent dans `public/assets/grilles/` et sont listées dans `components/HomePage.tsx`.

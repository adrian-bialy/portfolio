# Interactive CV / Portfolio

A zero-build, YAML-configured CV/portfolio site for GitHub Pages. Dark theme by default with a light-mode toggle. All content lives in `data/*.yaml` — no HTML or JS edits needed to update it.

## Editing content

| File | What it controls |
|---|---|
| `data/profile.yaml` | Name, role, tagline, location, contact links, avatar emoji or photo |
| `data/tech.yaml` | Categorized tech stack; each skill has a stable `id` |
| `data/domains.yaml` | Domain experience cards; each domain has a stable `id` |
| `data/education.yaml` | Education entries and certificates (with optional logos) |
| `data/projects.yaml` | Portfolio entries referencing tech and domain `id`s |

Rules:

- `projects.yaml` → `domain:` must match an `id` from `domains.yaml`.
- `projects.yaml` → `tech: [...]` entries must match skill `id`s from `tech.yaml`.
- Logos in `data/education.yaml` are optional paths (drop files into `assets/logos/`) or full URLs; if a logo is missing or fails to load, the entry's emoji is shown instead.
- To use a photo instead of the avatar emoji, add `photo: assets/me.jpg` to `profile.yaml`.

## Preview locally

The YAML files are fetched at runtime, so opening `index.html` via `file://` won't work. Serve the folder instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a public repository on GitHub and push this folder to the `main` branch.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch", pick `main` and `/ (root)`, then save.
4. The site will be live at `https://<username>.github.io/<repo>/` within a minute or two.

No GitHub Actions or build step required — the `.nojekyll` file makes Pages serve everything as-is.

## Features

- Filterable tech stack: category pills narrow the grid; clicking a skill chip filters the portfolio.
- Clickable domain cards that filter the portfolio.
- Active-filter bar with individual remove and clear-all controls.
- Dark/light theme toggle persisted in `localStorage`.
- Responsive, minimalist design; no frameworks, one CDN dependency ([js-yaml](https://github.com/nodeca/js-yaml)).

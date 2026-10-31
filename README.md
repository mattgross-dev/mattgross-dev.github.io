# mattgross.com

Personal portfolio and writing site for Matt Gross, built with [Quarto](https://quarto.org) and published to GitHub Pages at [mattgross.com](https://mattgross.com).

## Site structure

```
index.qmd        Home — hero, focus areas, recent writing
about.qmd       Short bio
experience.qmd  Career timeline
projects.qmd    Project index
writing.qmd     Essay listing (posts/)
contact.qmd     How to reach me
posts/          Essays (blog content)
projects/       Project detail pages
styles/         Theme SCSS + site.css (custom design layer)
```

## Local development

Prerequisites: [Quarto](https://quarto.org/docs/download/) v1.4 or newer.

```bash
# Live preview at http://localhost:3333 (auto-reloads on change)
quarto preview

# One-off production render into _site/
quarto render
```

## Publishing

Pushing to `main` triggers the [publish workflow](.github/workflows/publish.yml): checkout → Quarto render → upload `_site/` → deploy to GitHub Pages. The `CNAME` file at the repo root rides along into `_site/` on render, preserving the custom domain.

New writing: add a `.qmd` file to `posts/` with `title`, `date`, `categories`, and `description` front matter — it appears on the home page and the Writing listing automatically.

## GitHub Pages & DNS configuration

One-time setup (repo Settings):

1. **Pages → Build and deployment → Source:** *GitHub Actions* (not "Deploy from a branch").
2. **Custom domain:** set to `mattgross.com`. This creates the DNS check; the `CNAME` file is already committed.

DNS (at the domain registrar):

- **Apex record:** `A` records for `mattgross.com` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub's Pages IPs), or a `CNAME`/`ALIAS` to `<username>.github.io` if the registrar supports it.
- **WWW:** `CNAME` for `www.mattgross.com` → `<username>.github.io`.
- Wait for the DNS check to pass, then enable **Enforce HTTPS** in Pages settings. HTTPS is forced for the site; `http://` requests redirect.

## Notes

- No analytics or tracking of any kind.
- Fonts are self-hosted; no third-party font CDN requests.
- `robots.txt` allows all crawlers; `sitemap.xml` is generated on render.
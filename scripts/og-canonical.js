import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Post-render hook (see `project.post-render` in _quarto.yml).
//
// Quarto emits no og:url Open Graph tag at all, so this script walks every
// rendered HTML file in the output directory and, using `website.site-url`,
// inserts into <head> (only when the page does not already have one):
//
//   <meta property="og:url" content="...">
//   <link rel="canonical" href="...">
//
// The canonical link is a fallback for pages where quarto's own
// `canonical-url: true` handling did not emit one. URL shape:
//
//   _site/index.html         -> https://mattgross.com/
//   _site/writing/index.html -> https://mattgross.com/writing/
//   _site/about.html         -> https://mattgross.com/about.html
//
// Runs under quarto's bundled Deno (`deno run --allow-all`) and under plain
// Node (`node scripts/og-canonical.js`); only node: modules are used.

const projectDir = dirname(dirname(fileURLToPath(import.meta.url)));

// --- site-url and output-dir, read from _quarto.yml -------------------------
const yml = readFileSync(join(projectDir, "_quarto.yml"), "utf8");
const siteUrlMatch = yml.match(/^\s*site-url:\s*"?([^"#\s]+)"?/m);
if (!siteUrlMatch) {
  throw new Error("og-canonical: website.site-url not found in _quarto.yml");
}
const siteUrl = siteUrlMatch[1].replace(/\/+$/, "");
const outputDirMatch = yml.match(/^\s*output-dir:\s*"?([^"#\s]+)"?/m);
const outputDir = join(
  projectDir,
  outputDirMatch ? outputDirMatch[1] : "_site",
);

// --- collect rendered HTML files ---------------------------------------------
function walkHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(p));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function pageUrl(rel) {
  if (rel === "index.html") return `${siteUrl}/`;
  if (rel.endsWith("/index.html")) {
    return `${siteUrl}/${rel.slice(0, -"index.html".length)}`;
  }
  return `${siteUrl}/${rel}`;
}

// --- inject missing og:url / canonical into <head> ---------------------------
let ogCount = 0;
let canonicalCount = 0;
let files = 0;
for (const file of walkHtml(outputDir)) {
  files += 1;
  let html = readFileSync(file, "utf8");
  const url = pageUrl(relative(outputDir, file));
  const add = [];
  if (!/property="og:url"/.test(html)) {
    add.push(`  <meta property="og:url" content="${url}">`);
    ogCount += 1;
  }
  if (!/rel="canonical"/.test(html)) {
    add.push(`  <link rel="canonical" href="${url}">`);
    canonicalCount += 1;
  }
  if (add.length > 0) {
    html = html.replace("</head>", add.join("\n") + "\n</head>");
    writeFileSync(file, html);
  }
}
console.log(
  `og-canonical: processed ${files} page(s); added og:url to ${ogCount},` +
    ` canonical to ${canonicalCount}`,
);
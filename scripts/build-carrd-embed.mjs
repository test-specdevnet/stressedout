import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const distDir = path.join(projectRoot, "dist");
const htmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(htmlPath)) {
  throw new Error("Missing dist/index.html. Run the Vite build first.");
}

const html = fs.readFileSync(htmlPath, "utf8");
const cssHref = html.match(/href="(.+?\.css)"/)?.[1];
const jsSrc = html.match(/src="(.+?\.js)"/)?.[1];
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]?.trim() ?? "";
const fontLinks = (html.match(/<link[^>]+fonts\.googleapis[^>]+stylesheet[^>]*>/gi) ?? []).join("\n");
const preconnects = (
  html.match(
    /<link[^>]+rel="preconnect"[^>]+fonts\.googleapis[^>]*>|<link[^>]+rel="preconnect"[^>]+fonts\.gstatic[^>]*>/gi,
  ) ?? []
).join("\n");

if (!cssHref || !jsSrc) {
  throw new Error("Could not find built CSS or JS assets in dist/index.html.");
}

const css = fs.readFileSync(path.join(distDir, cssHref), "utf8");
const js = fs.readFileSync(path.join(distDir, jsSrc), "utf8");

const embed = `${preconnects}
${fontLinks}
<style>
${css}
</style>
${body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").trim()}
<script type="module">
${js}
</script>
`;

fs.writeFileSync(path.join(distDir, "carrd-hero-embed.html"), embed.trim());
console.log("Created dist/carrd-hero-embed.html");

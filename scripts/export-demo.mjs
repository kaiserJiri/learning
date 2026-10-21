import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const style = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!script || !style) throw new Error('Cannot find the built JavaScript and stylesheet.');
const javascript = await readFile(resolve(dist, script[1].replace(/^\//, '')), 'utf8');
const css = (await readFile(resolve(dist, style[1].replace(/^\//, '')), 'utf8'))
  .replace(/@import\s*(?:url\([^)]*\)|"[^"]*"|'[^']*')\s*;/g, '');
html = html.replace(script[0], () => `<script>${javascript.replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(style[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
// A classic inline script must execute after #app has been created.
const inlineScript = html.match(/<script>[\s\S]*?<\/script>/)[0];
html = html.replace(inlineScript, '').replace('</body>', () => `${inlineScript}\n</body>`);
await writeFile(resolve(dist, 'little-step.html'), html.replace(/[\t ]+$/gm, ''));
console.log('Standalone app saved to dist/little-step.html');

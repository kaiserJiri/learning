import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const docs = resolve(root, 'docs');
await mkdir(docs, { recursive: true });
await copyFile(resolve(root, 'dist/little-step.html'), resolve(docs, 'index.html'));
await writeFile(resolve(docs, '.nojekyll'), '');
console.log('GitHub Pages site prepared in docs/.');

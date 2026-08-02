import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'styles.css',
  'script.js',
  'assets/favicon.svg',
  'assets/prasham-doshi-resume.pdf',
];

const errors = [];

for (const file of requiredFiles) {
  try {
    await access(resolve(root, file));
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

const html = await readFile(resolve(root, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const internalLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);

for (const target of internalLinks) {
  if (!ids.has(target)) errors.push(`Anchor target not found: #${target}`);
}

for (const placeholder of ['TODO', 'example.com', 'Your Name', 'lorem ipsum']) {
  if (html.toLowerCase().includes(placeholder.toLowerCase())) {
    errors.push(`Placeholder content found: ${placeholder}`);
  }
}

if (!html.includes('lang="en"')) errors.push('Document language is missing.');
if (!html.includes('name="description"')) errors.push('Meta description is missing.');
if (!html.includes('id="main-content"')) errors.push('Main landmark target is missing.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Checks passed: ${requiredFiles.length} files, ${ids.size} IDs, ${internalLinks.length} internal links.`);

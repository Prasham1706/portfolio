import { copyFile, cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const outputRoot = resolve(projectRoot, 'dist');

await mkdir(outputRoot, { recursive: true });
await mkdir(resolve(outputRoot, 'server'), { recursive: true });
await Promise.all([
  copyFile(resolve(projectRoot, 'index.html'), resolve(outputRoot, 'index.html')),
  copyFile(resolve(projectRoot, 'styles.css'), resolve(outputRoot, 'styles.css')),
  copyFile(resolve(projectRoot, 'script.js'), resolve(outputRoot, 'script.js')),
  cp(resolve(projectRoot, 'assets'), resolve(outputRoot, 'assets'), { recursive: true, force: true }),
  writeFile(
    resolve(outputRoot, 'server', 'index.js'),
    `export default {\n  async fetch(request, env) {\n    return env.ASSETS.fetch(request);\n  },\n};\n`,
    'utf8',
  ),
]);

console.log(`Static build written to ${outputRoot}`);

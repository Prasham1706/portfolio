import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const requestedRoot = process.argv[2] || '.';
const root = resolve(process.cwd(), requestedRoot);
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

if (!existsSync(root)) {
  console.error(`Site directory does not exist: ${root}`);
  process.exit(1);
}

createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const pathname = decodeURIComponent(new URL(request.url || '/', `http://${host}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^[/\\]+/, '');
  let filePath = resolve(join(root, relativePath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
  });

  if (request.method === 'HEAD') response.end();
  else createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Portfolio ready at http://${host}:${port}`);
  console.log(`Serving ${root}`);
});

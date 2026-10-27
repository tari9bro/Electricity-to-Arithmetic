import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] || '.';
const root = path.resolve(rootDir, target);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') pathname = '/index.html';
  const full = path.resolve(root, `.${pathname}`);
  if (!full.startsWith(root) || !existsSync(full)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
  try {
    if (!statSync(full).isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'content-type': mime[path.extname(full)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    createReadStream(full).pipe(res);
  } catch { res.writeHead(500).end('Server error'); }
});
const port = Number(process.env.PORT || 5173);
server.listen(port, () => console.log(`CPU Lab available at http://localhost:${port}/ (${root})`));

// ESM script: download all unique logos from organizations and initiatives tables
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import initSqlJs from 'sql.js';

const ROOT = path.resolve('.');
const DB_PATH = path.join(ROOT, 'public', 'csr_database.db');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'reports');
const CACHE_JSON = path.join(OUT_DIR, 'logo-cache.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function guessExtFromContentType(ct) {
  if (!ct) return 'bin';
  if (ct.includes('image/png')) return 'png';
  if (ct.includes('image/jpeg')) return 'jpg';
  if (ct.includes('image/jpg')) return 'jpg';
  if (ct.includes('image/svg')) return 'svg';
  if (ct.includes('image/webp')) return 'webp';
  if (ct.includes('image/gif')) return 'gif';
  return 'bin';
}

function guessExtFromUrl(url) {
  try {
    const u = new URL(url);
    const p = u.pathname;
    const m = p.match(/\.([a-zA-Z0-9]+)$/);
    if (m) {
      const ext = m[1].toLowerCase();
      if (['png','jpg','jpeg','svg','webp','gif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  } catch {}
  return null;
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

async function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found:', DB_PATH);
    process.exit(1);
  }
  const SQL = await initSqlJs({ locateFile: (file) => path.join(ROOT, 'node_modules', 'sql.js', 'dist', file) });
  const buf = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(new Uint8Array(buf));
  return db;
}

function selectAllLogos(db) {
  const logos = [];
  const tables = [
    { table: 'organizations', keyPrefix: 'org' },
    { table: 'initiatives', keyPrefix: 'init' }
  ];
  for (const t of tables) {
    const stmt = db.prepare(`SELECT id, name, logo FROM ${t.table}`);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const id = row.id;
      const name = row.name || `${t.keyPrefix}-${id}`;
      const logo = row.logo || '';
      if (logo && typeof logo === 'string') {
        logos.push({ source: t.table, id, name, url: logo.trim() });
      }
    }
    stmt.free();
  }
  return logos;
}

async function downloadUnique(logos) {
  ensureDir(OUT_DIR);
  const cache = fs.existsSync(CACHE_JSON) ? JSON.parse(fs.readFileSync(CACHE_JSON, 'utf-8')) : {};

  // dedupe by normalized URL
  const byUrl = new Map();
  for (const item of logos) {
    const url = item.url;
    if (!url) continue;
    const key = url.trim();
    if (!byUrl.has(key)) byUrl.set(key, []);
    byUrl.get(key).push(item);
  }

  const results = { ...cache };
  let savedCount = 0;
  let skippedLocal = 0;
  let failedCount = 0;

  for (const [url, items] of byUrl.entries()) {
    // If already cached, skip
    if (results[url]) continue;

    // Skip local images in /images path
    if (url.startsWith('/images/')) {
      results[url] = url; // map to itself
      skippedLocal++;
      continue;
    }

    if (!isExternalUrl(url)) {
      // possibly relative or data URL; keep as-is
      results[url] = url;
      skippedLocal++;
      continue;
    }

    try {
      const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const ct = resp.headers['content-type'] || '';
      const extGuess = guessExtFromUrl(url) || guessExtFromContentType(ct);
      const nameSlug = slugify(items[0].name);
      const hash = Buffer.from(url).toString('base64').replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
      const filename = `${nameSlug || 'logo'}-${hash}.${extGuess}`;
      const outPath = path.join(OUT_DIR, filename);
      fs.writeFileSync(outPath, resp.data);
      const publicPath = `/images/reports/${filename}`;
      results[url] = publicPath;
      savedCount++;
      console.log(`Saved: ${publicPath} <- ${url}`);
    } catch (e) {
      failedCount++;
      console.warn(`Failed to download ${url}: ${e.message}`);
    }
  }

  fs.writeFileSync(CACHE_JSON, JSON.stringify(results, null, 2));
  console.log(`\nSummary: saved=${savedCount}, skippedLocal=${skippedLocal}, failed=${failedCount}, totalUnique=${byUrl.size}`);
  console.log(`Cache index: ${CACHE_JSON}`);
}

async function main() {
  const db = await initDb();
  const logos = selectAllLogos(db);
  if (!logos.length) {
    console.log('No logos found in database.');
    return;
  }
  await downloadUnique(logos);
}

main().catch(err => {
  console.error('Download logos script error:', err);
  process.exit(1);
});
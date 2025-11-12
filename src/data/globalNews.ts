import { InsightReport } from './insightReports';

export interface GlobalNewsItem {
  id: string;
  coverImage: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  linkZh: string;
  linkEn: string;
  date: string;
}

const globalNews: GlobalNewsItem[] = [];

const STORAGE_KEY = 'globalNewsStore';
const UPDATE_EVENT = 'global-news-updated';

function dispatchUpdateEvent() {
  try {
    if (typeof window === 'undefined') return;
    const ev = new Event(UPDATE_EVENT);
    window.dispatchEvent(ev);
  } catch {}
}

const ENABLE_SERVER_SYNC = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (((import.meta as any).env.DEV === true) || ((import.meta as any).env.VITE_ENABLE_SERVER_INSIGHTS === 'true'))
  : false;

async function saveToServerIfAvailable() {
  try {
    if (typeof window === 'undefined') return;
    if (!ENABLE_SERVER_SYNC) return;
    const payload = { items: globalNews };
    const tryUrls = ['/api/news', 'http://localhost:3001/api/news', 'http://localhost:3002/api/news'];
    for (const url of tryUrls) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (resp.ok) break;
      } catch {}
    }
  } catch {}
}

function bootstrapStore() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      const normalized = (arr as any[]).map(n => {
        if (n && typeof n === 'object' && typeof n.coverImage === 'string') {
          const s = n.coverImage as string;
          if (s.startsWith('/uploads/')) {
            const dev = (typeof import.meta !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.DEV === true));
            return { ...n, coverImage: dev ? `http://localhost:3002${s}` : s };
          }
        }
        return n;
      });
      globalNews.splice(0, globalNews.length, ...normalized as any);
    }
  } catch {}
}

function saveStore() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(globalNews));
    void saveToServerIfAvailable();
    dispatchUpdateEvent();
  } catch {}
}

bootstrapStore();

async function bootstrapFromServerIfEmpty() {
  try {
    if (typeof window === 'undefined') return;
    if (!ENABLE_SERVER_SYNC) return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return;
    const urls = ['/api/news', 'http://localhost:3001/api/news', 'http://localhost:3002/api/news'];
    let data: any = null;
    for (const url of urls) {
      try {
        const resp = await fetch(url);
        if (resp.ok) { data = await resp.json(); break; }
      } catch {}
    }
    if (!data) return;
    const arr = Array.isArray(data?.items) ? data.items : [];
    if (Array.isArray(arr) && arr.length > 0) {
      globalNews.splice(0, globalNews.length, ...arr);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(globalNews));
      dispatchUpdateEvent();
    }
  } catch {}
}

void bootstrapFromServerIfEmpty();

export function getAllGlobalNews(): GlobalNewsItem[] {
  return globalNews;
}

export function replaceGlobalNews(items: GlobalNewsItem[]): void {
  if (Array.isArray(items)) {
    globalNews.splice(0, globalNews.length, ...items);
    saveStore();
  }
}

export function addGlobalNews(item: GlobalNewsItem): void {
  globalNews.unshift(item);
  saveStore();
}

export function updateGlobalNews(id: string, partial: Partial<GlobalNewsItem>): boolean {
  const idx = globalNews.findIndex(n => n.id === id);
  if (idx !== -1) {
    globalNews[idx] = { ...globalNews[idx], ...partial };
    saveStore();
    return true;
  }
  return false;
}

export function deleteGlobalNews(id: string): boolean {
  const idx = globalNews.findIndex(n => n.id === id);
  if (idx !== -1) {
    globalNews.splice(idx, 1);
    saveStore();
    return true;
  }
  return false;
}

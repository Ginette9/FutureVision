export interface MustReadItem {
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

const mustReads: MustReadItem[] = [];

const STORAGE_KEY = 'mustReadStore';
const UPDATE_EVENT = 'must-read-updated';

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
    const payload = { items: mustReads } as any;
    const tryUrls = ['/api/must-reads', 'http://localhost:3001/api/must-reads', 'http://localhost:3002/api/must-reads'];
    for (const url of tryUrls) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && window.localStorage.getItem('adminToken')
              ? { 'X-Admin-Token': String(window.localStorage.getItem('adminToken')) }
              : {})
          },
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
        if (n && typeof n === 'object' && typeof (n as any).coverImage === 'string') {
          let s = String((n as any).coverImage);
          s = s.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '');
          if (s && !s.startsWith('http') && !s.startsWith('/')) s = '/' + s;
          return { ...n, coverImage: s };
        }
        return n;
      });
      mustReads.splice(0, mustReads.length, ...normalized as any);
    }
  } catch {}
}

function saveStore() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mustReads));
    void saveToServerIfAvailable();
    dispatchUpdateEvent();
  } catch {}
}

bootstrapStore();

async function bootstrapFromServerIfEmpty() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const urls = [
      '/api/must-reads',
      '/data/must-reads.json',
      'http://localhost:3001/api/must-reads',
      'http://localhost:3002/api/must-reads',
      'http://localhost:3001/data/must-reads.json',
      'http://localhost:3002/data/must-reads.json'
    ];
    let data: any = null;
    for (const url of urls) {
      try {
        const resp = await fetch(url);
        if (resp.ok) { data = await resp.json(); break; }
      } catch {}
    }
    if (!data) return;
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
    if (Array.isArray(arr) && arr.length > 0) {
      const normalized = (arr as any[]).map(n => {
        if (n && typeof n === 'object' && typeof (n as any).coverImage === 'string') {
          let s = String((n as any).coverImage);
          s = s.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '');
          if (s && !s.startsWith('http') && !s.startsWith('/')) s = '/' + s;
          return { ...n, coverImage: s };
        }
        return n;
      });
      mustReads.splice(0, mustReads.length, ...normalized as any);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mustReads));
      dispatchUpdateEvent();
    }
  } catch {}
}
void bootstrapFromServerIfEmpty();

export function getAllMustReads(): MustReadItem[] { return mustReads; }
export function replaceMustReads(items: MustReadItem[]): void {
  if (Array.isArray(items)) {
    mustReads.splice(0, mustReads.length, ...items);
    saveStore();
  }
}

export function addMustRead(item: MustReadItem): void {
  mustReads.unshift(item);
  saveStore();
}

export function addManyMustReads(items: MustReadItem[]): void {
  if (Array.isArray(items) && items.length > 0) {
    mustReads.splice(0, 0, ...items);
    saveStore();
  }
}

export function updateMustRead(id: string, partial: Partial<MustReadItem>): boolean {
  const idx = mustReads.findIndex(n => n.id === id);
  if (idx !== -1) {
    mustReads[idx] = { ...mustReads[idx], ...partial } as MustReadItem;
    saveStore();
    return true;
  }
  return false;
}

export function deleteMustRead(id: string): boolean {
  const idx = mustReads.findIndex(n => n.id === id);
  if (idx !== -1) {
    mustReads.splice(idx, 1);
    saveStore();
    return true;
  }
  return false;
}

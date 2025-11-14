export interface CourseResourceItem {
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

const courses: CourseResourceItem[] = [];

const STORAGE_KEY = 'courseStore';
const UPDATE_EVENT = 'course-updated';

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
    const payload = { items: courses } as any;
    const tryUrls = ['/api/courses', 'http://localhost:3001/api/courses', 'http://localhost:3002/api/courses'];
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
      courses.splice(0, courses.length, ...normalized as any);
    }
  } catch {}
}

function saveStore() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    void saveToServerIfAvailable();
    dispatchUpdateEvent();
  } catch {}
}

bootstrapStore();

async function bootstrapFromServerIfEmpty() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const urls = ['/api/courses', '/data/courses.json', 'http://localhost:3001/api/courses', 'http://localhost:3002/api/courses'];
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
      const normalized = (arr as any[]).map(n => {
        if (n && typeof n === 'object' && typeof (n as any).coverImage === 'string') {
          let s = String((n as any).coverImage);
          s = s.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/, '');
          if (s && !s.startsWith('http') && !s.startsWith('/')) s = '/' + s;
          return { ...n, coverImage: s };
        }
        return n;
      });
      courses.splice(0, courses.length, ...normalized as any);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
      dispatchUpdateEvent();
    }
  } catch {}
}
void bootstrapFromServerIfEmpty();

export function getAllCourses(): CourseResourceItem[] { return courses; }
export function replaceCourses(items: CourseResourceItem[]): void {
  if (Array.isArray(items)) {
    courses.splice(0, courses.length, ...items);
    saveStore();
  }
}

export function addCourse(item: CourseResourceItem): void {
  courses.unshift(item);
  saveStore();
}

export function addManyCourses(items: CourseResourceItem[]): void {
  if (Array.isArray(items) && items.length > 0) {
    courses.splice(0, 0, ...items);
    saveStore();
  }
}

export function updateCourse(id: string, partial: Partial<CourseResourceItem>): boolean {
  const idx = courses.findIndex(n => n.id === id);
  if (idx !== -1) {
    courses[idx] = { ...courses[idx], ...partial } as CourseResourceItem;
    saveStore();
    return true;
  }
  return false;
}

export function deleteCourse(id: string): boolean {
  const idx = courses.findIndex(n => n.id === id);
  if (idx !== -1) {
    courses.splice(idx, 1);
    saveStore();
    return true;
  }
  return false;
}

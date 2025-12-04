import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/authContext';
import { GlobalNewsItem, getAllGlobalNews, replaceGlobalNews, updateGlobalNews, deleteGlobalNews } from '../data/globalNews';

type ImageInput = { type: 'url' | 'file'; value: string };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImageToServer(file: File, overrideName?: string): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const payload = { filename: overrideName || file.name, contentBase64: dataUrl, folder: 'news-pics' } as any;
  const endpoints = ['/api/uploads', 'http://localhost:3002/api/uploads', 'http://localhost:3001/api/uploads'];
  for (const ep of endpoints) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const t = localStorage.getItem('adminToken');
      if (t) headers['X-Admin-Token'] = t;
      const resp = await fetch(ep, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (resp.ok) {
        const json = await resp.json();
        const path = String(json?.url || '');
        if (!path) continue;
        return path;
      }
    } catch {}
  }
  throw new Error('上传失败');
}

function parseDateFromText(text: string): string {
  try {
    const zh = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (zh) {
      const y = Number(zh[1]);
      const m = String(Number(zh[2])).padStart(2, '0');
      const d = String(Number(zh[3])).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const months: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
      jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
    };
    const en1 = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})/i);
    if (en1) {
      const m = String(months[en1[1].toLowerCase()]).padStart(2, '0');
      const d = String(Number(en1[2])).padStart(2, '0');
      const y = Number(en1[3]);
      return `${y}-${m}-${d}`;
    }
    const en2 = text.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{4})/i);
    if (en2) {
      const d = String(Number(en2[1])).padStart(2, '0');
      const m = String(months[en2[2].toLowerCase()]).padStart(2, '0');
      const y = Number(en2[3]);
      return `${y}-${m}-${d}`;
    }
  } catch {}
  return '';
}

function parseFreeText(input: string): Omit<GlobalNewsItem, 'id' | 'coverImage' | 'date'>[] {
  const rawLines = input.split(/\r?\n/);
  const isZh = (s: string) => /[\u4e00-\u9fff]/.test(s);
  const isEn = (s: string) => /[A-Za-z]/.test(s) && !isZh(s);
  const lines = rawLines.map(l => l.trim()).filter(l => l.length > 0);
  const items: Omit<GlobalNewsItem, 'id' | 'coverImage' | 'date'>[] = [];
  let i = 0;
  const isEndMarker = (s: string) => /^阅读全文|Read Full/i.test(s);

  while (i < lines.length) {
    const titleZh = lines[i++] || '';
    const titleEn = i < lines.length ? lines[i++] : '';

    const summaryZhChunks: string[] = [];
    while (i < lines.length) {
      const s = lines[i];
      if (isEndMarker(s)) break;
      if (isEn(s)) break;
      summaryZhChunks.push(s);
      i++;
    }
    const summaryZh = summaryZhChunks.join('\n');

    const summaryEnChunks: string[] = [];
    while (i < lines.length) {
      const s = lines[i];
      if (isEndMarker(s)) break;
      if (isZh(s)) break;
      summaryEnChunks.push(s);
      i++;
    }
    const summaryEn = summaryEnChunks.join('\n');

    while (i < lines.length && isEndMarker(lines[i])) i++;
    // 忽略结束标记后的杂项英文行（例如栏目名或英文标签），直到遇到下一条的中文标题
    if (i < lines.length && isEn(lines[i]) && (i + 1 < lines.length && isZh(lines[i + 1]))) {
      i++;
    }

    items.push({ titleZh, titleEn, summaryZh, summaryEn, linkZh: '', linkEn: '' });
    if (items.length >= 5) break;
  }
  return items;
}

function parseTsv(input: string): Omit<GlobalNewsItem, 'id' | 'coverImage' | 'date'>[] {
  const trimBackticks = (s: string) => s.replace(/^`+|`+$/g, '').trim();
  const lines = input.split(/\r?\n/);
  const items: Omit<GlobalNewsItem, 'id' | 'coverImage' | 'date'>[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(/\t+/).map(p => p.trim());
    if (parts.length < 3) continue;
    const [titleZh, titleEn, summaryZh, maybeLink] = parts;
    const link = maybeLink ? trimBackticks(maybeLink) : '';
    items.push({ titleZh, titleEn, summaryZh, summaryEn: '', linkZh: link, linkEn: link });
    if (items.length >= 5) break;
  }
  return items;
}

export default function AdminNews() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [existingItems, setExistingItems] = useState<GlobalNewsItem[]>([]);
  const [newItems, setNewItems] = useState<GlobalNewsItem[]>([]);
  const [weeklyText, setWeeklyText] = useState('');
  const [weeklyTextTsv, setWeeklyTextTsv] = useState('');
  const [coverInputs, setCoverInputs] = useState<Record<number, ImageInput>>({});
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    setExistingItems([...getAllGlobalNews()]);
  }, []);

  const handleLogin = (code: string) => {
    // 获取环境变量中的管理员密码
    const adminPassword = import.meta?.env?.VITE_ADMIN_PASSWORD || import.meta?.env?.ADMIN_PASSWORD || 'admin123456';
    if (code && code.trim() === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminLogin', '1');
      try { localStorage.setItem('adminToken', code.trim()); } catch {}
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('adminLogin') === '1') {
      setIsAuthenticated(true);
    }
  }, [setIsAuthenticated]);

  const handleParse = async () => {
    const free = parseFreeText(weeklyText);
    const tsv = parseTsv(weeklyTextTsv);
    const maxLen = Math.max(free.length, tsv.length, 5);
    const result: GlobalNewsItem[] = [];
    for (let idx = 0; idx < Math.min(maxLen, 5); idx++) {
      const f = free[idx];
      const t = tsv[idx];
      let coverUrl = newItems[idx]?.coverImage || '';
      const input = coverInputs[idx];
      if (input?.type === 'url') coverUrl = input.value || coverUrl;
      if (input?.type === 'file' && input.value) {
        const fileInput = document.getElementById(`cover-file-${idx}`) as HTMLInputElement | null;
        const file = fileInput?.files?.[0];
        if (file) coverUrl = await uploadImageToServer(file);
      }
      const parsedDate = parseDateFromText(f?.summaryZh || '') || parseDateFromText(f?.summaryEn || '') || parseDateFromText(t?.summaryZh || '');
      result.push({
        id: `news-${Date.now()}-${idx}`,
        coverImage: coverUrl,
        titleZh: (t?.titleZh || f?.titleZh || ''),
        titleEn: (t?.titleEn || f?.titleEn || ''),
        summaryZh: (f?.summaryZh || t?.summaryZh || ''),
        summaryEn: (f?.summaryEn || ''),
        linkZh: (t?.linkZh || t?.linkEn || existingItems[idx]?.linkZh || existingItems[idx]?.linkEn || ''),
        linkEn: (t?.linkZh || t?.linkEn || existingItems[idx]?.linkZh || existingItems[idx]?.linkEn || ''),
        date: parsedDate || today
      });
    }
    setNewItems(result);
  };

  const ensureNewItemsLength = (len: number) => {
    setNewItems(prev => {
      const arr = [...prev];
      while (arr.length < len) {
        arr.push({
          id: `news-${Date.now()}-${arr.length}`,
          coverImage: '',
          titleZh: '',
          titleEn: '',
          summaryZh: '',
          summaryEn: '',
          linkZh: '',
          linkEn: '',
          date: today
        });
      }
      return arr;
    });
  };

  const handleBatchUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    ensureNewItemsLength(5);
    const mapByIndex: Array<{ idx: number; file: File } | null> = [null, null, null, null, null];
    for (const f of Array.from(files)) {
      const base = f.name.split('.')?.[0] || '';
      const num = Number(base);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        mapByIndex[num - 1] = { idx: num - 1, file: f };
      }
    }
    for (const entry of mapByIndex) {
      if (!entry) continue;
      const ext = (entry.file.name.split('.').pop() || 'jpg').toLowerCase();
      const dateStr = (newItems[entry.idx]?.date || today).replace(/-/g, '');
      const fname = `${dateStr}_${entry.idx + 1}.${ext}`;
      const url = await uploadImageToServer(entry.file, fname);
      setNewItems(prev => prev.map((p, i) => i === entry.idx ? { ...p, coverImage: url } : p));
      setCoverInputs(prev => ({ ...prev, [entry.idx]: { type: 'url', value: url } }));
    }
  };

  const handleSave = () => {
    const combined = [...getAllGlobalNews(), ...newItems];
    replaceGlobalNews(combined);
    setExistingItems([...getAllGlobalNews()]);
    setNewItems([]);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(getAllGlobalNews(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'global-news.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result));
        if (Array.isArray(arr)) replaceGlobalNews(arr as GlobalNewsItem[]);
      } catch {}
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto pt-24 pb-16 px-4">
        <h2 className="text-2xl font-semibold mb-4">管理员登录</h2>
        <input className="border px-3 py-2 w-full mb-4" placeholder="邀请码" onKeyDown={(e) => { if (e.key === 'Enter') handleLogin((e.target as HTMLInputElement).value); }} />
        <button className="px-4 py-2 bg-gray-900 text-white" onClick={() => handleLogin('ok')}>登录</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-24 pb-16 px-4">
      <h2 className="text-3xl font-semibold mb-6">全球要闻管理</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <textarea className="w-full border px-3 py-2 h-48" placeholder="自由文本：中文标题\n英文标题\n中文摘要（多行）\n英文摘要（多行）\n阅读全文 / Read Full" value={weeklyText} onChange={e => setWeeklyText(e.target.value)} />
          <textarea className="w-full border px-3 py-2 h-48" placeholder="TSV：中文标题\t英文标题\t中文摘要\t`链接` 每条一行" value={weeklyTextTsv} onChange={e => setWeeklyTextTsv(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0,1,2,3,4].map(idx => (
            <div key={idx} className="border p-4 space-y-2">
              <div className="flex gap-2">
                <select className="border px-2 py-1" value={coverInputs[idx]?.type || 'url'} onChange={e => setCoverInputs(s => ({ ...s, [idx]: { type: e.target.value as any, value: '' } }))}>
                  <option value="url">图片URL</option>
                  <option value="file">本地上传</option>
                </select>
                {coverInputs[idx]?.type === 'url' ? (
                  <input
                    className="flex-1 border px-2 py-1"
                    placeholder="https://..."
                    value={coverInputs[idx]?.value || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setCoverInputs(s => ({ ...s, [idx]: { type: 'url', value: val } }));
                      setNewItems(prev => prev.map((p: GlobalNewsItem, i: number) => i === idx ? { ...p, coverImage: val } : p));
                    }}
                  />
                ) : (
                  <input
                    id={`cover-file-${idx}`}
                    type="file"
                    accept="image/*"
                    className="flex-1"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
                      const dateStr = (newItems[idx]?.date || today).replace(/-/g, '');
                      const fname = `${dateStr}_${idx + 1}.${ext}`;
                      const url = await uploadImageToServer(file, fname);
                      setNewItems(prev => prev.map((p: GlobalNewsItem, i: number) => i === idx ? { ...p, coverImage: url } : p));
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border p-4">
          <div className="text-sm mb-2">批量上传封面（文件名为 1/2/3/4/5，支持 png/jpg/jpeg/avif/webp）</div>
          <input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/avif,image/webp,image/*" onChange={e => handleBatchUpload(e.target.files)} />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white" onClick={handleParse}>解析并预览</button>
          <button className="px-4 py-2 bg-gray-900 text-white" onClick={handleSave}>保存</button>
          <label className="px-4 py-2 bg-gray-100 text-gray-700 cursor-pointer">
            导入JSON
            <input type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); }} />
          </label>
          <button className="px-4 py-2 bg-gray-100 text-gray-700" onClick={exportJson}>导出JSON</button>
        </div>
      </div>

      <details className="mt-8">
        <summary className="cursor-pointer select-none text-sm text-gray-600">已保存内容（点击展开进行编辑）</summary>
        <div className="mt-4 space-y-8">
          {existingItems.map((it, idx) => (
            <div key={it.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {(() => {
                const s = it.coverImage || '';
                const cover = s.startsWith('/uploads/') ? `http://localhost:3001${s}` : s;
                return <img src={cover} alt={it.titleZh} className="w-full h-auto rounded" />;
              })()}
              <div className="space-y-2">
                <input className="w-full border px-3 py-2" value={it.titleZh} onChange={e => setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, titleZh: e.target.value } : p))} />
                <input className="w-full border px-3 py-2" value={it.titleEn} onChange={e => setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, titleEn: e.target.value } : p))} />
                <textarea className="w-full border px-3 py-2 h-24" value={it.summaryZh} onChange={e => setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryZh: e.target.value } : p))} />
                <textarea className="w-full border px-3 py-2 h-24" value={it.summaryEn} onChange={e => setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryEn: e.target.value } : p))} />
                <input className="border px-3 py-2" placeholder="统一链接地址（所有语言使用同一链接）" value={it.linkZh || it.linkEn || ''} onChange={e => setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, linkZh: e.target.value, linkEn: e.target.value } : p))} />
                <div className="flex items-center gap-2">
                  <input className="flex-1 border px-3 py-2" placeholder="图片URL，如 /news-pics/xxx.jpg 或 https://..." value={it.coverImage} onChange={e => setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, coverImage: e.target.value } : p))} />
                  <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const ext = (file.name.split('.').pop() || 'jpg').toLowerCase(); const dateStr = (it.date || new Date().toISOString().slice(0,10)).replace(/-/g, ''); const fname = `${dateStr}_saved_${idx + 1}.${ext}`; const url = await uploadImageToServer(file, fname); setExistingItems(prev => prev.map(p => p.id === it.id ? { ...p, coverImage: url } : p)); }} />
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border" onClick={() => { deleteGlobalNews(it.id); setExistingItems([...getAllGlobalNews()]); }}>删除</button>
                </div>
              </div>
            </div>
          ))}
          <div>
            <button className="px-4 py-2 bg-indigo-600 text-white" onClick={() => { replaceGlobalNews(existingItems); setExistingItems([...getAllGlobalNews()]); }}>保存更改</button>
          </div>
        </div>
      </details>

      <div className="mt-8 space-y-8">
        {newItems.map((it, idx) => (
          <div key={it.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {(() => {
              const s = it.coverImage || '';
              const cover = s.startsWith('/uploads/') ? `http://localhost:3001${s}` : s;
              return <img src={cover} alt={it.titleZh} className="w-full h-auto rounded" />;
            })()}
            <div className="space-y-2">
              <input className="w-full border px-3 py-2" value={it.titleZh} onChange={e => setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, titleZh: e.target.value } : p))} />
              <input className="w-full border px-3 py-2" value={it.titleEn} onChange={e => setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, titleEn: e.target.value } : p))} />
              <textarea className="w-full border px-3 py-2 h-24" value={it.summaryZh} onChange={e => setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryZh: e.target.value } : p))} />
              <textarea className="w-full border px-3 py-2 h-24" value={it.summaryEn} onChange={e => setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryEn: e.target.value } : p))} />
              <div className="grid grid-cols-1 gap-2">
                <input
                  className="border px-3 py-2"
                  placeholder="统一链接地址（所有语言使用同一链接）"
                  value={it.linkZh || it.linkEn || ''}
                  onChange={e => setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, linkZh: e.target.value, linkEn: e.target.value } : p))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input className="flex-1 border px-3 py-2" placeholder="图片URL，如 /news-pics/xxx.jpg 或 https://..." value={it.coverImage} onChange={e => setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, coverImage: e.target.value } : p))} />
                <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const ext = (file.name.split('.').pop() || 'jpg').toLowerCase(); const dateStr = (it.date || new Date().toISOString().slice(0,10)).replace(/-/g, ''); const fname = `${dateStr}_new_${idx + 1}.${ext}`; const url = await uploadImageToServer(file, fname); setNewItems(prev => prev.map(p => p.id === it.id ? { ...p, coverImage: url } : p)); }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

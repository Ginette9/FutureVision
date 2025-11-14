import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../contexts/authContext';
import AdminNews from './AdminNews';
import { MustReadItem, replaceMustReads, getAllMustReads, updateMustRead, deleteMustRead } from '../data/mustReads';
import { CourseResourceItem, replaceCourses, getAllCourses, updateCourse, deleteCourse } from '../data/courseResources';

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
  const payload = { filename: overrideName || file.name, contentBase64: dataUrl, folder: 'knowledge-pics' } as any;
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
  } catch {}
  return '';
}

function parseDateEnFromText(text: string): string {
  try {
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

function parseMustReadTsv(input: string): Omit<MustReadItem, 'id' | 'coverImage' | 'date'>[] {
  const trimBackticks = (s: string) => s.replace(/^`+|`+$/g, '').trim();
  const lines = input.split(/\r?\n/);
  const items: Omit<MustReadItem, 'id' | 'coverImage' | 'date'>[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(/\t+/).map(p => p.trim());
    if (parts.length < 3) continue;
    const [titleZh, summaryZh, maybeLink] = parts;
    const link = maybeLink ? trimBackticks(maybeLink) : '';
    items.push({ titleZh, titleEn: '', summaryZh, summaryEn: '', linkZh: link, linkEn: link });
  }
  return items;
}
function parseMustReadFreeText(input: string): Omit<MustReadItem, 'id' | 'coverImage' | 'date'>[] {
  const lines = input.split(/\r?\n/).map(s => s.trim());
  const isZh = (s: string) => /[\u4e00-\u9fff]/.test(s);
  const isEn = (s: string) => /[A-Za-z]/.test(s) && !isZh(s);
  const isLink = (s: string) => {
    const t = s.trim();
    return /^`?https?:\/\/\S+`?$/.test(t) || /^<https?:\/\/\S+>$/.test(t);
  };
  const items: Omit<MustReadItem, 'id' | 'coverImage' | 'date'>[] = [];
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && !lines[i]) i++;
    if (i >= lines.length) break;
    const titleZh = lines[i++] || '';
    let titleEn = '';
    if (i < lines.length && isEn(lines[i])) titleEn = lines[i++] || '';
    const summaryZhChunks: string[] = [];
    while (i < lines.length && lines[i] && !isEn(lines[i]) && !isLink(lines[i])) {
      summaryZhChunks.push(lines[i++]);
    }
    const summaryEnChunks: string[] = [];
    while (i < lines.length && lines[i] && isEn(lines[i]) && !isLink(lines[i])) {
      summaryEnChunks.push(lines[i++]);
    }
    let link = '';
    if (i < lines.length && isLink(lines[i])) {
      const raw = lines[i++].trim();
      const m = raw.match(/https?:\/\/\S+/);
      link = m ? m[0] : raw.replace(/^`+|`+$/g, '').trim();
    }
    items.push({ titleZh, titleEn, summaryZh: summaryZhChunks.join('\n'), summaryEn: summaryEnChunks.join('\n'), linkZh: link, linkEn: link });
  }
  return items;
}

function parseCourseTsv(input: string): Omit<CourseResourceItem, 'id' | 'coverImage' | 'date'>[] {
  const trimBackticks = (s: string) => s.replace(/^`+|`+$/g, '').trim();
  const lines = input.split(/\r?\n/);
  const items: Omit<CourseResourceItem, 'id' | 'coverImage' | 'date'>[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(/\t+/).map(p => p.trim());
    if (parts.length < 3) continue;
    const [titleZh, summaryZh, maybeLink] = parts;
    const link = maybeLink ? trimBackticks(maybeLink) : '';
    items.push({ titleZh, titleEn: '', summaryZh, summaryEn: '', linkZh: link, linkEn: link });
  }
  return items;
}
function parseCourseFreeText(input: string): Omit<CourseResourceItem, 'id' | 'coverImage' | 'date'>[] {
  const lines = input.split(/\r?\n/).map(s => s.trim());
  const isZh = (s: string) => /[\u4e00-\u9fff]/.test(s);
  const isEn = (s: string) => /[A-Za-z]/.test(s) && !isZh(s);
  const isLink = (s: string) => {
    const t = s.trim();
    return /^`?https?:\/\/\S+`?$/.test(t) || /^<https?:\/\/\S+>$/.test(t);
  };
  const items: Omit<CourseResourceItem, 'id' | 'coverImage' | 'date'>[] = [];
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && !lines[i]) i++;
    if (i >= lines.length) break;
    const titleZh = lines[i++] || '';
    let titleEn = '';
    if (i < lines.length && isEn(lines[i])) titleEn = lines[i++] || '';
    const summaryZhChunks: string[] = [];
    while (i < lines.length && lines[i] && !isEn(lines[i]) && !isLink(lines[i])) {
      summaryZhChunks.push(lines[i++]);
    }
    const summaryEnChunks: string[] = [];
    while (i < lines.length && lines[i] && isEn(lines[i]) && !isLink(lines[i])) {
      summaryEnChunks.push(lines[i++]);
    }
    let link = '';
    if (i < lines.length && isLink(lines[i])) {
      const raw = lines[i++].trim();
      const m = raw.match(/https?:\/\/\S+/);
      link = m ? m[0] : raw.replace(/^`+|`+$/g, '').trim();
    }
    items.push({ titleZh, titleEn, summaryZh: summaryZhChunks.join('\n'), summaryEn: summaryEnChunks.join('\n'), linkZh: link, linkEn: link });
  }
  return items;
}

export default function AdminKnowledge() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'news' | 'must' | 'course'>('news');

  const [existingMust, setExistingMust] = useState<MustReadItem[]>([]);
  const [existingCourse, setExistingCourse] = useState<CourseResourceItem[]>([]);
  const [mustItems, setMustItems] = useState<MustReadItem[]>([]);
  const [courseItems, setCourseItems] = useState<CourseResourceItem[]>([]);
  const [mustFreeText, setMustFreeText] = useState('');
  const [mustTsv, setMustTsv] = useState('');
  const [courseFreeText, setCourseFreeText] = useState('');
  const [courseTsv, setCourseTsv] = useState('');
  const [mustCoverInputs, setMustCoverInputs] = useState<Record<number, ImageInput>>({});
  const [courseCoverInputs, setCourseCoverInputs] = useState<Record<number, ImageInput>>({});
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    setExistingMust([...getAllMustReads()]);
    setExistingCourse([...getAllCourses()]);
    const onMust = () => setExistingMust([...getAllMustReads()]);
    const onCourse = () => setExistingCourse([...getAllCourses()]);
    window.addEventListener('must-read-updated', onMust);
    window.addEventListener('course-updated', onCourse);
    return () => {
      window.removeEventListener('must-read-updated', onMust);
      window.removeEventListener('course-updated', onCourse);
    };
  }, []);

  const handleLogin = (code: string) => {
    if (code && code.trim().length > 0) {
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

  const handleParseMust = async () => {
    const parsed = [
      ...parseMustReadTsv(mustTsv),
      ...parseMustReadFreeText(mustFreeText)
    ];
    const result: MustReadItem[] = parsed.map((t, idx) => {
      const input = mustCoverInputs[idx];
      let coverUrl = mustItems[idx]?.coverImage || '';
      if (input?.type === 'url') coverUrl = input.value || coverUrl;
      const parsedDate = parseDateFromText(t.summaryZh || '') || parseDateEnFromText(t.summaryEn || '');
      return {
        id: `must-${Date.now()}-${idx}`,
        coverImage: coverUrl,
        titleZh: t.titleZh || '',
        titleEn: t.titleEn || '',
        summaryZh: t.summaryZh || '',
        summaryEn: t.summaryEn || '',
        linkZh: t.linkZh || t.linkEn || '',
        linkEn: t.linkZh || t.linkEn || '',
        date: parsedDate || today
      };
    });
    setMustItems(result);
  };

  const handleParseCourse = async () => {
    const parsed = [
      ...parseCourseTsv(courseTsv),
      ...parseCourseFreeText(courseFreeText)
    ];
    const result: CourseResourceItem[] = parsed.map((t, idx) => {
      const input = courseCoverInputs[idx];
      let coverUrl = courseItems[idx]?.coverImage || '';
      if (input?.type === 'url') coverUrl = input.value || coverUrl;
      const parsedDate = parseDateFromText(t.summaryZh || '') || parseDateEnFromText(t.summaryEn || '');
      return {
        id: `course-${Date.now()}-${idx}`,
        coverImage: coverUrl,
        titleZh: t.titleZh || '',
        titleEn: t.titleEn || '',
        summaryZh: t.summaryZh || '',
        summaryEn: t.summaryEn || '',
        linkZh: t.linkZh || t.linkEn || '',
        linkEn: t.linkZh || t.linkEn || '',
        date: parsedDate || today
      };
    });
    setCourseItems(result);
  };

  const handleSaveMust = () => { replaceMustReads([...existingMust, ...mustItems]); setMustItems([]); };
  const handleSaveCourse = () => { replaceCourses([...existingCourse, ...courseItems]); setCourseItems([]); };

  const exportMustJson = () => {
    const blob = new Blob([JSON.stringify(getAllMustReads(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'must-reads.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMustJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result));
        if (Array.isArray(arr)) {
          replaceMustReads(arr as MustReadItem[]);
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  const exportCourseJson = () => {
    const blob = new Blob([JSON.stringify(getAllCourses(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCourseJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result));
        if (Array.isArray(arr)) {
          replaceCourses(arr as CourseResourceItem[]);
        }
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
    <div className="max-w-6xl mx-auto pt-24 pb-16 px-4">
      <h2 className="text-3xl font-semibold mb-6">知识中心管理</h2>
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 border ${activeTab==='news'?'bg-gray-900 text-white':'bg-white'}`} onClick={() => setActiveTab('news')}>全球要闻</button>
        <button className={`px-4 py-2 border ${activeTab==='must'?'bg-gray-900 text-white':'bg-white'}`} onClick={() => setActiveTab('must')}>必读报告</button>
        <button className={`px-4 py-2 border ${activeTab==='course'?'bg-gray-900 text-white':'bg-white'}`} onClick={() => setActiveTab('course')}>课程资源</button>
      </div>

      {activeTab === 'news' ? (
        <AdminNews />
      ) : (
        <div className="space-y-6">
          {activeTab === 'must' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">批量上传 · 必读报告</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea className="w-full border px-3 py-2 h-48" placeholder="自由文本：\n中文标题\n英文标题（可选）\n中文摘要（多行）\n英文摘要（可选，多行）\n`链接`" value={mustFreeText} onChange={e => setMustFreeText(e.target.value)} />
                <textarea className="w-full border px-3 py-2 h-48" placeholder="TSV：中文标题\t中文摘要\t`链接` 每条一行" value={mustTsv} onChange={e => setMustTsv(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0,1,2,3,4].map(idx => (
                  <div key={idx} className="border p-4 space-y-2">
                    <div className="flex gap-2">
                      <select className="border px-2 py-1" value={mustCoverInputs[idx]?.type || 'url'} onChange={e => setMustCoverInputs(s => ({ ...s, [idx]: { type: e.target.value as any, value: '' } }))}>
                        <option value="url">配图URL</option>
                        <option value="file">本地上传</option>
                      </select>
                      {mustCoverInputs[idx]?.type === 'url' ? (
                        <input className="flex-1 border px-2 py-1" placeholder="https://..." value={mustCoverInputs[idx]?.value || ''} onChange={e => { const val = e.target.value; setMustCoverInputs(s => ({ ...s, [idx]: { type: 'url', value: val } })); setMustItems(prev => prev.map((p, i) => i === idx ? { ...p, coverImage: val } : p)); }} />
                      ) : (
                        <input id={`must-cover-file-${idx}`} type="file" accept="image/*" className="flex-1" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const ext = (file.name.split('.').pop() || 'jpg').toLowerCase(); const dateStr = (mustItems[idx]?.date || today).replace(/-/g, ''); const fname = `${dateStr}_must_${idx + 1}.${ext}`; const url = await uploadImageToServer(file, fname); setMustItems(prev => prev.map((p, i) => i === idx ? { ...p, coverImage: url } : p)); }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-indigo-600 text-white" onClick={handleParseMust}>解析并预览</button>
                <button className="px-4 py-2 bg-gray-900 text-white" onClick={handleSaveMust}>保存</button>
                <label className="px-4 py-2 bg-gray-100 text-gray-700 cursor-pointer">
                  导入JSON
                  <input type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importMustJson(f); }} />
                </label>
                <button className="px-4 py-2 bg-gray-100 text-gray-700" onClick={exportMustJson}>导出JSON</button>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer select-none text-sm text-gray-600">已保存内容（点击展开进行编辑）</summary>
                <div className="mt-4 space-y-6">
                {existingMust.map((it, idx) => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {(() => {
                      const s = it.coverImage || '';
                      const cover = s.startsWith('/uploads/') ? `http://localhost:3001${s}` : s;
                      return <img src={cover} alt={it.titleZh} className="w-full h-auto rounded" />;
                    })()}
                    <div className="space-y-2">
                      <input className="w-full border px-3 py-2" defaultValue={it.titleZh} onBlur={e => updateMustRead(it.id, { titleZh: e.currentTarget.value })} />
                      <input className="w-full border px-3 py-2" defaultValue={it.titleEn} onBlur={e => updateMustRead(it.id, { titleEn: e.currentTarget.value })} />
                      <textarea className="w-full border px-3 py-2 h-24" defaultValue={it.summaryZh} onBlur={e => updateMustRead(it.id, { summaryZh: e.currentTarget.value })} />
                      <textarea className="w-full border px-3 py-2 h-24" defaultValue={it.summaryEn} onBlur={e => updateMustRead(it.id, { summaryEn: e.currentTarget.value })} />
                      <input className="border px-3 py-2 w-full" placeholder="统一链接地址" defaultValue={it.linkZh || it.linkEn || ''} onBlur={e => updateMustRead(it.id, { linkZh: e.currentTarget.value, linkEn: e.currentTarget.value })} />
                      <div className="flex items-center gap-2">
                        <input className="flex-1 border px-3 py-2" placeholder="图片URL，如 /news-pics/xxx.jpg 或 https://..." defaultValue={it.coverImage} onBlur={e => updateMustRead(it.id, { coverImage: e.currentTarget.value })} />
                        <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const ext = (file.name.split('.').pop() || 'jpg').toLowerCase(); const dateStr = (it.date || new Date().toISOString().slice(0,10)).replace(/-/g, ''); const fname = `${dateStr}_must_saved_${idx + 1}.${ext}`; const url = await uploadImageToServer(file, fname); updateMustRead(it.id, { coverImage: url }); }} />
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border" onClick={() => deleteMustRead(it.id)}>删除</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <button className="px-4 py-2 bg-indigo-600 text-white" onClick={() => replaceMustReads([...existingMust])}>保存更改</button>
                </div>
                </div>
              </details>
              <div className="mt-8 space-y-8">
                {mustItems.map(it => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <img src={it.coverImage} alt={it.titleZh} className="w-full h-auto rounded" />
                    <div className="space-y-2">
                      <input className="w-full border px-3 py-2" value={it.titleZh} onChange={e => setMustItems(prev => prev.map(p => p.id === it.id ? { ...p, titleZh: e.target.value } : p))} />
                      <input className="w-full border px-3 py-2" value={it.titleEn} onChange={e => setMustItems(prev => prev.map(p => p.id === it.id ? { ...p, titleEn: e.target.value } : p))} />
                      <textarea className="w-full border px-3 py-2 h-24" value={it.summaryZh} onChange={e => setMustItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryZh: e.target.value } : p))} />
                      <textarea className="w-full border px-3 py-2 h-24" value={it.summaryEn} onChange={e => setMustItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryEn: e.target.value } : p))} />
                      <input className="border px-3 py-2 w-full" placeholder="统一链接地址" value={it.linkZh || it.linkEn || ''} onChange={e => setMustItems(prev => prev.map(p => p.id === it.id ? { ...p, linkZh: e.target.value, linkEn: e.target.value } : p))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'course' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">批量上传 · 课程资源</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea className="w-full border px-3 py-2 h-48" placeholder="自由文本：\n中文标题\n英文标题（可选）\n中文摘要（多行）\n英文摘要（可选，多行）\n`链接`" value={courseFreeText} onChange={e => setCourseFreeText(e.target.value)} />
                <textarea className="w-full border px-3 py-2 h-48" placeholder="TSV：中文标题\t中文摘要\t`链接` 每条一行" value={courseTsv} onChange={e => setCourseTsv(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0,1,2,3,4].map(idx => (
                  <div key={idx} className="border p-4 space-y-2">
                    <div className="flex gap-2">
                      <select className="border px-2 py-1" value={courseCoverInputs[idx]?.type || 'url'} onChange={e => setCourseCoverInputs(s => ({ ...s, [idx]: { type: e.target.value as any, value: '' } }))}>
                        <option value="url">配图URL</option>
                        <option value="file">本地上传</option>
                      </select>
                      {courseCoverInputs[idx]?.type === 'url' ? (
                        <input className="flex-1 border px-2 py-1" placeholder="https://..." value={courseCoverInputs[idx]?.value || ''} onChange={e => { const val = e.target.value; setCourseCoverInputs(s => ({ ...s, [idx]: { type: 'url', value: val } })); setCourseItems(prev => prev.map((p, i) => i === idx ? { ...p, coverImage: val } : p)); }} />
                      ) : (
                        <input id={`course-cover-file-${idx}`} type="file" accept="image/*" className="flex-1" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const ext = (file.name.split('.').pop() || 'jpg').toLowerCase(); const dateStr = (courseItems[idx]?.date || today).replace(/-/g, ''); const fname = `${dateStr}_course_${idx + 1}.${ext}`; const url = await uploadImageToServer(file, fname); setCourseItems(prev => prev.map((p, i) => i === idx ? { ...p, coverImage: url } : p)); }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-indigo-600 text-white" onClick={handleParseCourse}>解析并预览</button>
                <button className="px-4 py-2 bg-gray-900 text-white" onClick={handleSaveCourse}>保存</button>
                <label className="px-4 py-2 bg-gray-100 text-gray-700 cursor-pointer">
                  导入JSON
                  <input type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importCourseJson(f); }} />
                </label>
                <button className="px-4 py-2 bg-gray-100 text-gray-700" onClick={exportCourseJson}>导出JSON</button>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer select-none text-sm text-gray-600">已保存内容（点击展开进行编辑）</summary>
                <div className="mt-4 space-y-6">
                {existingCourse.map((it, idx) => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {(() => {
                      const s = it.coverImage || '';
                      const cover = s.startsWith('/uploads/') ? `http://localhost:3001${s}` : s;
                      return <img src={cover} alt={it.titleZh} className="w-full h-auto rounded" />;
                    })()}
                    <div className="space-y-2">
                      <input className="w-full border px-3 py-2" defaultValue={it.titleZh} onBlur={e => updateCourse(it.id, { titleZh: e.currentTarget.value })} />
                      <input className="w-full border px-3 py-2" defaultValue={it.titleEn} onBlur={e => updateCourse(it.id, { titleEn: e.currentTarget.value })} />
                      <textarea className="w-full border px-3 py-2 h-24" defaultValue={it.summaryZh} onBlur={e => updateCourse(it.id, { summaryZh: e.currentTarget.value })} />
                      <textarea className="w-full border px-3 py-2 h-24" defaultValue={it.summaryEn} onBlur={e => updateCourse(it.id, { summaryEn: e.currentTarget.value })} />
                      <input className="border px-3 py-2 w-full" placeholder="统一链接地址" defaultValue={it.linkZh || it.linkEn || ''} onBlur={e => updateCourse(it.id, { linkZh: e.currentTarget.value, linkEn: e.currentTarget.value })} />
                      <div className="flex items-center gap-2">
                        <input className="flex-1 border px-3 py-2" placeholder="图片URL，如 /news-pics/xxx.jpg 或 https://..." defaultValue={it.coverImage} onBlur={e => updateCourse(it.id, { coverImage: e.currentTarget.value })} />
                        <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const ext = (file.name.split('.').pop() || 'jpg').toLowerCase(); const dateStr = (it.date || new Date().toISOString().slice(0,10)).replace(/-/g, ''); const fname = `${dateStr}_course_saved_${idx + 1}.${ext}`; const url = await uploadImageToServer(file, fname); updateCourse(it.id, { coverImage: url }); }} />
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border" onClick={() => deleteCourse(it.id)}>删除</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <button className="px-4 py-2 bg-indigo-600 text-white" onClick={() => replaceCourses([...existingCourse])}>保存更改</button>
                </div>
                </div>
              </details>
              <div className="mt-8 space-y-8">
                {courseItems.map(it => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <img src={it.coverImage} alt={it.titleZh} className="w-full h-auto rounded" />
                    <div className="space-y-2">
                      <input className="w-full border px-3 py-2" value={it.titleZh} onChange={e => setCourseItems(prev => prev.map(p => p.id === it.id ? { ...p, titleZh: e.target.value } : p))} />
                      <input className="w-full border px-3 py-2" value={it.titleEn} onChange={e => setCourseItems(prev => prev.map(p => p.id === it.id ? { ...p, titleEn: e.target.value } : p))} />
                      <textarea className="w-full border px-3 py-2 h-24" value={it.summaryZh} onChange={e => setCourseItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryZh: e.target.value } : p))} />
                      <textarea className="w-full border px-3 py-2 h-24" value={it.summaryEn} onChange={e => setCourseItems(prev => prev.map(p => p.id === it.id ? { ...p, summaryEn: e.target.value } : p))} />
                      <input className="border px-3 py-2 w-full" placeholder="统一链接地址" value={it.linkZh || it.linkEn || ''} onChange={e => setCourseItems(prev => prev.map(p => p.id === it.id ? { ...p, linkZh: e.target.value, linkEn: e.target.value } : p))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/contexts/authContext';
import {
  InsightReport,
  getAllInsightReports,
  addInsightReport,
  updateInsightReport,
  deleteInsightReport
} from '@/data/insightReports';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl as any;

type EditMode = { id?: string } | null;

type ImageInput = { type: 'url' | 'file'; value: string };
type PdfInput = { type: 'url' | 'file'; value: string };

function genId(): string {
  return 'ins_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 降采样并压缩图片到 16:9（最大宽度1280），降低localStorage占用
async function optimizeImageDataUrl(src: string, targetWidth = 1280): Promise<string> {
  try {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
    if (!loaded || !img.width || !img.height) return src;
    const aspectTarget = 16 / 9;
    const origAspect = img.width / img.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return src;
    const w = targetWidth;
    const h = Math.round(targetWidth / aspectTarget);
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    let drawW = w, drawH = Math.round(w / origAspect);
    if (drawH > h) {
      drawH = h;
      drawW = Math.round(h * origAspect);
    }
    const dx = Math.round((w - drawW) / 2);
    const dy = Math.round((h - drawH) / 2);
    ctx.drawImage(img, dx, dy, drawW, drawH);
    const out = canvas.toDataURL('image/jpeg', 0.85);
    return out || src;
  } catch {
    return src;
  }
}

// 已移除“阅读时长”，不再计算或存储

// 解析结构化文本（中文/英文标题 + 字段标签）
function parseStructuredText(input: string) {
  const lines = input.split(/\r?\n/).map(l => l.trim());
  const nonEmpty = lines.filter(l => l.length > 0);
  const result: Partial<InsightReport & { titleEn?: string }> = {};

  // 标题（首行中文，次行英文（若存在））
  if (nonEmpty.length > 0) {
    result.title = nonEmpty[0];
  }
  if (nonEmpty.length > 1 && /[A-Za-z]/.test(nonEmpty[1])) {
    (result as any).titleEn = nonEmpty[1];
  }

  const labelSet = new Set(['行业', '议题', '来源', '发布年份', '页数', '摘要']);
  const getLabel = (line: string) => {
    const m = line.match(/^(行业|议题|来源|发布年份|页数|摘要)[：:]?$/);
    return m ? m[1] : null;
  };

  let i = 0;
  // 跳过前两行标题
  while (i < lines.length && lines[i].trim().length === 0) i++;
  if (i < lines.length) i++;
  if (i < lines.length && /[A-Za-z]/.test(lines[i])) i++;

  while (i < lines.length) {
    const label = getLabel(lines[i]);
    if (!label) { i++; continue; }
    i++;
    // 收集到下一个标签之前的所有行（保留空行，以便区分段落）
    const rawLines: string[] = [];
    while (i < lines.length && !getLabel(lines[i])) {
      rawLines.push(lines[i]);
      i++;
    }
    const rawText = rawLines.join('\n');
    const valText = rawLines.filter(l => l.trim().length > 0).join('\n').trim();
    switch (label) {
      case '行业': result.industry = valText || '泛行业'; break;
      case '议题': result.topic = valText || 'ESG'; break;
      case '来源': result.source = valText || 'MSC独家发布'; break;
      case '发布年份': {
        const y = parseInt(valText, 10);
        if (!isNaN(y)) result.date = `${y}-01-01`;
        break;
      }
      case '页数': {
        const p = parseInt(valText, 10);
        if (!isNaN(p)) result.pages = p;
        break;
      }
      case '摘要': {
        // 保留分段：用空行作为段落分隔（两个及以上换行）
        const paragraphs = rawText
          .split(/\n{2,}/)
          .map(p => p.trim())
          .filter(Boolean);
        if (paragraphs.length > 0) {
          result.summary = paragraphs[0];
          (result as any).detailedSummary = paragraphs.join('\n\n');
        } else {
          result.summary = valText;
          (result as any).detailedSummary = valText;
        }
        break;
      }
    }
  }

  // 默认值兜底
  if (!result.industry) result.industry = '泛行业';
  if (!result.topic) result.topic = 'ESG';
  if (!result.date) result.date = new Date().toISOString().slice(0, 10);
  if (!result.pages) result.pages = 1;
  if (!result.summary) result.summary = '';
  if (!(result as any).detailedSummary && result.summary) {
    (result as any).detailedSummary = result.summary;
  }
  (result as any).category = '独家洞察';
  (result as any).tableOfContents = [];
  (result as any).isPurchasable = true;
  if (!result.source) result.source = 'MSC独家发布';

  return result;
}

export default function AdminInsights() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [reports, setReports] = useState<InsightReport[]>([]);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [structuredText, setStructuredText] = useState('');
  const [coverInput, setCoverInput] = useState<ImageInput>({ type: 'url', value: '' });
  const [tocInput, setTocInput] = useState<ImageInput>({ type: 'url', value: '' });
  const [pdfInput, setPdfInput] = useState<PdfInput>({ type: 'url', value: '' });
  const [coverPage, setCoverPage] = useState<number>(1);
  const [tocPagesText, setTocPagesText] = useState<string>('');
  const [generatingCover, setGeneratingCover] = useState<boolean>(false);
  const [generatingToc, setGeneratingToc] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [draggingCover, setDraggingCover] = useState<boolean>(false);

  const setCoverCropY = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    setForm(f => ({ ...f, coverCropY: clamped }));
    if (editMode?.id) {
      updateInsightReport(editMode.id, { coverCropY: clamped });
      setReports(getAllInsightReports());
    }
  };

  const handleCoverDragStart = (e: any) => {
    setDraggingCover(true);
    handleCoverDrag(e);
  };
  const handleCoverDrag = (e: any) => {
    if (!draggingCover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = (y / rect.height) * 100;
    setCoverCropY(pct);
  };
  const handleCoverDragEnd = () => setDraggingCover(false);

  const [form, setForm] = useState<Partial<InsightReport & { titleEn?: string }>>({
    title: '',
    industry: '泛行业',
    topic: 'ESG',
    pages: 1,
    summary: '',
    date: new Date().toISOString().slice(0, 10),
    category: '独家洞察',
    source: 'MSC独家发布',
    coverImage: '',
    tableOfContents: [],
    isPurchasable: true,
    currency: 'CNY',
    pdfUrl: '',
    coverPage: 1,
    tocPages: [],
  });

  useEffect(() => {
    setReports(getAllInsightReports());
  }, []);

  const handleLogin = (code: string) => {
    if (code && code.trim().length > 0) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminLogin', '1');
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('adminLogin') === '1') {
      setIsAuthenticated(true);
    }
  }, [setIsAuthenticated]);

  const resetForm = () => {
    setForm({
      title: '',
      industry: '泛行业',
      topic: 'ESG',
      pages: 1,
      summary: '',
      date: new Date().toISOString().slice(0, 10),
      category: '独家洞察',
      source: 'MSC独家发布',
      coverImage: '',
      tableOfContents: [],
      isPurchasable: true,
      currency: 'CNY',
      pdfUrl: '',
      coverPage: 1,
      tocPages: [],
    });
    setCoverInput({ type: 'url', value: '' });
    setTocInput({ type: 'url', value: '' });
    setPdfInput({ type: 'url', value: '' });
    setCoverPage(1);
    setTocPagesText('');
    setStructuredText('');
    setEditMode(null);
  };

  const handleParse = () => {
    const parsed = parseStructuredText(structuredText);
    setForm(prev => ({ ...prev, ...parsed }));
  };

  const handleCoverFile = async (file: File) => {
    const raw = await fileToDataUrl(file);
    const optimized = await optimizeImageDataUrl(raw);
    setCoverInput({ type: 'file', value: optimized });
    setForm(f => ({ ...f, coverImage: optimized }));
  };

  const handleTocFile = async (file: File) => {
    const raw = await fileToDataUrl(file);
    const optimized = await optimizeImageDataUrl(raw);
    setTocInput({ type: 'file', value: optimized });
    (setForm as any)((f: any) => ({ ...f, tocImageUrl: optimized }));
  };

  // 已移除示例页面图片上传：统一通过PDF在线查看

  const parsePagesQuick = (text: string): number[] => {
    const tokens = text.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean);
    const pages: number[] = [];
    for (const tok of tokens) {
      const m = tok.match(/^(\d+)\s*[-—–－]\s*(\d+)$/);
      if (m) {
        const start = parseInt(m[1], 10);
        const end = parseInt(m[2], 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
          for (let p = start; p <= end; p++) pages.push(p);
        }
        continue;
      }
      const n = parseInt(tok, 10);
      if (!isNaN(n) && n > 0) pages.push(n);
    }
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  async function renderPdfPageToDataUrl(src: string, pageNum: number): Promise<string | null> {
    try {
      const pdf = await (getDocument(src as any) as any).promise;
      const page = await pdf.getPage(pageNum);
      // 提升渲染清晰度：按设备像素比放大
      const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
      const baseScale = 1.0;
      const targetScale = Math.min(3, Math.max(2, dpr * 2)); // 在2~3之间
      const viewport = page.getViewport({ scale: baseScale * targetScale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      // 白色底以避免透明导致的边缘锯齿
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const url = canvas.toDataURL('image/png');
      try { pdf.destroy(); } catch {}
      return url;
    } catch (e) {
      console.warn('Failed to render PDF page:', (e as Error).message);
      return null;
    }
  }

  const handleGenerateCoverFromPdf = async () => {
    const src = pdfInput.value;
    if (!src) return;
    setGeneratingCover(true);
    setStatusMsg('正在从PDF生成封面图…');
    const pageNum = (form.coverPage && form.coverPage > 0 ? form.coverPage : coverPage) || 1;
    const url = await renderPdfPageToDataUrl(src, pageNum);
    if (url) {
      const optimized = await optimizeImageDataUrl(url);
      setForm(f => ({ ...f, coverImage: optimized }));
      // 编辑模式下立即持久化
      if (editMode?.id) {
        updateInsightReport(editMode.id, { coverImage: optimized });
        setReports(getAllInsightReports());
      }
      setStatusMsg('封面图已生成并保存');
    } else {
      setStatusMsg('生成封面图失败，请检查PDF URL与页码');
    }
    setGeneratingCover(false);
  };

  const handleGenerateTocFromPdf = async () => {
    const src = pdfInput.value;
    if (!src) return;
    setGeneratingToc(true);
    setStatusMsg('正在从PDF生成目录图…');
    const pages = (form.tocPages && form.tocPages.length > 0) ? form.tocPages : parsePagesQuick(tocPagesText);
    const pageNum = pages[0] || ((form.coverPage && form.coverPage > 0 ? form.coverPage : coverPage) || 1);
    const url = await renderPdfPageToDataUrl(src, pageNum);
    if (url) {
      const optimized = await optimizeImageDataUrl(url);
      (setForm as any)((f: any) => ({ ...f, tocImageUrl: optimized }));
      if (editMode?.id) {
        updateInsightReport(editMode.id, { tocImageUrl: optimized } as any);
        setReports(getAllInsightReports());
      }
      setStatusMsg('目录图已生成并保存');
    } else {
      setStatusMsg('生成目录图失败，请检查PDF URL与页码');
    }
    setGeneratingToc(false);
  };

  const buildReportObject = (): InsightReport => {
    const id = editMode?.id || genId();
    const coverImage = form.coverImage || coverInput.value || '';
    // 解析页面选择
    const parsePages = (text: string): number[] => {
      const tokens = text.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean);
      const pages: number[] = [];
      for (const tok of tokens) {
        const m = tok.match(/^(\d+)\s*[-—–－]\s*(\d+)$/);
        if (m) {
          const start = parseInt(m[1], 10);
          const end = parseInt(m[2], 10);
          if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
            for (let p = start; p <= end; p++) pages.push(p);
          }
          continue;
        }
        const n = parseInt(tok, 10);
        if (!isNaN(n) && n > 0) pages.push(n);
      }
      return Array.from(new Set(pages)).sort((a, b) => a - b);
    };
    const tocPages = (form.tocPages && form.tocPages.length > 0) ? form.tocPages : parsePages(tocPagesText);
    const coverPg = form.coverPage && form.coverPage > 0 ? form.coverPage : coverPage || 1;
    return {
      id,
      title: form.title || '',
      industry: form.industry || '泛行业',
      topic: form.topic || 'ESG',
      pages: form.pages || 1,
      summary: form.summary || '',
      date: form.date || new Date().toISOString().slice(0,10),
      category: form.category || '独家洞察',
      source: form.source || 'MSC独家发布',
      keywords: [],
      featured: false,
      coverImage,
      coverCropY: form.coverCropY ?? 0,
      tocImageUrl: (form as any).tocImageUrl,
      tableOfContents: form.tableOfContents || [],
      pdfUrl: form.pdfUrl || (pdfInput.type === 'url' ? pdfInput.value : ''),
      coverPage: coverPg,
      tocPages,
      detailedSummary: form.detailedSummary || undefined,
      keyFindings: form.keyFindings || undefined,
      methodology: form.methodology || undefined,
      targetAudience: form.targetAudience || undefined,
      isPurchasable: form.isPurchasable ?? true,
      price: form.price,
      currency: form.currency,
      contactInfo: form.contactInfo,
    };
  };

  const handleSave = () => {
    const report = buildReportObject();
    if (editMode?.id) {
      updateInsightReport(editMode.id, report);
    } else {
      addInsightReport(report);
    }
    setReports(getAllInsightReports());
    resetForm();
  };

  const handleEdit = (id: string) => {
    const r = reports.find(r => r.id === id);
    if (!r) return;
    setEditMode({ id });
    setForm(r as any);
    setCoverInput({ type: 'url', value: r.coverImage });
    setStructuredText('');
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除该报告？')) return;
    deleteInsightReport(id);
    setReports(getAllInsightReports());
    if (editMode?.id === id) resetForm();
  };

  const exportJson = () => {
    const data = JSON.stringify(reports, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insightReports.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result));
        if (Array.isArray(arr)) {
          // 覆盖式导入（存到 localStorage）
          localStorage.setItem('insightReportsStore', JSON.stringify(arr));
          setReports(getAllInsightReports());
        } else {
          alert('JSON 格式错误：需要是报告数组');
        }
      } catch (e) {
        alert('解析失败：' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-4">独家洞察报告 · 内部上传管理</h1>
        <p className="text-gray-600 mb-6">请输入内部访问码以继续。</p>
        <div className="flex gap-3">
          <input
            type="password"
            className="border rounded px-3 py-2 w-64"
            placeholder="访问码"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLogin((e.target as HTMLInputElement).value);
            }}
          />
          <button
            onClick={() => {
              const el = document.querySelector<HTMLInputElement>('input[type=password]');
              handleLogin(el?.value || '');
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            进入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">独家洞察报告 · 上传与管理</h1>
        <div className="flex gap-3">
          <button onClick={exportJson} className="px-3 py-2 border rounded">导出JSON</button>
          <label className="px-3 py-2 border rounded cursor-pointer">
            导入JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
            }} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：填写/解析表单 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">填写报告信息</h2>

          <label className="block mb-3">
            <span className="text-sm text-gray-600">从结构化文本解析</span>
            <textarea
              value={structuredText}
              onChange={(e) => setStructuredText(e.target.value)}
              placeholder="粘贴包含标题、行业、议题、来源、发布年份、页数、摘要的文本"
              className="mt-1 w-full border rounded p-3 h-40"
            />
            <button onClick={handleParse} className="mt-2 px-3 py-1.5 bg-gray-900 text-white rounded">解析填充</button>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600">中文标题</span>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.title || ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">英文标题（可选）</span>
              <input className="mt-1 w-full border rounded px-3 py-2" value={(form as any).titleEn || ''} onChange={e => setForm(f => ({...f, titleEn: e.target.value} as any))} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">行业</span>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.industry || ''} onChange={e => setForm(f => ({...f, industry: e.target.value}))} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">议题</span>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.topic || ''} onChange={e => setForm(f => ({...f, topic: e.target.value}))} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">发布日期</span>
              <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={form.date || ''} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">页数</span>
              <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.pages || 0} onChange={e => setForm(f => ({...f, pages: parseInt(e.target.value || '0', 10)}))} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">来源</span>
              <input className="mt-1 w-full border rounded px-3 py-2" value={form.source || ''} onChange={e => setForm(f => ({...f, source: e.target.value}))} />
            </label>
            <label className="block">
              {/* 已移除阅读时长字段 */}
            </label>
          </div>

          <label className="block mt-4">
            <span className="text-sm text-gray-600">摘要</span>
            <textarea className="mt-1 w-full border rounded p-3 h-28" value={form.summary || ''} onChange={e => setForm(f => ({...f, summary: e.target.value}))} />
          </label>

          <label className="block mt-4">
            <span className="text-sm text-gray-600">详细摘要（支持分段，使用空行分隔）</span>
            <textarea
              className="mt-1 w-full border rounded p-3 h-40"
              placeholder="在此粘贴完整摘要内容；用空行（回车两次）分隔段落"
              value={(form as any).detailedSummary || ''}
              onChange={e => {
                const val = e.target.value;
                setForm(f => ({ ...f, detailedSummary: val } as any));
                if (editMode?.id) {
                  updateInsightReport(editMode.id, { detailedSummary: val } as any);
                  setReports(getAllInsightReports());
                }
              }}
            />
          </label>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">封面图片</h3>
            <div className="flex items-center gap-3 mb-2">
              <input className="flex-1 border rounded px-3 py-2" placeholder="图片URL（支持 /proxy/image?url=...）" value={coverInput.type === 'url' ? coverInput.value : ''} onChange={e => setCoverInput({ type: 'url', value: e.target.value })} />
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleCoverFile(e.target.files[0])} />
            </div>
            {(coverInput.value || form.coverImage) && (
              <div className="relative w-full aspect-video border rounded overflow-hidden bg-gray-100">
                <img
                  src={form.coverImage || coverInput.value}
                  alt="封面预览"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">上传完整PDF（推荐使用URL）</h3>
            <div className="flex items-center gap-3 mb-2">
              <input className="flex-1 border rounded px-3 py-2" placeholder="PDF URL（建议 /reports/xxx.pdf）" value={pdfInput.value} onChange={e => { const val = e.target.value; setPdfInput({ type: 'url', value: val }); setForm(f => ({ ...f, pdfUrl: val })); if (editMode?.id) { updateInsightReport(editMode.id, { pdfUrl: val }); setReports(getAllInsightReports()); } }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <label className="block">
                <span className="text-sm text-gray-600">封面页码（默认第1页）</span>
                <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.coverPage ?? coverPage} onChange={e => { const v = parseInt(e.target.value || '1', 10) || 1; setCoverPage(v); setForm(f => ({ ...f, coverPage: v })); }} />
              </label>
              <label className="block col-span-1">
                <span className="text-sm text-gray-600">目录页码（支持逗号与区间）</span>
                <input className="mt-1 w-full border rounded px-3 py-2" placeholder="示例：2,3 或 2-6" value={tocPagesText} onChange={e => setTocPagesText(e.target.value)} />
              </label>
              {/* 已移除示例页码输入：PDF已可在线查看 */}
            </div>
            <div className="mt-3 flex gap-3 items-center">
              <button type="button" className="px-3 py-2 border rounded disabled:opacity-50" disabled={generatingCover} onClick={handleGenerateCoverFromPdf}>{generatingCover ? '生成中…' : '从PDF生成封面图'}</button>
              <button type="button" className="px-3 py-2 border rounded disabled:opacity-50" disabled={generatingToc} onClick={handleGenerateTocFromPdf}>{generatingToc ? '生成中…' : '从PDF生成目录图'}</button>
              {statusMsg && <span className="text-xs text-gray-600">{statusMsg}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-2">推荐使用相对路径，如 <code>/reports/xxx.pdf</code>。将PDF放置到 <code>/public/reports/</code> 后，这里的URL将被永久保存。</p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">目录截图（可选）</h3>
            <div className="flex items-center gap-3 mb-2">
              <input className="flex-1 border rounded px-3 py-2" placeholder="图片URL" value={tocInput.type === 'url' ? tocInput.value : ''} onChange={e => setTocInput({ type: 'url', value: e.target.value })} />
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleTocFile(e.target.files[0])} />
            </div>
          </div>

          {/* 移除示例页面图片上传：页面统一通过PDF在线查看，不再需要样例截图 */}

          <div className="mt-6 flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded">{editMode ? '保存修改' : '保存新增'}</button>
            <button onClick={resetForm} className="px-4 py-2 border rounded">重置</button>
          </div>
        </div>

        {/* 右侧：已上传报告列表 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">已上传的报告（{reports.length}）</h2>
          {reports.length === 0 ? (
            <div className="text-gray-500">暂无数据</div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="flex items-center gap-4 p-3 border rounded">
            <img src={r.coverImage} alt="封面" className="w-16 h-16 object-cover rounded" style={{ objectPosition: `50% ${Math.round(r.coverCropY ?? 0)}%` }} />
                  <div className="flex-1">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-sm text-gray-500">{r.industry} · {r.topic} · {r.pages}页 · {r.source || 'MSC独家发布'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border rounded" onClick={() => handleEdit(r.id)}>编辑</button>
                    <button className="px-3 py-1.5 border rounded text-red-600" onClick={() => handleDelete(r.id)}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
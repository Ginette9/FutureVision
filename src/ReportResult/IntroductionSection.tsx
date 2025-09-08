import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  productNames: string[];
  countryNames: string[];
  pdfLink: string;
  introHtml?: string;
}

type PdfConfig = {
  cover?: {
    title?: string;
    subtitle?: string;
    clientName?: string;
    dateText?: string;
    extraNote?: string;
  };
  back?: {
    headline?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    qrImageUrl?: string;
    qrCaption?: string;
    copyrightOwner?: string;
  };
};

declare global {
  interface Window { __fvPdfConfig?: PdfConfig; }
}

export const IntroductionSection: React.FC<Props> = ({
  productNames,
  countryNames,
  pdfLink,
  introHtml,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const intro_prose = useMemo(() => {
    if (typeof window === 'undefined' || !introHtml) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(introHtml, 'text/html');
    const h2 = doc.querySelector('div > h2');
    if (h2?.parentElement) h2.parentElement.remove();
    return doc.body.innerHTML.trim();
  }, [introHtml]);

  const filename = useMemo(() => {
    const prods = productNames?.length ? productNames.join('_') : 'products';
    const countries = countryNames?.length ? countryNames.join('_') : 'countries';
    return `ESG_Risk_Results__${prods}__${countries}.pdf`.replace(/\s+/g, '-');
  }, [productNames, countryNames]);

  // 读取全局配置（若未设置则用默认）
  const cfg = (typeof window !== 'undefined' ? window.__fvPdfConfig : undefined) || {};
  const coverCfg = cfg.cover || {};
  const backCfg  = cfg.back  || {};

  const handlePrintFullPage = useCallback(() => {
    const hasPaid = typeof window !== 'undefined' && window.localStorage.getItem('hasPaid') === '1';
    if (!hasPaid) {
      const search = new URLSearchParams({ from: location.pathname }).toString();
      navigate(`/pay?${search}`);
      return;
    }
    const htmlEl = document.documentElement;
    htmlEl.classList.add('print-mode');

    const cleanup = () => {
      htmlEl.classList.remove('print-mode');
      window.removeEventListener('afterprint', onAfterPrint);
    };
    const onAfterPrint = () => cleanup();

    window.addEventListener('afterprint', onAfterPrint);
    window.print();
  }, [navigate, location.pathname]);

  // —— 打印专用：封面组件（仅在打印时显示） ——
  const PrintCover = () => (
    <div className="print-only print-page cover-page relative">
      <div>
        <div className="cover-title">{coverCfg.title || 'ESG Risk Report'}</div>
        {coverCfg.subtitle && <div className="cover-sub">{coverCfg.subtitle}</div>}
        {coverCfg.clientName && <div className="cover-sub">{coverCfg.clientName}</div>}
        <div className="cover-date">{coverCfg.dateText || new Date().toLocaleDateString()}</div>

        <div className="cover-logos">
          {/* 建议：用你站内 logo 路径，或外链都行 */}
          <img src="/src/images/future-vision-logo.png" alt="Future Vision" />
          <img src="/src/images/msc-hk-logo.png" alt="MSC HK" />
        </div>

        {coverCfg.extraNote && <div className="cover-note">{coverCfg.extraNote}</div>}
      </div>
    </div>
  );

  // —— 打印专用：尾页组件（仅在打印时显示） ——
  const PrintBack = () => (
    <div className="print-only print-page back-page relative">
      <div className="back-title">{backCfg.headline || 'Contact Us'}</div>

      {backCfg.email && <div className="back-line">Email: {backCfg.email}</div>}
      {backCfg.phone && <div className="back-line">Phone: {backCfg.phone}</div>}
      {backCfg.website && <div className="back-line">Website: {backCfg.website}</div>}
      {backCfg.address && <div className="back-line">Address: {backCfg.address}</div>}

      {backCfg.qrImageUrl && (
        <div className="back-qr">
          <img src={backCfg.qrImageUrl} alt="Contact QR" />
          <p>{backCfg.qrCaption || 'Scan for more information'}</p>
        </div>
      )}

      <div className="back-copy">© {new Date().getFullYear()} {backCfg.copyrightOwner || 'GlobalRisk'}. All rights reserved.</div>
    </div>
  );

  return (
    <section id="introduction" className="space-y-8">
      {/* —— 正文 —— */}
      <div ref={sectionRef}>
        <div className="grid grid-cols-1 pb-20 pt-6 md:grid-cols-2 md:flex-row">
          {/* Return Button（打印/导出时隐藏） */}
          <div className="col-span-1 md:col-span-2">
            <button
              onClick={() => window.history.back()}
              className="no-print-only mb-8 flex cursor-pointer items-center justify-center rounded py-2 text-sm font-semibold uppercase text-violet-800 transition-colors hover:border-purple-900 hover:text-purple-900"
            >
              <span className="mr-4 mt-1">
                {/* icon */}
                <svg width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0)">
                    <path d="M6.5 12 1 6.5m0 0L6.5 1M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <path fill="#fff" d="M13 13H0V0h13z" />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <span>Return to Form</span>
            </button>
          </div>

          {/* Title */}
          <div className="col-span-1 md:col-span-2">
            <h1 className="mb-10 text-4xl font-black uppercase text-violet-800 lg:text-5xl scale-y-[0.9] tracking-wide print:text-2xl print:tracking-normal">
              Your results
            </h1>
          </div>

          {/* Product */}
          <div className="col-span-1 pb-4 md:pb-0">
            <p className="mb-2 font-bold">Your selected products</p>
            <ul className="list-inside list-disc">
              {productNames.map((name, i) => (
                <li key={i} className="pl-4">{name}</li>
              ))}
            </ul>
          </div>

          {/* Country */}
          <div className="col-span-1 pb-4 md:pb-0">
            <p className="mb-2 font-bold">Your selected countries</p>
            <ul className="list-inside list-disc">
              {countryNames.map((name, i) => (
                <li key={i} className="pl-4">{name}</li>
              ))}
            </ul>
          </div>

          {/* 导出按钮区：左“整页导出（推荐）”，右“仅导出本节（可选）” */}
          <div className="col-span-1 md:col-span-2">
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                onClick={handlePrintFullPage}
                className="no-print-only inline-flex items-center gap-2 rounded-full border border-violet-300 px-3.5 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-50"
              >
                {/* download icon */}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                       strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                  </svg>
                </span>
                <span>Download as PDF</span>
              </button>

              {/* 原外链模板 */}
              <a
                href={pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="no-print-only text-violet-800 underline hover:no-underline"
              >
                Open template PDF
              </a>
            </div>
          </div>
        </div>

        {/* Introduction 内容 */}
        {intro_prose && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-violet-800 tracking-wide print:text-xl print:tracking-normal">
              Introduction
            </h2>
            <div className="prose max-w-none text-[15px] leading-loose" dangerouslySetInnerHTML={{ __html: intro_prose }} />
          </div>
        )}
      </div>

      {/* 打印导出相关样式（保留你现有的） */}
      <style>{`
        @media print { .no-print-only { display: none !important; } }
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          /* 封面与尾页使用命名页面：去掉页边距，获得无白边视觉 */
          @page cover { size: A4 portrait; margin: 0; }
          @page back  { size: A4 portrait; margin: 0; }
          html.print-mode, html.print-mode body {
            background: transparent !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html.print-mode {
            font-size: 13px !important;
          }
          html.print-mode * {
            transform: none !important;
            animation: none !important;
            transition: none !important;
            box-shadow: none !important;
            filter: none !important;
          }
          html.print-mode .fixed,
          html.print-mode .sticky { position: static !important; top: auto !important; inset: auto !important; }
          html.print-mode img, html.print-mode video, html.print-mode svg { max-width: 100% !important; height: auto !important; }
          html.print-mode table { border-collapse: collapse !important; width: 100% !important; }
          html.print-mode th, html.print-mode td { page-break-inside: avoid !important; break-inside: avoid !important; }
          html.print-mode .prose p,
          html.print-mode .prose li,
          html.print-mode .prose h2,
          html.print-mode .prose h3,
          html.print-mode article,
          html.print-mode section {
            break-inside: avoid !important; page-break-inside: avoid !important;
          }
          html.print-mode h1 { font-size: 1.6rem !important; line-height: 1.25 !important; letter-spacing: 0.2px !important; }
          html.print-mode h2 { font-size: 1.25rem !important; line-height: 1.3 !important; }
          html.print-mode h3 { font-size: 1.05rem !important; line-height: 1.35 !important; }
          html.print-mode .prose :where(h1){ font-size: 1.45rem !important; }
          html.print-mode .prose :where(h2){ font-size: 1.2rem !important; }
          html.print-mode .prose :where(h3){ font-size: 1.05rem !important; }
          html.print-mode a { text-decoration: underline !important; color: #000 !important; }
          .pdf-break-before { page-break-before: always !important; }
          .pdf-break-after  { page-break-after: always !important; }
        }

        html.export-pdf {
          font-size: 13px !important;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
          background: transparent !important;
        }
        html.export-pdf * {
          transform: none !important; animation: none !important; transition: none !important;
          box-shadow: none !important; filter: none !important;
        }
        html.export-pdf .fixed, html.export-pdf .sticky { position: static !important; top: auto !important; inset: auto !important; }
        html.export-pdf img, html.export-pdf video, html.export-pdf svg { max-width: 100% !important; height: auto !important; }
        html.export-pdf table { border-collapse: collapse !important; width: 100% !important; }
        html.export-pdf th, html.export-pdf td { page-break-inside: avoid !important; break-inside: avoid !important; }
        html.export-pdf .prose :where(h1){ font-size: 1.45rem !important; }
        html.export-pdf .prose :where(h2){ font-size: 1.2rem !important; }
        html.export-pdf .prose :where(h3){ font-size: 1.05rem !important; }
        .exporting .no-print-only { display: none !important; }
      `}</style>
    </section>
  );
};

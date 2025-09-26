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
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">ESG Risk Analysis Report</h2>
          <p className="text-gray-600 mt-1">Comprehensive risk assessment and recommendations</p>
        </div>
      </div>

      {/* 分析概要卡片 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-light text-gray-900">Industry Focus</h3>
              <p className="text-gray-600 text-sm">Target sectors analyzed</p>
            </div>
          </div>
          <div className="space-y-2">
            {productNames.map((product, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">{product}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-light text-gray-900">Geographic Scope</h3>
              <p className="text-gray-600 text-sm">Markets under review</p>
            </div>
          </div>
          <div className="space-y-2">
            {countryNames.map((country, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">{country}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细介绍内容 */}
      {intro_prose && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-light text-gray-900">Detailed Analysis</h2>
          </div>
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: intro_prose }}
          />
        </div>
      )}

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

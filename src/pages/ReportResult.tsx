import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIGenerationLoader from '@/components/AIGenerationLoader';

import { parseReportHtml, ReportSection } from '../ReportResult/parseReportHtml';
import Toc from '../ReportResult/Toc';
import ReportSectionBlock from '../ReportResult/ReportSection';
import ReportSectionPrint from '../ReportResult/ReportSectionPrint';
import { scrapeUrlContent, buildScrapeUrl } from '@/lib/utils';

import { IntroductionSection } from '../ReportResult/IntroductionSection';
import { PayAttentionSection } from '../ReportResult/PayAttentionSection';
import { CSRSection } from '../ReportResult/CsrSection';
import { CsrLabelsSection } from '../ReportResult/CsrLabelsSection';
import { DueDiligenceSection } from '../ReportResult/DueDiligenceSection';
import { AboutMvoSection } from '../ReportResult/AboutMvoSection';
import { ContactSection } from '../ReportResult/ContactSection';
import { DisclaimerSection } from '../ReportResult/DisclaimerSection';

// 打印封面/尾页所需静态资源（通过打包器处理路径）
import CoverBg from '@/images/bg.jpg';
import LogoFV from '@/images/future-vision-logo.png';
import LogoMSC from '@/images/msc-hk-logo.png';
import QrOfficial from '@/images/official_account_qr.png';
import QrAssistant from '@/images/fv_assistant_qr.png';
import QrMiniApp from '@/images/app-qr.jpg';
import PdfCover from '@/images/pdf-cover.png';
import PdfBack from '@/images/pdf-back.png';

declare global {
  interface Window {
    __fvPdfConfig?: {
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
        qrImageUrl?: string;   // 建议使用构建后可访问的路径或公网 URL
        qrCaption?: string;
        copyrightOwner?: string;
      };
    };
  }
}

/**
 * 使用提醒（可选）：
 * 在任意位置设置 window.__fvPdfConfig 自定义封面/尾页内容
 * window.__fvPdfConfig = {
 *   cover: {
 *     title: "Future Vision · ESG 风险报告",
 *     subtitle: "Selected Products / Countries",
 *     clientName: "Client: Xiamen C&D Group",
 *     dateText: "Generated on 2025-08-22",
 *     extraNote: "Confidential · For internal use only"
 *   },
 *   back: {
 *     headline: "Contact Us",
 *     email: "jinxia@mscfv.com",
 *     phone: "+86 189 8948 5442",
 *     website: "https://mscfv.com/futureVision/",
 *     address: "Rm 2605, Wui Tat Bldg, 3 On Yiu St, Sha Tin, N.T., Hong Kong",
 *     qrImageUrl: "/images/fv_assistant_qr.png",
 *     qrCaption: "Follow us / Contact support",
 *     copyrightOwner: "Future Vision"
 *   }
 * }
 */


const PrintToc: React.FC<{ sections: ReportSection[] }> = ({ sections }) => {
  return (
    <div className="print-only print-page">
      {/* 直接复用你的 Toc 组件；打印时我们给它一整页容器 */}
      <Toc sections={sections} />
    </div>
  );
};


/* ---------------- 主组件：屏幕端 / 打印端布局分流 ---------------- */

export default function ReportResult() {
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem('riskAnalysisData');
    if (!savedData) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);

        const productId = parsed.industry.id;
        const countryId = parsed.country.id;
        const url = buildScrapeUrl(productId, countryId);
        console.log('[report] build url', { productId, countryId, url });

        const rawHtml = await scrapeUrlContent(url);
        console.log('[report] raw html length', rawHtml?.length || 0);
        const parsedSections = parseReportHtml(rawHtml);
        console.log('[report] sections parsed', parsedSections.map(s => ({ id: s.id, title: s.title })).slice(0, 10));
        setSections(parsedSections);
        setDataLoaded(true); // 数据加载完成，但保持加载器显示
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load report content.');
        setDataLoaded(true); // 即使出错也要标记数据加载完成
      }
    };

    fetchData();
  }, [navigate]);

  // 如果数据还没加载完成，显示加载器
  if (!dataLoaded) {
    return <AIGenerationLoader formData={formData} onComplete={() => setIsLoading(false)} />;
  }
  
  // 如果数据加载完成但加载器还在运行，继续显示加载器
  if (isLoading) {
    return <AIGenerationLoader formData={formData} onComplete={() => setIsLoading(false)} />;
  }
  
  // 如果有错误，显示错误信息
  if (errorMsg) return <div className="p-10 text-red-600">{errorMsg}</div>;

  // ✅ 获取各个板块内容
  const introSection = sections.find((s) => s.id === 'introduction');
  const payAttentionSection = sections.find((s) => s.id === 'important-to-consider');
  const csrSection = sections.find((s) => s.id === 'relevant-organizations');
  const csrLabelsSection = sections.find((s) => s.id === 'esg-labels-supply-chain-initiatives-guidelines');
  const dueDiligenceSection = sections.find((s) => s.id === 'due-diligence');
  const aboutMvoSection = sections.find((s) => s.id === 'about-msc-hk');
  const contactSection = sections.find((s) => s.id === 'contact');
  const disclaimerSection = sections.find((s) => s.id === 'disclaimer');
  const riskAnalysisSection = sections.find((s) => s.id === 'risk-analysis');

  return (
    <>
      {/* -------- 打印路线：封面 → 目录 → 正文 → 封底 -------- */}
      {/* 封面 - 第一页 */}
      <div 
        className="print-only print-page cover-page" 
        data-print-page="cover"
        style={{
          position: 'relative',
          margin: '0 !important',
          padding: '0 !important',
          width: '100vw !important',
          height: '100vh !important',
        }}
      >
        <img 
          src={PdfCover} 
          alt="Cover" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      
      </div>
      
      {/* 目录 */}
      <PrintToc sections={sections} />

      {/* 正文（打印时显示打印版组件 / 屏幕时不显示这些打印容器） */}
      <div className="print-only print-page">
        {formData && (
          <section id="introduction" className="space-y-4">
            <IntroductionSection
              productNames={[formData.industry.name]}
              countryNames={[formData.country.name]}
              pdfLink={``}
              introHtml={introSection?.html}
            />
          </section>
        )}

        {payAttentionSection?.html && <PayAttentionSection html={payAttentionSection.html} />}

        {riskAnalysisSection?.categories && (
          <section id="risk-analysis" className="space-y-4">
            <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">{riskAnalysisSection.title}</h2>

            <p className="text-base">
              Below you will find the results of the risk analysis based on your submitted answers.
              Would you like to switch your product or country?{' '}
              <br />
              <a className="text-blue-700 underline hover:no-underline" target="_blank" href="/">
                Fill out the ESG Risk Form again
              </a>
            </p>

            <p className="font-semibold text-black">
              {riskAnalysisSection.categories.reduce(
                (sum, cat) =>
                  sum +
                  cat.themes.reduce(
                    (tSum, theme) => tSum + (theme.riskCount ?? theme.risks.length),
                    0
                  ),
                0
              )}{' '}
              risks found
            </p>

            {/* 打印版 */}
            <ReportSectionPrint categories={riskAnalysisSection.categories} />
          </section>
        )}

        {csrSection?.html && <CSRSection html={csrSection.html} />}
        {csrLabelsSection?.html && <CsrLabelsSection html={csrLabelsSection.html} />}
        {dueDiligenceSection?.html && <DueDiligenceSection />}
        {aboutMvoSection?.html && <AboutMvoSection />}
        {contactSection?.html && <ContactSection />}
        {disclaimerSection?.html && <DisclaimerSection />}
      </div>

      {/* 封底 - 最后一页 */}
      <div 
        className="print-only print-page back-page" 
        data-print-page="back"
        style={{
          position: 'relative',
          margin: '0 !important',
          padding: '0 !important',
          width: '100vw !important',
          height: '100vh !important',
        }}
      >
        <img 
          src={PdfBack} 
          alt="Back Cover" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        {/* 封底内容 */}
      </div>

      {/* -------- 屏幕路线：保持你原有的左 TOC / 右正文布局 -------- */}
      <div className="md:flex gap-10 px-4 md:px-12 py-8 font-sans text-gray-900 no-print-only">
        <aside className="md:w-1/4 mb-6">
          <Toc sections={sections} />
        </aside>

        <main className="md:w-3/4 space-y-16">
          {formData && (
            <section id="introduction" className="space-y-4">
              <IntroductionSection
                productNames={[formData.industry.name]}
                countryNames={[formData.country.name]}
                pdfLink={``}
                introHtml={introSection?.html}
              />
            </section>
          )}

          {payAttentionSection?.html && <PayAttentionSection html={payAttentionSection.html} />}

          {riskAnalysisSection?.categories && (
            <section id="risk-analysis" className="space-y-4">
              <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">{riskAnalysisSection.title}</h2>

              <p className="text-base">
                Below you will find the results of the risk analysis based on your submitted answers.
                Would you like to switch your product or country?{' '}
                <br />
                <a className="text-blue-700 underline hover:no-underline" target="_blank" href="/">
                  Fill out the ESG Risk Form again
                </a>
              </p>

              <p className="font-semibold text-black">
                {riskAnalysisSection.categories.reduce(
                  (sum, cat) =>
                    sum +
                    cat.themes.reduce(
                      (tSum, theme) => tSum + (theme.riskCount ?? theme.risks.length),
                      0
                    ),
                  0
                )}{' '}
                risks found
              </p>

              {/* 屏幕交互版 */}
              <div>
                <ReportSectionBlock categories={riskAnalysisSection.categories} />
              </div>

              {/* 打印版在屏幕端隐藏 */}
              <div className="hidden">
                <ReportSectionPrint categories={riskAnalysisSection.categories} />
              </div>
            </section>
          )}

          {csrSection?.html && <CSRSection html={csrSection.html} />}
          {csrLabelsSection?.html && <CsrLabelsSection html={csrLabelsSection.html} />}
          {dueDiligenceSection?.html && <DueDiligenceSection />}
          {aboutMvoSection?.html && <AboutMvoSection />}
          {contactSection?.html && <ContactSection />}
          {disclaimerSection?.html && <DisclaimerSection />}
        </main>
      </div>
    </>
  );
}

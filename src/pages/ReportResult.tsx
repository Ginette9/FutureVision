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

/* ---------------- 打印专用：封面 / 尾页 / 目录 ---------------- */

const PrintCover: React.FC = () => {
  const cover = (typeof window !== 'undefined' && window.__fvPdfConfig?.cover) || {};
  return (
    <div
      className="print-only print-page relative p-0 overflow-hidden [&_*]:m-0"
      style={{
        width: '210mm',
        height: '297mm',
        breakInside: 'avoid',
        pageBreakBefore: 'always',
        pageBreakAfter: 'always',
      }}
      // 将本页绑定到命名的 @page cover，获得零边距
      data-print-page="cover"
    >
      {/* 背景图：使用 img 以保证打印导出显示 */}
      <img src={CoverBg} alt="Cover background" className="absolute inset-0 w-full h-full object-cover block" />
      {/* 左侧暗色渐变遮罩，保证文字可读性 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />

      {/* 内容区 */}
      <div className="relative z-10 h-full flex items-center">
        <div className="px-12 py-10 max-w-[60%]">
          <div className="space-y-4 text-white">
            <div className="text-[28px] font-black leading-tight tracking-wide uppercase">
              {cover.title || 'ESG Risk Report'}
            </div>
            {cover.subtitle && (
              <div className="text-[16px] font-semibold opacity-95">{cover.subtitle}</div>
            )}
            {cover.clientName && (
              <div className="text-[14px] font-medium opacity-95">{cover.clientName}</div>
            )}
            <div className="pt-2 text-[13px] opacity-90">
              {cover.dateText || new Date().toLocaleDateString()}
            </div>
          </div>

          {/* 底部 Logo 行 */}
          <div className="mt-12 flex items-center gap-8">
            {/* 深色背景下将 logo 反白以统一视觉 */}
            <img src={LogoFV} alt="Future Vision" className="h-9 w-auto object-contain filter invert brightness-200 drop-shadow" />
            <img src={LogoMSC} alt="MSC HK" className="h-9 w-auto object-contain filter invert brightness-200 drop-shadow" />
          </div>

          {cover.extraNote && (
            <div className="mt-6 text-[12px] text-white/85">{cover.extraNote}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const PrintToc: React.FC<{ sections: ReportSection[] }> = ({ sections }) => {
  return (
    <div className="print-only print-page">
      {/* 直接复用你的 Toc 组件；打印时我们给它一整页容器 */}
      <Toc sections={sections} />
    </div>
  );
};

const PrintBack: React.FC = () => {
  const back = (typeof window !== 'undefined' && window.__fvPdfConfig?.back) || {};
  return (
    <div
      className="print-only print-page relative overflow-hidden [&_*]:m-0"
      style={{
        width: '210mm',
        height: '297mm',
        breakInside: 'avoid',
        pageBreakBefore: 'always',
        pageBreakAfter: 'always',
      }}
      data-print-page="back"
    >
      {/* 背景图轻度暗化 */}
      <img src={CoverBg} alt="Back background" className="absolute inset-0 w-full h-full object-cover block" />
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative h-full grid grid-cols-2 gap-8 px-12 py-10">
        {/* 左侧文字信息 */}
        <div className="flex flex-col justify-center">
          <div className="text-2xl font-extrabold text-violet-800 tracking-wide">{back.headline || 'Contact Us'}</div>
          <div className="mt-6 space-y-2 text-[14px] text-gray-900">
            <div>WeChat | Future_Vision_MSC</div>
            <div>Website | {back.website || 'https://mscfv.com/futureVision/'}</div>
            <div>Email | {back.email || 'jinxia@mscfv.com'}</div>
            <div>Phone | {back.phone || '+86 18989485442'}</div>
            {back.address && <div>Address | {back.address}</div>}
          </div>

          {/* 底部徽标行 */}
          <div className="mt-10 flex items-center gap-6">
            <img src={LogoFV} alt="Future Vision" className="h-8 w-auto object-contain" />
            <img src={LogoMSC} alt="MSC HK" className="h-8 w-auto object-contain" />
          </div>
        </div>

        {/* 右侧二维码区 */}
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="rounded-md bg-white p-2 shadow-sm ring-1 ring-gray-200">
                <img src={QrOfficial} alt="Future Vision 公众号" className="h-28 w-28 object-contain" />
              </div>
              <div className="mt-2 text-[12px] text-gray-700">Future Vision 公众号</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-md bg-white p-2 shadow-sm ring-1 ring-gray-200">
                <img src={QrAssistant} alt="Assistant 小助手" className="h-28 w-28 object-contain" />
              </div>
              <div className="mt-2 text-[12px] text-gray-700">Assistant 小助手</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-md bg-white p-2 shadow-sm ring-1 ring-gray-200">
                <img src={QrMiniApp} alt="Future Vision 小程序" className="h-28 w-28 object-contain" />
              </div>
              <div className="mt-2 text-[12px] text-gray-700">Future Vision 微信小程序</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-[12px] text-gray-700">
        © {new Date().getFullYear()} {back.copyrightOwner || 'Future Vision'}. All rights reserved.
      </div>
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
      {/* -------- 打印路线：封面 → 目录 → 正文 → 尾页 -------- */}
      <PrintCover />
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

      <PrintBack />

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

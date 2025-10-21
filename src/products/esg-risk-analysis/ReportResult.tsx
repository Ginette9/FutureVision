import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIGenerationLoader from '@/components/AIGenerationLoader';

import { parseReportHtml, ReportSection } from './ReportResult/parseReportHtml';
import Toc from './ReportResult/Toc';
import PrintToc from './ReportResult/PrintToc';
import PrintReportSection from './ReportResult/PrintReportSection';
import ReportSectionBlock from './ReportResult/ReportSection';
import ReportSectionPrint from './ReportResult/ReportSectionPrint';
import { scrapeUrlContent, buildScrapeUrl } from '@/lib/utils';

import { IntroductionSection } from './ReportResult/IntroductionSection';
import { PayAttentionSection } from './ReportResult/PayAttentionSection';
import { CSRSection } from './ReportResult/CsrSection';
import { CsrLabelsSection } from './ReportResult/CsrLabelsSection';
import { DueDiligenceSection } from './ReportResult/DueDiligenceSection';
import { AboutMvoSection } from './ReportResult/AboutMvoSection';
import { ContactSection } from './ReportResult/ContactSection';
import { DisclaimerSection } from './ReportResult/DisclaimerSection';
import PDFReportGenerator from '@/components/PDFReportGenerator';

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

const PrintTocComponent: React.FC<{ sections: ReportSection[] }> = ({ sections }) => {
  return <PrintToc sections={sections} />;
};

function ReportResult() {
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem('riskAnalysisData');
    if (!savedData) {
      navigate('/esg-risk-analysis');
      return;
    }

    // 检查是否应该显示AI加载器（只有从首页跳转时才显示）
    const showLoader = sessionStorage.getItem('showAILoader') === 'true';
    if (showLoader) {
      setShouldShowLoader(true);
      setIsLoading(true);
      // 清除标记，避免刷新页面时重复显示
      sessionStorage.removeItem('showAILoader');
    }

    const fetchData = async () => {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);

        // 获取报告内容
        const url = buildScrapeUrl(parsed.industry.id, parsed.country.id);
        const htmlContent = await scrapeUrlContent(url);
        
        if (htmlContent) {
          const parsedSections = parseReportHtml(htmlContent);
          setSections(parsedSections);
          setDataLoaded(true);
        }

        // 移除：避免在数据加载完毕时提前隐藏 Loader，由 AIGenerationLoader 完成后再隐藏
        // if (showLoader) {
        //   setIsLoading(false);
        // }
      } catch (error) {
        console.error('Error loading report data:', error);
        setErrorMsg('Failed to load report data');
        setDataLoaded(true);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 显示AI加载器
  if (shouldShowLoader && (!dataLoaded || isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AIGenerationLoader formData={formData} onComplete={() => setIsLoading(false)} />
      </div>
    );
  }

  if (errorMsg) return <div className="p-10 text-red-600">{errorMsg}</div>;

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
      {/* 打印封面页 */}
      <div 
        className="print-only print-page cover-page" 
        data-print-page="cover"
        style={{
          margin: 0,
          padding: 0,
          border: 0,
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img 
          src={PdfCover} 
          alt="Cover" 
          style={{
            position: 'absolute',
            top: '-1px',
            left: '-1px',
            width: 'calc(100% + 2px)',
            height: 'calc(100% + 2px)',
            objectFit: 'fill',
            margin: 0,
            padding: 0,
            border: 0,
            display: 'block',
            zIndex: 99999,
          }}
        />
      </div>

      {/* 打印目录页 */}
      <PrintTocComponent sections={sections} />

      {/* 打印内容页 - 介绍部分 */}
      {formData && (
        <div className="print-only print-page print-intro-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section id="introduction" className="space-y-6">
              <IntroductionSection
                productNames={[formData.industry.name]}
                countryNames={[formData.country.name]}
                pdfLink={``}
                introHtml={introSection?.html}
              />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - 注意事项部分 */}
      {payAttentionSection?.html && (
        <div className="print-only print-page print-attention-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="space-y-4">
              <PayAttentionSection html={payAttentionSection.html} />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - 风险分析 */}
      {riskAnalysisSection?.categories && (
        <div className="print-only print-page print-risk-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section id="risk-analysis-print" className="space-y-6">
              <div className="mb-6">
                {/* 统一的标题区域样式 */}
                <div className="flex items-center space-x-4 py-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-gray-900">{riskAnalysisSection.title}</h2>
                    <p className="text-gray-600 mt-1">Comprehensive risk assessment and recommendations</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Below you will find the results of the risk analysis based on your submitted answers.
                    Would you like to switch your product or country?
                  </p>
                  <a className="text-blue-700 underline hover:no-underline text-sm" target="_blank" href="/esg-risk-analysis">
                    Fill out the ESG Risk Form again
                  </a>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Risk Summary</h3>
                      <p className="text-gray-600 text-sm">Total risks identified in your analysis</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {riskAnalysisSection.categories.reduce(
                          (sum, cat) =>
                            sum +
                            cat.themes.reduce(
                              (tSum, theme) => tSum + (theme.riskCount ?? theme.risks.length),
                              0
                            ),
                          0
                        )}
                      </div>
                      <div className="text-sm text-gray-500">risks found</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="print-risk-analysis page-break-inside-avoid">
                <PrintReportSection categories={riskAnalysisSection.categories} />
              </div>
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - CSR部分 */}
      {csrSection?.html && (
        <div className="print-only print-page print-csr-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="page-break-inside-avoid">
              <CSRSection html={csrSection.html} />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - CSR标签部分 */}
      {csrLabelsSection?.html && (
        <div className="print-only print-page print-csr-labels-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="page-break-inside-avoid">
              <CsrLabelsSection html={csrLabelsSection.html} />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - 尽职调查部分 */}
      {dueDiligenceSection?.html && (
        <div className="print-only print-page print-due-diligence-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="page-break-inside-avoid">
              <DueDiligenceSection />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - 关于MVO部分 */}
      {aboutMvoSection?.html && (
        <div className="print-only print-page print-about-mvo-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="page-break-inside-avoid">
              <AboutMvoSection />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - 联系方式部分 */}
      {contactSection?.html && (
        <div className="print-only print-page print-contact-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="page-break-inside-avoid">
              <ContactSection />
            </section>
          </div>
        </div>
      )}

      {/* 打印内容页 - 免责声明部分 */}
      {disclaimerSection?.html && (
        <div className="print-only print-page print-disclaimer-section">
          <div style={{
            padding: '15mm 12mm',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            position: 'relative'
          }}>
            <section className="page-break-inside-avoid">
              <DisclaimerSection />
            </section>
          </div>
        </div>
      )}

      {/* 打印尾页 */}
      <div 
        className="print-only print-page back-page" 
        data-print-page="back"
        style={{
          margin: 0,
          padding: 0,
          border: 0,
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img 
          src={PdfBack} 
          alt="Back Cover" 
          style={{
            position: 'absolute',
            top: '-1px',
            left: '-1px',
            width: 'calc(100% + 2px)',
            height: 'calc(100% + 2px)',
            objectFit: 'fill',
            margin: 0,
            padding: 0,
            border: 0,
            display: 'block',
            zIndex: 99999,
          }}
        />
      </div>

      {/* 屏幕显示内容 */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 screen-only">
        {/* 页面头部 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">ESG Risk Analysis Report</h1>
                {formData && (
                  <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600 truncate">
                    {formData.industry.name} • {formData.country.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="hidden sm:inline">Print Report</span>
                  <span className="sm:hidden">Print</span>
                </button>
                {/* 暂时隐藏PDF导出功能 - 待调试完成后恢复 */}
                {false && formData && (
                  <PDFReportGenerator 
                    countryId={formData.country.id}
                    industryId={formData.industry.id}
                    countryName={formData.country.name}
                    industryName={formData.industry.name}
                  />
                )}
                <button 
                  onClick={() => navigate('/esg-risk-analysis')}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="hidden sm:inline">New Analysis</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:gap-8 gap-6">
            {/* 侧边栏 - 目录 */}
            <aside className="w-full lg:w-80 order-2 lg:order-1">
              <div className="lg:sticky lg:top-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
                  <Toc sections={sections} />
                </div>
              </div>
            </aside>

            {/* 主内容区域 */}
            <main className="flex-1 order-1 lg:order-2">
              <div className="space-y-6 sm:space-y-8">
                {/* 介绍部分 */}
                {formData && (
                  <section id="introduction" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <IntroductionSection
                      productNames={[formData.industry.name]}
                      countryNames={[formData.country.name]}
                      pdfLink={``}
                      introHtml={introSection?.html}
                    />
                  </section>
                )}

                {/* 重要注意事项 */}
                {payAttentionSection?.html && (
                  <section id="important-to-consider" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <PayAttentionSection html={payAttentionSection.html} />
                  </section>
                )}

                {/* 风险分析部分 */}
                {riskAnalysisSection?.categories && (
                  <section id="risk-analysis" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="mb-6 sm:mb-8">
                      {/* 简洁标题区域 */}
                      <div className="flex items-center space-x-4 py-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-3xl font-light text-gray-900">{riskAnalysisSection.title}</h2>
                          <p className="text-gray-600 mt-1">Comprehensive ESG risk assessment and analysis</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                        <p className="text-gray-700 mb-4 text-sm sm:text-base">
                          Below you will find the results of the risk analysis based on your submitted answers.
                          Would you like to switch your product or country?
                        </p>
                        <a 
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base" 
                          href="/"
                        >
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Fill out the ESG Risk Form again
                        </a>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 sm:p-6 gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">Risk Summary</h3>
                          <p className="text-gray-600 text-sm sm:text-base">Total risks identified in your analysis</p>
                        </div>
                        <div className="text-center sm:text-right flex-shrink-0">
                          <div className="text-2xl sm:text-3xl font-bold text-red-600">
                            {riskAnalysisSection.categories.reduce(
                              (sum, cat) =>
                                sum +
                                cat.themes.reduce(
                                  (tSum, theme) => tSum + (theme.riskCount ?? theme.risks.length),
                                  0
                                ),
                              0
                            )}
                          </div>
                          <div className="text-sm text-gray-500">risks found</div>
                        </div>
                      </div>
                    </div>

                    <ReportSectionBlock categories={riskAnalysisSection.categories} />
                  </section>
                )}

                {/* 其他部分 */}
                {csrSection?.html && (
                  <section id="relevant-organizations" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <CSRSection html={csrSection.html} />
                  </section>
                )}
                
                {csrLabelsSection?.html && (
                  <section id="esg-labels-supply-chain-initiatives-guidelines" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <CsrLabelsSection html={csrLabelsSection.html} />
                  </section>
                )}
                
                {dueDiligenceSection?.html && (
                  <section id="due-diligence" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <DueDiligenceSection />
                  </section>
                )}
                
                {aboutMvoSection?.html && (
                  <section id="about-msc-hk" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <AboutMvoSection />
                  </section>
                )}
                
                {contactSection?.html && (
                  <section id="contact" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <ContactSection />
                  </section>
                )}
                
                {disclaimerSection?.html && (
                  <section id="disclaimer" className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
                    <DisclaimerSection />
                  </section>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReportResult;
